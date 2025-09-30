interface IterableCache {
  value: unknown;
  subscribers: Set<(value: unknown) => void>;
  iterator: AsyncIterator<unknown> | null;
}

/**
 * Cache for AsyncIterables to allow multiple consumers to share the same generator.
 */
const iterableCache = new WeakMap<AsyncIterable<unknown>, IterableCache>();

export function subscribe(
  iterable: AsyncIterable<unknown>,
  callback: (value: unknown) => void
): void {
  let cache = iterableCache.get(iterable);

  if (!cache) {
    cache = {
      value: undefined,
      subscribers: new Set(),
      iterator: null,
    };
    iterableCache.set(iterable, cache);
    cache.iterator = iterable[Symbol.asyncIterator]();
    startIterator(iterable, cache);
  }

  cache.subscribers.add(callback);

  if (cache.value !== undefined) {
    callback(cache.value);
  }
}

export function unsubscribe(
  iterable: AsyncIterable<unknown>,
  callback: (value: unknown) => void
): void {
  const cache = iterableCache.get(iterable);
  if (!cache) return;

  cache.subscribers.delete(callback);

  if (cache.subscribers.size === 0) {
    iterableCache.delete(iterable);
  }
}

function startIterator(
  iterable: AsyncIterable<unknown>,
  cache: IterableCache
): void {
  const getNextValue = (): void => {
    if (!cache.iterator) return;

    cache.iterator
      .next()
      .then((result) => {
        const currentCache = iterableCache.get(iterable);
        if (currentCache !== cache) return;

        if (!result.done) {
          cache.value = result.value;
          cache.subscribers.forEach((subscriber) => subscriber(result.value));
          getNextValue();
        }
      })
      .catch((error) => {
        console.error('Error in AsyncIterable:', error);
        const currentCache = iterableCache.get(iterable);
        if (currentCache !== cache) return;

        cache.subscribers.forEach((subscriber) => subscriber(undefined));
      });
  };
  getNextValue();
}