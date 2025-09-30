# Lit-Async

[![npm version](https://badge.fury.io/js/lit-async.svg)](https://www.npmjs.com/package/lit-async)
[![npm downloads](https://img.shields.io/npm/dm/lit-async.svg)](https://www.npmjs.com/package/lit-async)

A library of lit-html directives for handling async operations.

**✨ Key Features:**
- **Drop promises and async generators directly into templates** - No wrapper components needed
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

```typescript
const myPromise = new Promise((resolve) =>
  setTimeout(() => resolve('Hello from a promise!'), 1000)
);

async function fetch() {
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

#### Child Content

Render the resolved value of a promise directly into the DOM.

```typescript
import { html } from 'lit';
import { track } from 'lit-async';

html`${track(myPromise)}`
```

#### With Async Generator

`track` also works with async generators, re-rendering whenever the generator yields a new value.

**Important**: When using async generators with `track`, store the generator instance in a property to avoid creating new generators on each render. Creating a new generator on every render will cause resource leaks as old generators continue running.

**Ownership Policy**: `track` does not own the async sources it receives. It will not call `return()` on generators or `abort()` on promises. When a directive is disconnected from the DOM, it simply unsubscribes and ignores future values. You are responsible for managing the lifecycle of your generators and promises.

```typescript
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

```typescript
class MyElement extends LitElement {
  _count = count();

  render() {
    return html`Count * 2: ${track(this._count, (value) => value * 2)}`;
  }
}
```

#### Attribute

You can bind an async generator to an element's attribute. Lit handles this efficiently.

```typescript
import { styleMap } from 'lit/directives/style-map.js';

class MyElement extends LitElement {
  _colors = colors();

  render() {
    return html`
      <div style=${track(this._colors, (color) => styleMap({backgroundColor: color}))}>
        This div's background color is set by an async generator.
      </div>
    `;
  }
}
```

Or using string interpolation:

```typescript
html`<div style=${track(this._colors, (color) => `background-color: ${color}`)}>...</div>`
```

Or as a simple attribute:

```typescript
html`<div style="background-color: ${track(this._colors)}">...</div>`
```

#### Property

`track` can be used as a property directive to set an element's property to the resolved/yielded value.

```typescript
class MyElement extends LitElement {
  _count = count();

  render() {
    return html`<input type="number" .value=${track(this._count)} readonly>`;
  }
}
```

#### Shared Generator

Multiple `track` directives can share the same generator instance. All instances will receive the same values simultaneously.

```typescript
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

All three `track()` directives will display the same count value at the same time. The generator's values are cached and broadcast to all subscribers.

### `loading`

A helper function that wraps a promise with `loading()` to show a fallback value while the promise is pending.

```typescript
import { html } from 'lit';
import { track, loading } from 'lit-async';

html`${track(loading(fetch(), 'Fetching data...'))}`
```

You can also provide a custom template for the loading state:

```typescript
const loadingTemplate = html`<span>Please wait...</span>`;

html`${track(loading(fetch(), loadingTemplate))}`
```

## Examples

Run the development server to see interactive examples:

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.
