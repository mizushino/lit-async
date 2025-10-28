import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {track} from '../src/track.js';
import {sync} from '../src/decorator.js';
import {loading} from '../src/loading.js';

@customElement('lit-async-examples')
export class LitAsyncExamples extends LitElement {
  static styles = css`
    div {
      border: 1px solid black;
      padding: 1em;
      margin: 1em 0;
    }

    .demo-box {
      transition: background-color 0.5s ease-in-out;
      padding: 1em;
    }

    h2 {
      margin-top: 0;
    }

    pre {
      background-color: #f4f4f4;
      border: 1px solid #ddd;
      padding: 1em;
      border-radius: 4px;
      white-space: pre-wrap;
      font-size: 0.9em;
    }

    code {
      font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    }
  `;

  myPromise = new Promise((resolve) =>
    setTimeout(() => resolve('Hello from a promise!'), 1000)
  );

  async fetchData() {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return 'Data loaded!';
  }

  async *count() {
    for (let i = 1; ; i++) {
      yield i;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  _count = this.count();

  async *colors() {
    const colors = ['lightyellow', 'lightpink', 'lightgreen', 'lightcyan'];
    let i = 0;
    for (;;) {
      yield colors[i++ % colors.length];
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  _colors = this.colors();

  // Decorator examples
  @sync(function () {
    return (async function* () {
      for (let i = 100; ; i++) {
        yield i;
        await new Promise((r) => setTimeout(r, 1500));
      }
    })();
  })
  accessor decoratedCount: number | undefined;

  @sync(
    () =>
      new Promise<string>((resolve) =>
        setTimeout(() => resolve('Decorator Promise Resolved!'), 2000)
      )
  )
  accessor decoratedPromise: string | undefined;

  renderCommonCode() {
    return html`
      <div>
        <h2>Common Definitions</h2>
        <p>The following functions and properties are defined on the component for use in the examples below.</p>
        <pre><code>myPromise = new Promise((resolve) =>
  setTimeout(() => resolve('Hello from a promise!'), 1000)
);

async fetchData() {
  await new Promise(resolve => setTimeout(resolve, 3000));
  return 'Data loaded!';
}

async *count() {
  for (let i = 1; ; i++) {
    yield i;
    await new Promise(r => setTimeout(r, 1000));
  }
}
_count = this.count();

async *colors() {
  const colors = ['lightyellow', 'lightpink', 'lightgreen', 'lightcyan'];
  let i = 0;
  for (;;) {
    yield colors[i++ % colors.length];
    await new Promise((r) => setTimeout(r, 1000));
  }
}
_colors = this.colors();</code></pre>
        <p><strong>Note:</strong> The generator instances (<code>_count</code>, <code>_colors</code>) are stored as properties to avoid creating new generators on each render, which would cause resource leaks.</p>
      </div>
    `;
  }

  renderBasicTrack() {
    return html`
      <div>
        <h2>Child Content</h2>
        <p>Render the resolved value of a promise directly into the DOM.</p>
        <div class="demo-box">${track(this.myPromise)}</div>
        <pre><code>html\`\${track(this.myPromise)}\`</code></pre>
      </div>
    `;
  }

  renderTrackWithAsyncGenerator() {
    return html`
      <div>
        <h2>with Async Generator</h2>
        <p>
          <code>track</code> also works with async generators, re-rendering
          whenever the generator yields a new value.
        </p>
        <div class="demo-box">Count: ${track(this._count)}</div>
        <pre><code>html\`Count: \${track(this._count)}\`</code></pre>
      </div>
    `;
  }

  renderTrackWithTransform() {
    return html`
      <div>
        <h2>with Transform Function</h2>
        <p>
          Provide a second argument to transform the resolved/yielded value before
          rendering.
        </p>
        <div class="demo-box">
          Count * 2:
          ${track(this._count, (value) => value * 2)}
        </div>
        <pre><code>html\`Count * 2: \${track(this._count, (value) => value * 2)}\`</code></pre>
      </div>
    `;
  }

  renderTrackWithAttribute() {
    return html`
      <div>
        <h2>Attribute</h2>
        <p>
          You can bind an async generator to an element's attribute.
          Lit handles this efficiently.
        </p>

        <div
          class="demo-box"
          style=${track(this._colors, (color) => `background-color: ${color}`)}
        >
          This div's background color is set by an async generator.
        </div>

        <pre><code>html\`&lt;div style=\${track(this._colors, (color) => \`background-color: \${color}\`)}&gt;...&lt;/div&gt;\`</code></pre>
      </div>
    `;
  }

  renderTrackWithProperty() {
    return html`
      <div>
        <h2>Property</h2>
        <p>
          <code>track</code> can be used as a property directive to set an
          element's property to the resolved/yielded value.
        </p>
        <div class="demo-box">
          <input type="number" .value=${track(this._count)} readonly>
        </div>
        <pre><code>html\`&lt;input type="number" .value=\${track(this._count)} readonly&gt;\`</code></pre>
      </div>
    `;
  }

  renderTrackWithLoading() {
    return html`
      <div>
        <h2>Helper: <code>loading()</code></h2>
        <p>
          Wrap a promise with <code>loading()</code> to show a fallback value while
          the promise is pending.
        </p>
        <div class="demo-box">
          ${track(loading(this.fetchData(), 'Fetching data...'))}
        </div>
        <pre><code>html\`\${track(loading(this.fetchData(), 'Fetching data...'))}\`</code></pre>
      </div>
    `;
  }

  renderSharedGenerator() {
    return html`
      <div>
        <h2>Shared Generator</h2>
        <p>
          Multiple <code>track</code> directives can share the same generator instance.
          All instances will receive the same values simultaneously.
        </p>
        <div class="demo-box">
          <p>First instance: ${track(this._count)}</p>
          <p>Second instance: ${track(this._count)}</p>
          <p>With transform (×10): ${track(this._count, (v) => v * 10)}</p>
        </div>
        <pre><code>// All three track() directives use the same this._count generator
html\`
  &lt;p&gt;First instance: \${track(this._count)}&lt;/p&gt;
  &lt;p&gt;Second instance: \${track(this._count)}&lt;/p&gt;
  &lt;p&gt;With transform (×10): \${track(this._count, (v) => v * 10)}&lt;/p&gt;
\`</code></pre>
      </div>
    `;
  }

  renderDecorator() {
    return html`
      <div>
        <h2>Decorator: <code>@sync()</code></h2>
        <p>
          Use the <code>@sync</code> decorator to automatically update a property
          with values from a Promise or AsyncIterable. The decorator accepts a factory
          function that returns the async state. <strong>Requires <code>accessor</code> keyword.</strong>
        </p>
        <div class="demo-box">
          <p>Decorated async generator: ${this.decoratedCount ?? 'Loading...'}</p>
          <p>Decorated promise: ${this.decoratedPromise ?? 'Loading...'}</p>
        </div>
        <pre><code>import { sync } from 'lit-async';

class MyElement extends LitElement {
  // Sync an async generator
  @sync(function() {
    return (async function*() {
      for (let i = 100; ; i++) {
        yield i;
        await new Promise(r => setTimeout(r, 1500));
      }
    })();
  })
  accessor decoratedCount: number | undefined;

  // Sync a promise
  @sync(() =>
    new Promise(resolve =>
      setTimeout(() => resolve('Decorator Promise Resolved!'), 2000)
    )
  )
  accessor decoratedPromise: string | undefined;

  render() {
    return html\`
      &lt;p&gt;Count: \${this.decoratedCount ?? 'Loading...'}&lt;/p&gt;
      &lt;p&gt;Promise: \${this.decoratedPromise ?? 'Loading...'}&lt;/p&gt;
    \`;
  }
}</code></pre>
        <p><strong>Note:</strong> The decorator automatically subscribes when the element is connected to the DOM and cleans up when disconnected.</p>
      </div>
    `;
  }

  render() {
    return html`
      <h1>LitAsync Examples</h1>
      ${this.renderCommonCode()}
      ${this.renderBasicTrack()}
      ${this.renderTrackWithAsyncGenerator()}
      ${this.renderTrackWithTransform()}
      ${this.renderTrackWithAttribute()}
      ${this.renderTrackWithProperty()}
      ${this.renderTrackWithLoading()}
      ${this.renderSharedGenerator()}
      ${this.renderDecorator()}
    `;
  }
}
