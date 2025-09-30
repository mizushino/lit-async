# Lit-Async

A library of lit-html directives for handling async operations.

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

```typescript
html`Count: ${track(count())}`
```

#### With Transform Function

Provide a second argument to transform the resolved/yielded value before rendering.

```typescript
html`Count * 2: ${track(count(), (value) => value * 2)}`
```

#### Attribute

You can bind an async generator to an element's attribute. Lit handles this efficiently.

```typescript
import { styleMap } from 'lit/directives/style-map.js';

html`
  <div style=${track(colors(), (color) => styleMap({backgroundColor: color}))}>
    This div's background color is set by an async generator.
  </div>
`
```

Or using string interpolation:

```typescript
html`<div style=${track(colors(), (color) => `background-color: ${color}`)}>...</div>`
```

Or as a simple attribute:

```typescript
html`<div style="background-color: ${track(colors())}">...</div>`
```

#### Property

`track` can be used as a property directive to set an element's property to the resolved/yielded value.

```typescript
html`<input type="number" .value=${track(count())} readonly>`
```

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
