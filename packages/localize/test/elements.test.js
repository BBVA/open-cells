/*
 * Copyright 2024 Bilbao Vizcaya Argentaria, S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable max-classes-per-file */
import { fixture, html, expect, fixtureCleanup } from '@open-wc/testing';
import { LitElement, html as litHtml } from 'lit';
import sinon from 'sinon';
import * as intl from '../index.js';

const { t, intlState, updateWhenLocaleResourcesChange } = intl;

class BaseTestElement extends LitElement {
  constructor() {
    super();
    updateWhenLocaleResourcesChange(this);
  }

  getText(index) {
    return this.shadowRoot.querySelectorAll('p')[index].textContent;
  }

  render() {
    return litHtml`
    <p>${t('simple-key')}</p>
  `;
  }
}

customElements.define('elements-test-element', BaseTestElement);

describe('elements using t', () => {
  let el;
  let resources;
  let lang;

  before(async () => {
    intl.resetIntl();
    intl.setLocalesHost('./test');
    intl.requestResources();
    await intlState.resourcesLoadComplete;
  });

  afterEach(() => {
    fixtureCleanup();
  });

  describe('lang', () => {
    beforeEach(async () => {
      lang = 'en';
      intl.setLang(lang);

      el = await fixture(html` <elements-test-element></elements-test-element> `);
      await el.updateComplete;
      await intlState.resourcesLoadComplete;

      resources = intlState.getResources();
    });

    it('t method translates according to language', () => {
      const translation = el.getText(0);
      expect(translation).to.be.equal(resources[lang]['simple-key']);
    });
  });

  describe('initialization', () => {
    beforeEach(() => {
      intl.resetIntl();
    });

    it('multiple elements only request resources once', async () => {
      const spy = sinon.spy();
      window.addEventListener('app-localize-resources-loaded', spy);
      expect(spy.notCalled).to.be.true;

      el = await fixture(html` <elements-test-element></elements-test-element> `);
      await el.updateComplete;
      await intlState.resourcesLoadComplete;
      expect(spy.calledOnce).to.be.true;

      el = await fixture(html` <elements-test-element></elements-test-element> `);
      await el.updateComplete;
      await intlState.resourcesLoadComplete;
      expect(spy.calledOnce).to.be.true;

      window.removeEventListener('app-localize-resources-loaded', spy);
    });
  });
});
