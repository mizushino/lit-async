/**
 * A Promise, AsyncIterable, or a synchronous value.
 */
export type AsyncState<T> = Promise<T> | AsyncIterable<T> | T;

/**
 * Type guard to check if a value is a Promise.
 */
export function isPromise<T>(value: unknown): value is Promise<T> {
  return (
    value != null &&
    typeof (value as Promise<T>).then === 'function' &&
    typeof (value as Promise<T>).catch === 'function'
  );
}

/**
 * Type guard to check if a value is an AsyncIterable.
 * This includes AsyncGenerators.
 */
export function isAsyncIterable<T>(value: unknown): value is AsyncIterable<T> {
  return value != null && typeof (value as AsyncIterable<T>)[Symbol.asyncIterator] === 'function';
}
