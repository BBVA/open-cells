import { LitElement, html } from 'lit';
import { t, updateWhenLocaleResourcesChange } from '../index.js';
import styles from './demo-component.css.js';

export class DemoComponent extends LitElement {
  constructor() {
    super();
    updateWhenLocaleResourcesChange(this);
  }

  static styles = styles;

  render() {
    return html`
      <h2>Component using \`t\` function from '@open-cells/localize' module</h2>

      <p>
        Use \`updateWhenLocaleResourcesChange(this)\` in constructor to ensure component updates
        when app lang is changed
      </p>

      <ul>
        <li>
          <p class="input"><span class="h">Usage:</span> <code>t('simple-key')</code></p>
          <p class="output">
            <span class="h">Result:</span> <span class="result">${t('simple-key')}</span>
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span> <code>t('simple-key') ?? '--Fallback text--'</code>
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result">${t('simple-key') ?? '--Fallback text--'}</span>
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span>
            <code
              >t('html-key', {'b': chunks => html\`&lt;strong&gt;\${chunks}&lt;/strong&gt;\`})</code
            >
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result"
              >${t('html-key', { b: chunks => html`<strong>${chunks}</strong>` })}</span
            >
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span> <code>t('simple-key-plural', {'numItems': 0})</code>
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result">${t('simple-key-plural', { numItems: 0 })}</span>
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span> <code>t('simple-key-plural', {'numItems': 1})</code>
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result">${t('simple-key-plural', { numItems: 1 })}</span>
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span> <code>t('simple-key-plural', {'numItems': 5})</code>
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result">${t('simple-key-plural', { numItems: 5 })}</span>
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span>
            <code>t('simple-key-date', {'exampleDate': new Date()})</code>
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result">${t('simple-key-date', { exampleDate: new Date() })}</span>
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span>
            <code>t('simple-key-currency', {'exampleBalance': 3600.12})</code>
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result">${t('simple-key-currency', { exampleBalance: 3600.12 })}</span>
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span>
            <code
              >t('html-key-currency', {'exampleBalance': 3600.12, 'b': chunks =>
              html\`&lt;strong&gt;\${chunks}&lt;/strong&gt;\`})</code
            >
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result"
              >${t('html-key-currency', {
                exampleBalance: 3600.12,
                b: chunks => html`<strong>${chunks}</strong>`,
              })}</span
            >
          </p>
        </li>
        <li>
          <p class="input"><span class="h">Usage:</span> <code>t('base-only-lang-key')</code></p>
          <p class="output">
            <span class="h">Result:</span> <span class="result">${t('base-only-lang-key')}</span>
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span>
            <code>t('base-only-lang-key') ?? '--Fallback text--'</code>
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result">${t('base-only-lang-key') ?? '--Fallback text--'}</span>
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span> <code>t('specific-only-lang-key')</code>
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result">${t('specific-only-lang-key')}</span>
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span>
            <code>t('specific-only-lang-key') ?? '--Fallback text--'</code>
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result">${t('specific-only-lang-key') ?? '--Fallback text--'}</span>
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span> <code>t('base-override-lang-key')</code>
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result">${t('base-override-lang-key')}</span>
          </p>
        </li>
      </ul>
    `;
  }
}

customElements.define('demo-component', DemoComponent);
