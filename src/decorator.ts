import type { ReactiveElement, ReactiveController } from 'lit';
import type { AsyncState } from './types.js';
import { isPromise, isAsyncIterable } from './types.js';

/**
 * Reactive controller that manages async state syncing
 */
class SyncController<T> implements ReactiveController {
  private cleanup?: () => void;

  constructor(
    private host: ReactiveElement,
    private key: string,
    private stateFactory: (this: any) => AsyncState<T>
  ) {
    this.host.addController(this);
  }

  hostConnected(): void {
    // Clean up any previous subscription
    if (this.cleanup) {
      this.cleanup();
    }

    // Call the factory with the host instance as 'this'
    const state = this.stateFactory.call(this.host);

    // Handle the async state
    if (isPromise(state)) {
      state.then(
        (value) => {
          (this.host as any)[this.key] = value;
          this.host.requestUpdate(this.key);
        },
        (error) => {
          console.error(`Error in @sync decorator for property ${this.key}:`, error);
        }
      );
    } else if (isAsyncIterable(state)) {
      let cancelled = false;

      (async () => {
        try {
          for await (const value of state) {
            if (cancelled) break;
            (this.host as any)[this.key] = value;
            this.host.requestUpdate(this.key);
          }
        } catch (error) {
          console.error(`Error in @sync decorator for property ${this.key}:`, error);
        }
      })();

      // Store cleanup function
      this.cleanup = () => {
        cancelled = true;
      };
    } else {
      // Direct value
      (this.host as any)[this.key] = state;
      this.host.requestUpdate(this.key);
    }
  }

  hostDisconnected(): void {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = undefined;
    }
  }
}

/**
 * Decorator that syncs an async state and automatically updates the decorated property
 * with the latest value from a Promise or AsyncIterable.
 *
 * The decorator accepts a factory function that will be called for each component instance
 * to create the async state to sync.
 *
 * @example
 * ```ts
 * class MyElement extends LitElement {
 *   @sync(() => fetchData())
 *   accessor data: string | undefined;
 *
 *   @sync(() => pollingGenerator())
 *   accessor liveData: number | undefined;
 *
 *   @sync(function() { return this.myAsyncMethod() })
 *   accessor computed: string | undefined;
 * }
 * ```
 *
 * @param stateFactory - A function that returns the async state to sync (Promise, AsyncIterable, or direct value)
 * @returns A property decorator function
 */
export function sync<T>(
  stateFactory: (this: any) => AsyncState<T>
) {
  return function (
    target: ClassAccessorDecoratorTarget<any, T | undefined>,
    context: ClassAccessorDecoratorContext
  ): ClassAccessorDecoratorResult<any, T | undefined> {
    const key = context.name as string;

    context.addInitializer(function (this: ReactiveElement) {
      new SyncController(this, key, stateFactory);
    });

    return {
      get() {
        return target.get.call(this);
      },
      set(value: T | undefined) {
        target.set.call(this, value);
      },
    };
  };
}
