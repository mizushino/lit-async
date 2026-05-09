interface IterableCache<T> {
  value: T | undefined;
  subscribers: Set<(value: T) => void>;
  iterator: AsyncIterator<T> | null;
}

/**
 * Cache for AsyncIterables to allow multiple consumers to share the same generator.
 */
const iterableCache = new WeakMap<AsyncIterable<unknown>, IterableCache<unknown>>();

export function subscribe<T>(
  iterable: AsyncIterable<T>,
  callback: (value: T) => void
): void {
  let cache = iterableCache.get(iterable as AsyncIterable<unknown>) as
    | IterableCache<T>
    | undefined;

  if (!cache) {
    cache = {
      value: undefined,
      subscribers: new Set(),
      iterator: null,
    };
    iterableCache.set(iterable as AsyncIterable<unknown>, cache as IterableCache<unknown>);
    cache.iterator = iterable[Symbol.asyncIterator]();
    startIterator(iterable, cache);
  }

  cache.subscribers.add(callback);

  if (cache.value !== undefined) {
    callback(cache.value);
  }
}

export function unsubscribe<T>(
  iterable: AsyncIterable<T>,
  callback: (value: T) => void
): void {
  const cache = iterableCache.get(iterable as AsyncIterable<unknown>) as
    | IterableCache<T>
    | undefined;
  if (!cache) return;

  cache.subscribers.delete(callback);

  if (cache.subscribers.size === 0) {
    iterableCache.delete(iterable as AsyncIterable<unknown>);
  }
}

function startIterator<T>(
  iterable: AsyncIterable<T>,
  cache: IterableCache<T>
): void {
  const getNextValue = (): void => {
    if (!cache.iterator) return;

    cache.iterator
      .next()
      .then((result) => {
        const currentCache = iterableCache.get(iterable as AsyncIterable<unknown>);
        if (currentCache !== cache) return;

        if (!result.done) {
          cache.value = result.value;
          cache.subscribers.forEach((subscriber) => subscriber(result.value));
          getNextValue();
        }
      })
      .catch((error) => {
        console.error('Error in AsyncIterable:', error);
        const currentCache = iterableCache.get(iterable as AsyncIterable<unknown>);
        if (currentCache !== cache) return;

        cache.subscribers.forEach((subscriber) => subscriber(undefined as T));
      });
  };
  getNextValue();
}