import { noChange } from 'lit';
import { AsyncDirective, directive } from 'lit/async-directive.js';

import { subscribe, unsubscribe } from './cache.js';
import { isAsyncIterable, isPromise, type AsyncState } from './types.js';

/**
 * A directive that renders the resolved value of a promise or async generator.
 */
class TrackDirective extends AsyncDirective {
  private state?: AsyncState<unknown>;
  private transform: ((value: unknown) => unknown) | undefined;
  private subscriber?: (value: unknown) => void;

  render(state: AsyncState<unknown>, transform?: (value: unknown) => unknown): unknown {
    if (this.state !== state) {
      if (this.subscriber && isAsyncIterable(this.state)) {
        unsubscribe(this.state, this.subscriber);
      }

      this.state = state;
      this.transform = transform;

      if (isPromise(state)) {
        state
          .then((value) => {
            if (this.state === state) {
              this.setValue(this.transform ? this.transform(value) : value);
            }
          })
          .catch((error) => {
            console.error('Error resolving Promise:', error);
            if (this.state === state) {
              this.setValue(undefined);
            }
          });
      } else if (isAsyncIterable(state)) {
        this.subscriber = (value: unknown) => {
          if (this.state === state) {
            this.setValue(this.transform ? this.transform(value) : value);
          }
        };
        subscribe(state, this.subscriber);
      } else {
        return this.transform ? this.transform(state) : state;
      }
      return noChange;
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

export const track = directive(TrackDirective);
