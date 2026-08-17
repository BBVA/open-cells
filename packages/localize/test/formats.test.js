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

import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { html } from 'lit';
import { fixture, fixtureCleanup } from './test-helpers.js';
import * as intl from '../index.js';

const { t, intlState } = intl;

describe('formats', () => {
  let key;
  let lang;

  beforeAll(async () => {
    intl.resetIntl();
    intl.setLocalesHost('./test');
    intl.requestResources();
    await intlState.resourcesLoadComplete;
  });

  afterEach(() => {
    fixtureCleanup();
  });

  describe('lang', () => {
    beforeEach(() => {
      lang = 'en';
      intl.setLang(lang);
    });

    it('simple key', () => {
      key = 'simple-key';
      const translation = t(key);
      expect(translation).toBe('This is a value');
    });

    it('key with html', async () => {
      key = 'html-key';
      const translation = t(key, { b: chunks => html`<strong>${chunks}</strong>` });
      const renderedItem = await fixture(html`<div>${translation}</div>`);
      expect(renderedItem.innerHTML.replace(/<!--.*?-->/g, '')).toBe(
        'This is a <strong>value</strong>',
      );
    });

    it('key with plurals, 0', () => {
      key = 'simple-key-plural';
      const translation = t(key, { numItems: 0 });
      expect(translation).toBe('You have no items.');
    });

    it('key with plurals, 1', () => {
      key = 'simple-key-plural';
      const translation = t(key, { numItems: 1 });
      expect(translation).toBe('You have one item.');
    });

    it('key with plurals, 5', () => {
      key = 'simple-key-plural';
      const translation = t(key, { numItems: 5 });
      expect(translation).toBe('You have 5 items.');
    });

    it('date key', () => {
      key = 'simple-key-intl-date-lang-demo';
      const translation = t(key, { exampleDate: new Date('2024-02-20') });
      expect(translation).toBe('The date is February 20, 2024');
    });

    it('currency options key, alternative formats', () => {
      intl.setFormats({
        number: {
          currency: {
            style: 'currency',
            currency: 'USD',
            currencyDisplay: 'symbol',
          },
        },
      });
      key = 'simple-key-currency';
      const translation = t(key, { exampleBalance: 3600.12 });
      expect(translation).toBe('Your available balance is $3,600.12');

      intl.setFormats({});
    });
  });
});
