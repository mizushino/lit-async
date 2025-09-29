import { noChange } from 'lit';
import { AsyncDirective, directive } from 'lit/async-directive.js';

import { isAsyncIterable, isPromise, type AsyncState } from './utils';

/**
 * A directive that renders the resolved value of a promise or an async generator.
 */
class TrackDirective extends AsyncDirective {
  private state?: AsyncState<unknown>;
  private transform: ((value: unknown) => unknown) | undefined;

  render(state: AsyncState<unknown>, transform?: (value: unknown) => unknown): unknown {
    if (this.state !== state) {
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
        const iterable = state;
        const iterator = iterable[Symbol.asyncIterator]();
        const getNextValue = (): void => {
          iterator
            .next()
            .then((result) => {
              if (this.state === iterable) {
                if (!result.done) {
                  this.setValue(this.transform ? this.transform(result.value) : result.value);
                  getNextValue();
                }
              }
            })
            .catch((error) => {
              console.error('Error in AsyncIterable:', error);
              if (this.state === iterable) {
                this.setValue(undefined);
              }
            });
        };
        getNextValue();
      } else {
        return this.transform ? this.transform(state) : state;
      }
      return noChange;
    }
    return noChange;
  }
}

export const track = directive(TrackDirective);
