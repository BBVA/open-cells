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

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fixtureCleanup } from './test-helpers.js';
import * as intl from '../index.js';

const { intlState } = intl;

describe('config methods', () => {
  let lang;

  beforeAll(async () => {
    intl.resetIntl();
    intl.setLocalesHost('./test');
    intl.setUrl('locales/locales.json');
    intl.requestResources();
    await intlState.resourcesLoadComplete;
  });

  afterEach(() => {
    fixtureCleanup();
  });

  describe('events', () => {
    beforeEach(() => {
      lang = 'en';
      intl.setLang(lang);
    });

    it('loading resources fires app-localize-resources-loaded', async () => {
      const spy = vi.fn();
      window.addEventListener('app-localize-resources-loaded', spy);
      expect(spy).not.toHaveBeenCalled();

      intl.setUrl('locales/bundle-a.json');
      await intlState.resourcesLoadComplete;

      expect(spy).toHaveBeenCalledTimes(1);

      window.removeEventListener('app-localize-resources-loaded', spy);
      intl.setUrl('locales/locales.json');
      await intlState.resourcesLoadComplete;
    });

    it('error loading resources fires app-localize-resources-error', async () => {
      const spy = vi.fn();
      window.addEventListener('app-localize-resources-error', spy);
      expect(spy).not.toHaveBeenCalled();

      intl.setUrl('locales/non-existing.json');
      await intlState.resourcesLoadComplete;

      expect(spy).toHaveBeenCalledTimes(1);

      window.removeEventListener('app-localize-resources-error', spy);
      intl.setUrl('locales/locales.json');
      await intlState.resourcesLoadComplete;
    });

    it('loading resources fires app-localize-status-change', async () => {
      const spy = vi.fn();
      window.addEventListener('app-localize-status-change', spy);
      expect(spy).not.toHaveBeenCalled();

      intl.setUrl('locales/bundle-a.json');
      await intlState.resourcesLoadComplete;

      expect(spy).toHaveBeenCalledTimes(1);

      window.removeEventListener('app-localize-status-change', spy);
      intl.setUrl('locales/locales.json');
      await intlState.resourcesLoadComplete;
    });

    it('updating lang fires app-localize-status-change', async () => {
      const spy = vi.fn();
      window.addEventListener('app-localize-status-change', spy);
      expect(spy).not.toHaveBeenCalled();

      intl.setLang('es');

      expect(spy).toHaveBeenCalledTimes(1);
      window.removeEventListener('app-localize-status-change', spy);
      intl.setLang('en');
    });

    it('updating formats fires app-localize-status-change', async () => {
      const spy = vi.fn();
      window.addEventListener('app-localize-status-change', spy);
      expect(spy).not.toHaveBeenCalled();

      const formatsObject = {
        number: {
          currency: {
            style: 'currency',
            currency: 'EUR',
            currencyDisplay: 'symbol',
          },
        },
      };

      intl.setFormats(formatsObject);

      expect(spy).toHaveBeenCalledTimes(1);
      window.removeEventListener('app-localize-status-change', spy);
    });
  });
});
