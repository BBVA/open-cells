import { LitElement, html } from 'lit';
import { LocalizeMixin } from '../index.js';
import styles from './demo-component.css.js';

export class DemoComponent extends LocalizeMixin(LitElement) {
  static styles = styles;

  render() {
    return html`
      <h2>Component using OpenCells Localize Mixin</h2>
      <p>
        Mixin adds '_intlConfig' property to component, which can be used to access Intl global
        config and trigger updates when it changes.
      </p>
      <p>Current language (this._intlConfig.lang): ${this._intlConfig?.lang}</p>

      <ul>
        <li>
          <p class="input"><span class="h">Usage:</span> <code>this.t('simple-key')</code></p>
          <p class="output">
            <span class="h">Result:</span> <span class="result">${this.t('simple-key')}</span>
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span> <code>this.t('simple-key') ?? '--Fallback text--'</code>
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result">${this.t('simple-key') ?? '--Fallback text--'}</span>
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span>
            <code
              >this.t('html-key', {'b': chunks =>
              html\`&lt;strong&gt;\${chunks}&lt;/strong&gt;\`})</code
            >
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result"
              >${this.t('html-key', { b: chunks => html`<strong>${chunks}</strong>` })}</span
            >
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span> <code>this.t('simple-key-plural', {'numItems': 0})</code>
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result">${this.t('simple-key-plural', { numItems: 0 })}</span>
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span> <code>this.t('simple-key-plural', {'numItems': 1})</code>
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result">${this.t('simple-key-plural', { numItems: 1 })}</span>
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span> <code>this.t('simple-key-plural', {'numItems': 5})</code>
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result">${this.t('simple-key-plural', { numItems: 5 })}</span>
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span>
            <code>this.t('simple-key-date', {'exampleDate': new Date()})</code>
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result"
              >${this.t('simple-key-intl-date-lang-demo', { exampleDate: new Date() })}</span
            >
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span>
            <code
              >this.t('simple-key-currency', {'exampleBalance': 3600.12}, {currency: 'USD'})</code
            >
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result"
              >${this.t(
                'simple-key-currency',
                { exampleBalance: 3600.12 },
                { currency: 'USD' },
              )}</span
            >
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span>
            <code
              >this.t('simple-key-currency', {'exampleBalance': 3600.12}, {currency: 'EUR'})</code
            >
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result"
              >${this.t(
                'simple-key-currency',
                { exampleBalance: 3600.12 },
                { currency: 'EUR' },
              )}</span
            >
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span>
            <code
              >this.t('simple-key-currency', {'exampleBalance': 3600.12}, {currency: 'GBP'})</code
            >
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result"
              >${this.t(
                'simple-key-currency',
                { exampleBalance: 3600.12 },
                { currency: 'GBP' },
              )}</span
            >
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span>
            <code
              >this.t('html-key-currency', {'exampleBalance': 3600.12, 'b': chunks =>
              html\`&lt;strong&gt;\${chunks}&lt;/strong&gt;\`}, {currency: 'USD'})</code
            >
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result"
              >${this.t(
                'html-key-currency',
                { exampleBalance: 3600.12, b: chunks => html`<strong>${chunks}</strong>` },
                { currency: 'USD' },
              )}</span
            >
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span>
            <code
              >this.t('html-key-currency', {'exampleBalance': 3600.12, 'b': chunks =>
              html\`&lt;strong&gt;\${chunks}&lt;/strong&gt;\`}, {currency: 'EUR'})</code
            >
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result"
              >${this.t(
                'html-key-currency',
                { exampleBalance: 3600.12, b: chunks => html`<strong>${chunks}</strong>` },
                { currency: 'EUR' },
              )}</span
            >
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span>
            <code
              >this.t('html-key-currency', {'exampleBalance': 3600.12, 'b': chunks =>
              html\`&lt;strong&gt;\${chunks}&lt;/strong&gt;\`}, {currency: 'GBP'})</code
            >
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result"
              >${this.t(
                'html-key-currency',
                { exampleBalance: 3600.12, b: chunks => html`<strong>${chunks}</strong>` },
                { currency: 'GBP' },
              )}</span
            >
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span> <code>this.t('base-only-lang-key')</code>
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result">${this.t('base-only-lang-key')}</span>
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span>
            <code>this.t('base-only-lang-key') ?? '--Fallback text--'</code>
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result">${this.t('base-only-lang-key') ?? '--Fallback text--'}</span>
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span> <code>this.t('specific-only-lang-key')</code>
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result">${this.t('specific-only-lang-key')}</span>
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span>
            <code>this.t('specific-only-lang-key') ?? '--Fallback text--'</code>
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result">${this.t('specific-only-lang-key') ?? '--Fallback text--'}</span>
          </p>
        </li>
        <li>
          <p class="input">
            <span class="h">Usage:</span> <code>this.t('base-override-lang-key')</code>
          </p>
          <p class="output">
            <span class="h">Result:</span>
            <span class="result">${this.t('base-override-lang-key')}</span>
          </p>
        </li>
      </ul>
    `;
  }
}

customElements.define('demo-component-with-mixin', DemoComponent);
