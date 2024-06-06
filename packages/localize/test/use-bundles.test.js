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
import * as intl from '../index.js';

const { intlState } = intl;

describe('bundles', () => {
  let resources;

  afterEach(() => {
    fixtureCleanup();
  });

  after(() => {
    intl.resetIntl();
    intl.setUseBundles(false);
  });

  describe('no bundles', () => {
    beforeEach(async () => {
      intl.resetIntl();
      intl.setUseBundles(false);
      intl.setLocalesHost('./test');
      intl.setUrl('locales/bundle-a.json');
      intl.requestResources();
      await intlState.resourcesLoadComplete;

      resources = intlState.getResources();
    });

    it('resources has key from bundle A but not from bundle B on init', () => {
      expect(resources.en['key-a']).to.be.equal('Value A');
      expect(resources.en['key-b']).to.be.undefined;
    });

    it('loading bundle B removes bundle A from resources', async () => {
      intl.setUrl('locales/bundle-b.json');
      await intlState.resourcesLoadComplete;
      resources = intlState.getResources();

      expect(resources.en['key-a']).to.be.undefined;
      expect(resources.en['key-b']).to.be.equal('Value B');
    });

    it('use bundles can be set after initial resources have been loaded', async () => {
      expect(resources.en['key-a']).to.be.equal('Value A');
      expect(resources.en['key-b']).to.be.undefined;

      intl.setUseBundles(true);
      intl.setUrl('locales/bundle-b.json');
      await intlState.resourcesLoadComplete;
      resources = intlState.getResources();

      expect(resources.en['key-a']).to.be.equal('Value A');
      expect(resources.en['key-b']).to.be.equal('Value B');
    });
  });

  describe('use bundles', () => {
    beforeEach(async () => {
      intl.resetIntl();
      intl.setUseBundles(true);
      intl.setLocalesHost('./test');
      intl.setUrl('locales/bundle-a.json');
      intl.requestResources();
      await intlState.resourcesLoadComplete;

      resources = intlState.getResources();
    });

    it('resources has key from bundle A but not from bundle B on init', () => {
      expect(resources.en['key-a']).to.be.equal('Value A');
      expect(resources.en['key-b']).to.be.undefined;
    });

    it('loading bundle B does not remove bundle A from resources', async () => {
      intl.setUrl('locales/bundle-b.json');
      await intlState.resourcesLoadComplete;
      resources = intlState.getResources();

      expect(resources.en['key-a']).to.be.equal('Value A');
      expect(resources.en['key-b']).to.be.equal('Value B');
    });
  });
});
