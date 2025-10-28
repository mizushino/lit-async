import { noChange } from 'lit';
import { AsyncDirective, directive } from 'lit/async-directive.js';

import { subscribe, unsubscribe } from './cache.js';
import { isAsyncIterable, isPromise, type AsyncState } from './types.js';

/**
 * A directive that renders the resolved value of a promise or async generator.
 */
class TrackDirective<T = unknown> extends AsyncDirective {
  private state?: AsyncState<T>;
  private transform: ((value: T) => unknown) | undefined;
  private subscriber?: (value: unknown) => void;
  private lastRawValue: T | undefined = undefined;
  private hasValue = false;

  render(state: AsyncState<T>, transform?: (value: T) => unknown): unknown {
    if (this.state !== state) {
      if (this.subscriber && isAsyncIterable(this.state)) {
        unsubscribe(this.state, this.subscriber);
      }

      this.state = state;
      this.transform = transform;
      this.hasValue = false;

      if (isPromise(state)) {
        state
          .then((value) => {
            if (this.state === state) {
              this.lastRawValue = value;
              this.hasValue = true;
              const transformed = this.transform ? this.transform(value) : value;
              this.setValue(transformed);
            }
          })
          .catch((error) => {
            console.error('Error resolving Promise:', error);
            if (this.state === state) {
              this.lastRawValue = undefined;
              this.hasValue = true;
              this.setValue(undefined);
            }
          });
      } else if (isAsyncIterable(state)) {
        this.subscriber = (value: T) => {
          if (this.state === state) {
            this.lastRawValue = value;
            this.hasValue = true;
            const transformed = this.transform ? this.transform(value) : value;
            this.setValue(transformed);
          }
        };
        subscribe(state, this.subscriber);
      } else {
        // Synchronous value
        this.lastRawValue = state;
        this.hasValue = true;
        this.transform = transform;
        return transform ? transform(state) : state;
      }
      return noChange;
    }

    this.transform = transform;
    if (this.hasValue) {
      return this.transform ? this.transform(this.lastRawValue!) : this.lastRawValue;
    }

    return noChange;
  }

  disconnected(): void {
    if (this.subscriber && isAsyncIterable(this.state)) {
      unsubscribe(this.state, this.subscriber);
    }
  }

  reconnected(): void {
    if (this.subscriber && isAsyncIterable(this.state)) {
      subscribe(this.state, this.subscriber);
    }
  }
}

const trackDirective = directive(TrackDirective);

export const track = <T = unknown>(
  state: AsyncState<T>,
  transform?: (value: T) => unknown
) => trackDirective(state, transform);
