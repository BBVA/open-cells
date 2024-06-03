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

/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
import { IntlMessageFormat } from 'intl-messageformat';
import {
  config,
  intlCache,
  resetResourcesLoadPromise,
  resolveResourcesLoadPromise,
} from './config-state.js';
import { assignMerge } from './utils.js';
import { eventTypes } from './event-types.js';

let __staticIntlResources = {};

let resourcesLoadPending = 0;

let localize = () => null;

function computeLocalize(language, resources, formats) {
  // Everytime any of the parameters change, invalidate the strings cache.
  intlCache.__localizationCache.messages = {};

  return function (key, params, options) {
    if (!key || !resources || !language) {
      return null;
    }

    // Cache the key/value pairs for the same language, so that we don't
    // do extra work if we're just reusing strings across an application.
    let translatedValue = resources[language]?.[key];
    if (translatedValue === undefined) {
      // Check if key is defined in default language object.
      // For example, if key not found in 'es-ES', check for it
      // in 'es'
      const languageBase = language.split('-')[0];
      if (resources[languageBase]?.[key]) {
        translatedValue = resources[languageBase][key];
      }
    }
    // If key does not exist, return null
    if (translatedValue == null) {
      if (config.warnOnMissingKeys) {
        console.warn(`Missing translation for key: "${key}" in language: "${language}"`);
      }
      return null;
    }

    let messageKey = key + language + translatedValue;

    let messageFormats = formats;

    // Format dynamic currency. REVIEW THIS
    if (
      options?.currency &&
      formats?.number?.currency &&
      typeof formats.number.currency === 'object'
    ) {
      messageFormats = JSON.parse(JSON.stringify(formats));
      messageFormats.number.currency.currency = options.currency;
      messageKey += options.currency;
    }

    let translatedMessage = intlCache.__localizationCache.messages[messageKey];

    if (!translatedMessage) {
      translatedMessage = new IntlMessageFormat(translatedValue, language, messageFormats);
      intlCache.__localizationCache.messages[messageKey] = translatedMessage;
    }
    return translatedMessage.format(params);
  };
}

function updateLocalize() {
  const { lang, resources, formats } = config;
  if (!resources || !formats) {
    localize = () => null;
  } else {
    localize = lang ? computeLocalize(lang, resources, formats) : () => null;
  }
  window.dispatchEvent(new CustomEvent(eventTypes.STATUS_CHANGE));
}

function setResources(resources) {
  if (config.useBundles) {
    __staticIntlResources = Object.assign(__staticIntlResources, resources);
    config.resources = __staticIntlResources;
  } else {
    config.resources = resources;
  }
  updateLocalize();
}

async function onRequestResponse(requestLocales, merge) {
  const locales = requestLocales;

  let resources = {};
  const newResources = locales;

  if (merge) {
    resources = assignMerge(config.resources || {}, newResources);
  } else {
    resources = newResources;
  }

  setResources(resources);

  window.dispatchEvent(
    new CustomEvent(eventTypes.RESOURCES_LOADED, {
      detail: requestLocales,
    }),
  );
}

function onRequestError(error) {
  window.dispatchEvent(
    new CustomEvent(eventTypes.RESOURCES_ERROR, {
      detail: error,
    }),
  );
}

async function loadResources(path, localesHost, merge) {
  resetResourcesLoadPromise();
  resourcesLoadPending += 1;

  const fetchPath = localesHost && path ? [localesHost, path].join('/') : path;

  let requestLocales = intlCache.__localizationCache.requests[fetchPath];

  if (!requestLocales) {
    try {
      const request = await fetch(fetchPath);
      requestLocales = await request.json();
      await onRequestResponse(requestLocales, merge);
    } catch (e) {
      console.error('Error fetching', fetchPath, e);
      onRequestError(e);
    }

    // Cache the request so that it can be reused if the same path is loaded.
    intlCache.__localizationCache.requests[fetchPath] = requestLocales;
  } else {
    try {
      await onRequestResponse(requestLocales, merge);
    } catch (e) {
      onRequestError(e);
    }
  }
  resourcesLoadPending -= 1;
  if (resourcesLoadPending <= 0) {
    resolveResourcesLoadPromise();
  }
  return requestLocales;
}

async function resourcesFromUrl(url, localesHost, useBundles) {
  const merge = useBundles;
  if (url) {
    await loadResources(url, localesHost, merge);
  }
  return config.resources;
}

const getLocalize = (...params) => localize(...params);

export { getLocalize as localize, resourcesFromUrl, updateLocalize };
