import {html, css, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {track} from '../src/track.js';
import {loading} from '../src/loading.js';

@customElement('lit-async-examples')
export class LitAsyncExamples extends LitElement {
  static styles = css`
    div {
      border: 1px solid black;
      padding: 1em;
      margin: 1em 0;
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

  myPromise = new Promise((resolve) => setTimeout(() => resolve('Hello from a promise!'), 1000));

  async fetch() {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return 'Data loaded!';
  }

  async *count() {
    for (let i = 1; ; i++) {
      yield i;
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  renderCommonCode() {
    return html`
      <div>
        <h2>Common Definitions</h2>
        <p>The following functions and properties are defined on the component for use in the examples below.</p>
        <pre><code>myPromise = new Promise((resolve) => setTimeout(() => resolve('Hello from a promise!'), 1000));

async fetch() {
  await new Promise(resolve => setTimeout(resolve, 3000));
  return 'Data loaded!';
}

async *count() {
  for (let i = 1; ; i++) {
    yield i;
    await new Promise(r => setTimeout(r, 1000));
  }
}</code></pre>
      </div>
    `;
  }

  renderBasicTrack() {
    return html`
      <div>
        <h2>Basic track usage</h2>
        ${track(this.myPromise)}
        <pre><code>html\`\${track(this.myPromise)}\`</code></pre>
      </div>
    `;
  }

  renderTrackWithLoading() {
    return html`
      <div>
        <h2>track with loading</h2>
        ${track(loading(this.fetch()))}
        <pre><code>html\`\${track(loading(this.fetch()))}\`</code></pre>
      </div>
    `;
  }

  renderTrackWithAsyncGenerator() {
    return html`
      <div>
        <h2>track with an async generator</h2>
        Count: ${track(this.count())}
        <pre><code>html\`Count: \${track(this.count())}\`</code></pre>
      </div>
    `;
  }

  renderTrackWithTransform() {
    return html`
      <div>
        <h2>track with a transform</h2>
        Count * 2: ${track(this.count(), (value) => (value as number) * 2)}
        <pre><code>html\`Count * 2: \${track(this.count(), (value) => value * 2)}\`</code></pre>
      </div>
    `;
  }

  render() {
    return html`
      <h1>LitAsync Examples</h1>
      ${this.renderCommonCode()}
      ${this.renderBasicTrack()}
      ${this.renderTrackWithLoading()}
      ${this.renderTrackWithAsyncGenerator()}
      ${this.renderTrackWithTransform()}
    `;
  }
}
