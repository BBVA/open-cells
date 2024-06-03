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

import { config, intlCache, resetResourcesLoadPromise } from './config-state.js';
import { resourcesFromUrl, updateLocalize } from './localize-resources.js';

/**
 * Sets the initial part of path for retrieving locales from
 *
 * @param {String} localesHost - Initial part of path for retrieving locales from
 */
export function setLocalesHost(localesHost) {
  const oldLocalesHost = config.localesHost;
  if (oldLocalesHost !== localesHost) {
    config.localesHost = localesHost;
    if (config.resources) {
      resourcesFromUrl(config.url, config.localesHost, config.useBundles);
    }
  }
}

/**
 * Sets the language to be used for translations. Updates translation functions to use the new
 * language configuration
 *
 * @param {String} lang
 */
export function setLang(lang) {
  config.lang = lang;
  document.documentElement.lang = lang;
  updateLocalize();
}

/**
 * Sets the final part of path (first one is localesHost) for retrieving locales JSON from
 *
 * @param {String} url
 */
export function setUrl(url) {
  const oldUrl = config.url;
  if (url !== oldUrl) {
    config.url = url;
    if (config.resources) {
      resourcesFromUrl(config.url, config.localesHost, config.useBundles);
    }
  }
}

/**
 * Sets special formats to be used for translations, as defined in the IntlMessageFormat library.
 * For example, currency config for number formats
 *
 * @param {Object} formats
 */
export function setFormats(formats) {
  config.formats = formats;
  updateLocalize();
}

/**
 * Sets whether new locale resources should be merged with previous ones or replace them instead.
 *
 * @param {Boolean} useBundles
 */
export function setUseBundles(useBundles) {
  const oldUseBundles = config.useBundles;
  if (oldUseBundles !== useBundles) {
    config.useBundles = useBundles;
    if (config.resources) {
      resourcesFromUrl(config.url, config.localesHost, config.useBundles);
    }
  }
}

/**
 * Sets whether a warning should be logged when a key is not found in the resources. Useful for
 * debugging
 *
 * @param {Boolean} warnOnMissingKeys
 */
export function setWarnOnMissingKeys(warnOnMissingKeys) {
  config.warnOnMissingKeys = warnOnMissingKeys;
}

/** Clears current resources data and caches */
export function resetIntl() {
  config.resources = null;
  resetResourcesLoadPromise();
  intlCache.__localizationCache = {
    requests: {},
    messages: {},
  };
  updateLocalize();
}
