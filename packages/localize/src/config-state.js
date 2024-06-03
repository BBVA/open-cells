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

export const config = {
  lang: document.documentElement.lang || 'en',
  localesHost: '.',
  url: 'locales/locales.json',
  formats: {},
  resources: null,
  useBundles: false,
  warnOnMissingKeys: false,
};

export const intlCache = {
  __localizationCache: {
    requests: {},
    messages: {},
  },
};

/** Public read-only interface for checking the intl current state */
export const intlState = {
  get lang() {
    return config.lang;
  },
  get resourcesLoadComplete() {
    return config.resourcesLoadComplete;
  },
  getResources: () => JSON.parse(JSON.stringify(config.resources)),
};

/* eslint-disable no-param-reassign */
const initResourcesLoadPromise = (configObject, prop) =>
  new Promise(res => {
    configObject[prop] = res;
  });

export const resetResourcesLoadPromise = () => {
  config.resourcesLoadComplete = initResourcesLoadPromise(config, 'resolveResourcesLoadPromise');
};

export const resolveResourcesLoadPromise = () => config.resolveResourcesLoadPromise();
