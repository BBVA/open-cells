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

import { fixtureCleanup, oneEvent, expect } from '@open-wc/testing';
import * as intl from '../index.js';

const { t, intlState } = intl;

describe('core intl methods', () => {
  let resources;
  let key;
  let lang;

  before(async () => {
    intl.resetIntl();
    intl.setLocalesHost('./test');
    intl.requestResources();
    await intlState.resourcesLoadComplete;

    resources = intlState.getResources();
  });

  afterEach(() => {
    fixtureCleanup();
  });

  describe('lang', () => {
    beforeEach(() => {
      lang = 'en';
      intl.setLang(lang);
    });

    it('t method translates according to language', () => {
      key = 'simple-key';
      const translation = t(key);
      expect(translation).to.be.equal(resources[lang][key]);
    });

    it('removing lang returns null', () => {
      const prevLang = intlState.lang;
      key = 'simple-key';
      intl.setLang('');
      const translation = t(key);
      expect(translation).to.be.null;

      intl.setLang(prevLang);
    });

    it('changing language', () => {
      intl.setLang('es');
      key = 'simple-key';
      const translation = t(key);
      expect(translation).to.be.equal(resources.es[key]);
    });

    it('t with no key returns null', () => {
      key = '';
      const translation = t(key);
      expect(translation).to.be.null;
    });

    it('t with non-existing key returns null', () => {
      key = 'non-existing-key';
      const translation = t(key);
      expect(translation).to.be.null;
    });

    it('intlState has access to current config values', () => {
      expect(intlState.lang).to.be.equal(lang);
    });

    describe('fallbacks', () => {
      it('key only in specific lang+region is returned when specific lang matches', () => {
        const prevLang = intlState.lang;
        intl.setLang('en-US');

        key = 'specific-only-lang-key';
        const translation = t(key);
        expect(translation).to.be.equal(resources['en-US'][key]);

        intl.setLang(prevLang);
      });

      it('key only in specific lang+region returns null when lang is base', () => {
        const prevLang = intlState.lang;
        intl.setLang('en');

        key = 'specific-only-lang-key';
        const translation = t(key);
        expect(translation).to.be.null;

        intl.setLang(prevLang);
      });

      it('key not existing in lang+region returns same key in base lang', () => {
        const prevLang = intlState.lang;
        intl.setLang('en-US');

        key = 'simple-key';
        const translation = t(key);
        expect(translation).to.be.equal(resources.en[key]);

        intl.setLang(prevLang);
      });

      it('t returns value from lang+region when exists', () => {
        const prevLang = intlState.lang;
        intl.setLang('en-US');

        key = 'base-override-lang-key';
        const translation = t(key);
        expect(translation).to.be.equal(resources['en-US'][key]);

        intl.setLang(prevLang);
      });

      it('t returns value from base lang when it exists', () => {
        const prevLang = intlState.lang;
        intl.setLang('en');

        key = 'base-override-lang-key';
        const translation = t(key);
        expect(translation).to.be.equal(resources.en[key]);

        intl.setLang(prevLang);
      });
    });
  });

  describe('document lang observer', () => {
    beforeEach(() => {
      lang = 'en';
      intl.setLang(lang);
    });

    it('updating document language updates intl language', async () => {
      key = 'simple-key';
      const oldLang = document.documentElement.lang;
      document.documentElement.setAttribute('lang', 'es');
      await oneEvent(window, 'app-localize-status-change');
      const translation = t(key);
      expect(translation).to.be.equal(resources.es[key]);
      document.documentElement.setAttribute('lang', oldLang);
    });
  });
});
