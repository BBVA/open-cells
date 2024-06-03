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

import { config } from './config-state.js';
import { localize, resourcesFromUrl } from './localize-resources.js';
import { IntlController } from './IntlController.js';
import './document-lang-observer.js';

/**
 * Translates provided key according to loaded locale resources and globally defined lang, using
 * params and options. Returns null if key is not found in resources.
 *
 * @param {String} key - Key to translate
 * @param {Object} params - Parameters to interpolate in the translation
 * @returns {String | null} - Translated string
 */
export function t(...params) {
  return localize?.(...params);
}

/**
 * Fetches locales from path defined using 'localesHost' and 'url' in config. If 'useBundles' is
 * true, it will merge all fetched locales into a single object.
 *
 * @returns {Object} - Resources object from fetched locale file.
 */
export function requestResources() {
  return resourcesFromUrl(config.url, config.localesHost, config.useBundles);
}

/**
 * Used in component constructor. Adds a Lit Controller to the component that listens for global
 * intl status change events and triggers a component update accordingly.
 *
 * @param {LitElement} component - Component to add the controller to
 * @param {Object} options - Options to pass to the controller
 * @param {Object} options.intlConfig - Global intl state object
 * @param {String} options.configProperty - Name of the component inner property to store a
 *   reference to the global Intl config
 */
export function updateWhenLocaleResourcesChange(component, options) {
  const controller = new IntlController(component, options);
  component.addController(controller);

  if (!config.resources) {
    config.resources = {};
    requestResources();
  }

  return controller;
}
