import { html, LitElement } from 'lit';
import { PageController } from '@open-cells/page-controller';
import { customElement } from 'lit/decorators.js';

@customElement('second-page')
export class SecondPage extends LitElement {
  pageController = new PageController(this);

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  render() {
    return html`
      <button class="page-back" @click="${() => this.pageController.navigate('home')}">Back to home</button>
      <div class="page-header">
        <h1>Keep building</h1>
        <p>The router handled this transition for you. Just the beginning. Here&apos;s more about what Open Cells gives you out of the box:</p>
      </div>
      <div class="grid">
        <div class="tile">
          <div class="tile-icon">🔄</div>
          <div class="tile-text">
            <strong>State handling</strong>
            <span>Reactive updates powered by controllers</span>
          </div>
        </div>
        <div class="tile">
          <div class="tile-icon">🔌</div>
          <div class="tile-text">
            <strong>Extensible architecture</strong>
            <span>Easily add components and pages</span>
          </div>
        </div>
        <div class="tile">
          <div class="tile-icon">🧪</div>
          <div class="tile-text">
            <strong>Testing ready</strong>
            <span>A clean baseline to add integration and unit tests</span>
          </div>
        </div>
        <a class="link-arrow docs-link" href="https://www.opencells.dev/docs/index.html" target="_blank" rel="noopener">More in Open Cells docs</a>
      </div>
    `;
  }
}
