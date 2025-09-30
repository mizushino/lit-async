import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {track} from '../src/track.js';
import {loading} from '../src/loading.js';
import {styleMap} from 'lit/directives/style-map.js';

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

  async fetch() {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return 'Data loaded!';
  }

  async *count() {
    for (let i = 1; ; i++) {
      yield i;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  async *colors() {
    const colors = ['lightyellow', 'lightpink', 'lightgreen', 'lightblue', 'lightcyan'];
    let i = 0;
    for (;;) {
      yield colors[i++ % colors.length];
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  renderCommonCode() {
    return html`
      <div>
        <h2>Common Definitions</h2>
        <p>The following functions and properties are defined on the component for use in the examples below.</p>
        <pre><code>const myPromise = new Promise((resolve) =>
  setTimeout(() => resolve('Hello from a promise!'), 3000)
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
  const colors = ['lightyellow', 'lightpink', 'lightgreen', 'lightblue', 'lightcyan'];
  let i = 0;
  for (;;) {
    yield colors[i++ % colors.length];
    await new Promise((r) => setTimeout(r, 1000));
  }
}</code></pre>
      </div>
    `;
  }

  renderBasicTrack() {
    return html`
      <div>
        <h2>Child Content</h2>
        <p>Render the resolved value of a promise directly into the DOM.</p>
        <p>Value: ${track(this.myPromise)}</p>
        <pre><code>html\`Value: \${track(this.myPromise)}\`</code></pre>
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
        <p>Count: ${track(this.count())}</p>
        <pre><code>html\`Count: \${track(this.count())}\`</code></pre>
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
        <p>
          Count * 2:
          ${track(this.count(), (value) => (value as number) * 2)}
        </p>
        <pre><code>html\`Count * 2: \${track(this.count(), (value) => value * 2)}\`</code></pre>
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
          style=${track(this.colors(), (color) =>
            styleMap({backgroundColor: color as string})
          )}
        >
          This div's background color is set by an async generator.
        </div>

        <pre><code>style="background-color: \${track(this.colors())}"</code></pre>
        or
        <pre><code>style=\${track(this.colors(), (color) => \`background-color: \${color}\`)}</code></pre>
        or
        <pre><code>style=\${track(this.colors(), (color) => styleMap({backgroundColor: color as string}))}</code></pre>
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
        ${track(loading(this.fetch(), 'Fetching data...'))}
        <pre><code>html\`\${track(loading(this.fetch(), 'Fetching data...'))}\`</code></pre>
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
      ${this.renderTrackWithLoading()}
    `;
  }
}
