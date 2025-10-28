# Lit-Async

[![npm version](https://badge.fury.io/js/lit-async.svg)](https://www.npmjs.com/package/lit-async)
[![npm downloads](https://img.shields.io/npm/dm/lit-async.svg)](https://www.npmjs.com/package/lit-async)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Tree Shakeable](https://img.shields.io/badge/Tree%20Shakeable-Yes-brightgreen)

A library of lit-html directives and decorators for handling async operations.

**✨ Key Features:**
- **Drop promises and async generators directly into templates** - No wrapper components needed
- **`@sync` decorator for reactive properties** - Automatically sync async state to properties
- **Works everywhere** - Child content, attributes, and properties
- **Share generators across multiple directives** - Cached values broadcast to all subscribers
- **Type-safe** - Full TypeScript support with automatic type inference

## Installation

```sh
npm install lit-async
```

## Usage

### Common Definitions

The following functions and properties are used in the examples below:

```ts
const myPromise = new Promise((resolve) =>
  setTimeout(() => resolve('Hello from a promise!'), 1000)
);

async function fetchData() {
  await new Promise(resolve => setTimeout(resolve, 3000));
  return 'Data loaded!';
}

async function *count() {
  for (let i = 1; ; i++) {
    yield i;
    await new Promise(r => setTimeout(r, 1000));
  }
}

async function *colors() {
  const colors = ['lightyellow', 'lightpink', 'lightgreen', 'lightcyan'];
  let i = 0;
  for (;;) {
    yield colors[i++ % colors.length];
    await new Promise((r) => setTimeout(r, 1000));
  }
}
```

### `track`

A directive that renders the resolved value of a promise or an async generator.

```ts
track<T>(state: Promise<T> | AsyncIterable<T> | T, transform?: (value: T) => unknown): unknown
```

**Ownership Policy**: `track` does not own the async sources it receives. It will not call `return()` on generators or `abort()` on promises. When disconnected from the DOM, it simply unsubscribes and ignores future values. You are responsible for managing the lifecycle of your async sources.

**Error Handling**: If a promise rejects or an async generator throws, `track` logs the error to the console and renders `undefined`.

**Re-render Behavior**: `track` caches the last value received. When the component re-renders but the generator hasn't yielded new values, `track` displays the last cached value instead of showing nothing.

#### Child Content

Render the resolved value of a promise directly into the DOM.

```ts
import { html } from 'lit';
import { track } from 'lit-async';

html`${track(myPromise)}`
```

#### With Async Generator

`track` also works with async generators, re-rendering whenever the generator yields a new value.

**Important**: When using async generators with `track`, store the generator instance in a property to avoid creating new generators on each render. Creating a new generator on every render will cause resource leaks as old generators continue running.

```ts
// ✅ Good: Store generator instance
class MyElement extends LitElement {
  _count = count();

  render() {
    return html`Count: ${track(this._count)}`;
  }
}

// ❌ Bad: Creates new generator each render
render() {
  return html`Count: ${track(count())}`;
}
```

#### With Transform Function

Provide a second argument to transform the resolved/yielded value before rendering.

```ts
class MyElement extends LitElement {
  _count = count();

  render() {
    return html`Count * 2: ${track(this._count, (value) => value * 2)}`;
  }
}
```

#### Attribute

You can bind an async generator to an element's attribute. Lit handles this efficiently.

```ts
class MyElement extends LitElement {
  _colors = colors();

  render() {
    return html`
      <div style=${track(this._colors, (color) => `background-color: ${color}`)}>
        This div's background color is set by an async generator.
      </div>
    `;
  }
}
```

#### Property

`track` can be used as a property directive to set an element's property to the resolved/yielded value.

```ts
class MyElement extends LitElement {
  _count = count();

  render() {
    return html`<input type="number" .value=${track(this._count)} readonly>`;
  }
}
```

#### Shared Generator

Multiple `track` directives can share the same generator instance. All instances will receive the same values simultaneously.

```ts
class MyElement extends LitElement {
  _count = count();

  render() {
    return html`
      <p>First instance: ${track(this._count)}</p>
      <p>Second instance: ${track(this._count)}</p>
      <p>With transform (×10): ${track(this._count, (v) => v * 10)}</p>
    `;
  }
}
```

All three `track()` directives will display the same count value at the same time.

**How it works**: The generator runs once, and each yielded value is cached and broadcast to all `track()` directives using that generator. When a new `track()` subscribes to an already-running generator, it immediately receives the last yielded value (if any), ensuring all subscribers stay synchronized.

### `loading`

A helper that shows a fallback value while waiting for async operations to complete.

```ts
loading<T>(state: Promise<T> | AsyncIterable<T> | T, loadingValue: unknown, transform?: (value: T) => unknown): AsyncIterable<unknown>
```

```ts
import { html } from 'lit';
import { track, loading } from 'lit-async';

html`${track(loading(fetchData(), 'Fetching data...'))}`
```

You can also provide a custom template for the loading state:

```ts
const loadingTemplate = html`<span>Please wait...</span>`;

html`${track(loading(fetchData(), loadingTemplate))}`
```

### `@sync`

A decorator that automatically syncs a property with values from a Promise or AsyncIterable.

```ts
sync<T>(stateFactory: (this: any) => Promise<T> | AsyncIterable<T> | T): PropertyDecorator
```

**Requirements**:
- Must use the `accessor` keyword with the property
- TypeScript must NOT have `experimentalDecorators: true` (uses standard decorators)

**Basic Example**:

```ts
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { sync } from 'lit-async';

@customElement('my-element')
class MyElement extends LitElement {
  // Sync an async generator
  @sync(() => (async function*() {
    for (let i = 0; ; i++) {
      yield i;
      await new Promise(r => setTimeout(r, 1000));
    }
  })())
  accessor count: number | undefined;

  render() {
    return html`<p>Count: ${this.count ?? 'Loading...'}</p>`;
  }
}
```

**Using `this` context**:

```ts
@customElement('user-profile')
class UserProfile extends LitElement {
  @property() userId!: string;

  // Factory function can access 'this'
  @sync(function() {
    return fetch(`/api/users/${this.userId}`).then(r => r.json());
  })
  accessor userData: User | undefined;

  render() {
    return html`<p>User: ${this.userData?.name ?? 'Loading...'}</p>`;
  }
}
```
