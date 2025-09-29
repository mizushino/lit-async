import type { TemplateResult } from 'lit';

import { isAsyncIterable, isPromise, type AsyncState } from './utils';

/**
 * Wraps an async operation in an async generator that first yields
 * the `loadingContent` and then the result of the operation.
 */
export async function* loading<T>(
  asyncOperation: AsyncState<T>,
  loadingContent: TemplateResult | string = 'Loading...'
): AsyncIterable<T | TemplateResult | string> {
  yield loadingContent;

  if (isPromise(asyncOperation)) {
    yield await asyncOperation;
  } else if (isAsyncIterable(asyncOperation)) {
    yield* asyncOperation;
  } else {
    yield asyncOperation;
  }
}
