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

import { expect, fixtureCleanup } from '@open-wc/testing';
import sinon from 'sinon';
import * as intl from '../index.js';

const { t, intlState } = intl;

describe('config methods', () => {
  let resources;
  let key;
  let lang;

  before(async () => {
    intl.resetIntl();
    intl.setLocalesHost('./test');
    intl.setUrl('locales/locales.json');
    intl.requestResources();
    await intlState.resourcesLoadComplete;

    resources = intlState.getResources();
  });

  afterEach(() => {
    fixtureCleanup();
  });

  describe('config methods', () => {
    beforeEach(() => {
      lang = 'en';
      intl.setLang(lang);
    });

    it('setLang updates current language', () => {
      intl.setLang('es');
      key = 'simple-key';
      const translation = t(key);
      expect(translation).to.be.equal(resources.es[key]);
    });

    it('setLocalesHost updates current resources', async () => {
      intl.setLocalesHost('./test/locales/inner');
      await intlState.resourcesLoadComplete;
      resources = intlState.getResources();

      key = 'simple-key';
      const translation = t(key);
      expect(translation).to.be.equal(resources[lang][key]);

      intl.setLocalesHost('./test');
      await intlState.resourcesLoadComplete;
      resources = intlState.getResources();
    });

    it('setUrl updates current resources', async () => {
      intl.setUrl('locales/inner/locales/locales.json');
      await intlState.resourcesLoadComplete;
      resources = intlState.getResources();

      key = 'simple-key';
      const translation = t(key);
      expect(translation).to.be.equal(resources[lang][key]);

      intl.setUrl('locales/locales.json');
      await intlState.resourcesLoadComplete;
      resources = intlState.getResources();
    });

    it('non-existing url shows error in console', async () => {
      const stub = sinon.stub(console, 'error');
      expect(stub.notCalled).to.be.true;

      intl.setUrl('non-existing-locales.json');
      await intlState.resourcesLoadComplete;

      expect(stub.calledOnce).to.be.true;

      intl.setUrl('locales/locales.json');
      await intlState.resourcesLoadComplete;
      resources = intlState.getResources();
      stub.restore();
    });

    it('url can be used without localesHost', async () => {
      intl.resetIntl();
      intl.setLocalesHost('');
      intl.setUrl('./test/locales/locales.json');
      intl.requestResources();
      await intlState.resourcesLoadComplete;
      resources = intlState.getResources();

      key = 'simple-key';
      const translation = t(key);
      expect(translation).to.be.equal(resources[lang][key]);

      intl.resetIntl();
      intl.setLocalesHost('./test');
      intl.setUrl('locales/locales.json');
      intl.requestResources();
      await intlState.resourcesLoadComplete;
      resources = intlState.getResources();
    });

    it('setWarnOnMissingKeys invokes console warns when key is missing', () => {
      intl.setWarnOnMissingKeys(true);
      const stub = sinon.stub(console, 'warn');
      expect(stub.notCalled).to.be.true;

      key = 'non-existing-key';
      t(key);
      expect(stub.calledOnce).to.be.true;

      stub.restore();
      intl.setWarnOnMissingKeys(false);
    });

    it('set empty url does not remove current resources', async () => {
      const currentResources = resources;
      intl.setUrl('');
      await intlState.resourcesLoadComplete;
      resources = intlState.getResources();

      expect(resources).to.deep.equal(currentResources);

      intl.setUrl('locales/locales.json');
      await intlState.resourcesLoadComplete;
      resources = intlState.getResources();
    });
  });
});
