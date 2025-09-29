# Lit-Async

A library of lit-html directives for handling async operations.

## Installation

```sh
npm install lit-async
```

## Usage

### `track`

A directive that renders the resolved value of a promise or an async generator.

#### Basic Usage

When used in a child expression, `track` renders the resolved value directly.

```typescript
import { html } from 'lit';
import { track } from 'lit-async';

const myPromise = new Promise((resolve) => setTimeout(() => resolve('Hello, world!'), 1000));

html`${track(myPromise)}` // Renders "Hello, world!"
```

### `loading`

A helper function that works with `track` to show a loading indicator while an async operation is pending.

```typescript
import { html } from 'lit';
import { track, loading } from 'lit-async';

// An async function that simulates fetching data
async function fetchData() {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return 'Data loaded!';
}

// Renders "Loading..." first.
// After 1.5 seconds, it is replaced with "Data loaded!".
html`${track(loading(fetchData()))}`
```

You can also provide a custom template for the loading state as a second argument:

```typescript
import { html } from 'lit';
import { track, loading } from 'lit-async';

// ... (fetchData is defined as above)

const loadingTemplate = html`<span>Please wait...</span>`;

// Renders the custom template first.
// After 1.5 seconds, it is replaced with "Data loaded!".
html`${track(loading(fetchData(), loadingTemplate))}`
```


### More `track` Examples

#### With a Transform Function

You can provide an optional transform function as the second argument to `track`. This function will be called with any value that `track` processes—whether it's a resolved promise or a yielded value from an async generator.

```typescript
import { html } from 'lit';
import { track } from 'lit-async';

async function* count() {
  yield 1;
  await new Promise(r => setTimeout(r, 500));
  yield 2;
  await new Promise(r => setTimeout(r, 500));
  yield 3;
}

// Renders "2", then "4", then "6", with a 500ms delay between each update.
html`${track(count(), (value) => (value as number) * 2)}`
```

#### With an Async Generator

`track` also works with async generators, re-rendering whenever the generator yields a new value.

```typescript
import { html } from 'lit';
import { track } from 'lit-async';

async function* myGenerator() {
  yield 'tick';
  await new Promise((resolve) => setTimeout(resolve, 1000));
  yield 'tock';
}

html`${track(myGenerator())}` // Renders "tick", then "tock"
```

#### As a Property Directive

`track` can be used as a property directive to set an element's property to the resolved value of a promise.

```typescript
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { track } from 'lit-async';

@customElement('my-element')
export class MyElement extends LitElement {
  @property()
  myPromise = new Promise((resolve) => setTimeout(() => resolve('Hello, world!'), 1000));

  render() {
    return html`<div .textContent=${track(this.myPromise)}></div>`;
  }
}
```

#### As an Attribute Directive

`track` can be used to set an attribute value from a promise.

```typescript
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { track } from 'lit-async';

@customElement('my-element')
export class MyElement extends LitElement {
  @property()
  classPromise = new Promise((resolve) => setTimeout(() => resolve('my-class'), 1000));

  render() {
    return html`<div class=${track(this.classPromise)}>Hello from attribute</div>`;
  }
}
```
