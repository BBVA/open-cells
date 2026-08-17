import { startApp } from '@open-cells/core';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ElementController } from '@open-cells/element-controller';
import { routes } from '../router/routes.js';
import { styles } from './app-index.css.js';

startApp({
  routes,
  mainNode: 'app-content',
});

@customElement('app-index')
export class AppIndex extends LitElement {
  elementController = new ElementController(this);

  static styles = styles;

  render() {
    return html`
      <header>
        <nav>
          <a class="brand-link" href="/">
            <img class="brand-logo" src="https://www.opencells.dev/images/logo.svg" alt="Open Cells" />
          </a>
          <ul class="nav-links">
            <li><a href="https://www.opencells.dev/docs/index.html" target="_blank" rel="noopener">Docs</a></li>
            <li><a href="https://github.com/BBVA/open-cells" target="_blank" rel="noopener">GitHub</a></li>
          </ul>
        </nav>
      </header>
      <main role="main" tabindex="-1">
        <slot></slot>
      </main>
    `;
  }
}
