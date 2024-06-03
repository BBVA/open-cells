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

import { dedupeMixin } from '@open-wc/dedupe-mixin';
import { t, updateWhenLocaleResourcesChange } from '../core-intl.js';
import { intlState } from '../config-state.js';

/**
 * This module includes mixins and methods to handle internationalization & localization in
 * components. It relies in two principles:
 *
 * - Components that contain messages inside them that are language-dependant should use the `t`
 *   function to manage them.
 * - The application should provide the final texts or resources (locales) in JSON format and manage
 *   the internationalization configuration.
 *
 * Thus, components will have the capability of localizing messages and will be able to show default
 * ones, but the application will have the final word on the final messages to show.
 *
 * The package uses [Format.JS Intl MessageFormat](https://formatjs.io/docs/intl-messageformat) to
 * help applying specific formats to translations based on language and other parameters.
 *
 * ## Basic usage
 *
 * The `t` function is the main piece provided by this module. It can be directly imported from the
 * module and used wherever needed. Example:
 *
 * ```js
 * import { LitElement, html } from 'lit';
 * import { t, updateWhenLocaleResourcesChange } from '@open-cells/localize';
 *
 * class ExampleComponent extends LitElement {
 *   constructor() {
 *     super();
 *     updateWhenLocaleResourcesChange(this);
 *   }
 *
 *   render() {
 *     return html` <p>${t('simple-key')}</p> `;
 *   }
 * }
 * ```
 *
 * The `t` function will look for `simple-key` in the available locale resources and for the current
 * application language. If found, the value will be passed to Intl MessageFormat (and the result
 * will be cached for future uses), then returned. If the key is not found, `t` will return `null`.
 *
 * `updateWhenLocaleResourcesChanges` is a helper function that adds a Lit Controller to the
 * component that listens for global intl status change events and triggers a component update
 * accordingly. Thus, if the application language is updated (from 'en-US' to 'es-ES', for example),
 * the component will be automatically re-rendered and its messages will be updated to the new
 * language.
 *
 * **Note:** if no resources are loaded when `updateWhenLocaleResourcesChanges` is called, it will
 * automatically try to fetch the resources using the current configuration.
 *
 * ### Locales structure
 *
 * The application will load the locales from a JSON file with the following structure:
 *
 * ```json
 * {
 *   "en": {
 *     "key-a": "Value A",
 *     "key-b": "Value B"
 *   },
 *   "en-US": {
 *     "key-b": "Value B for US"
 *   },
 *   "es": {
 *     "key-a": "Valor A",
 *     "key-b": "Valor B"
 *   },
 *   "es-ES": {
 *     "key-b": "Valor B para ES"
 *   },
 *   "es-MX": {
 *     "key-b": "Valor B para MX"
 *   }
 * }
 * ```
 *
 * JSON first level keys are the language codes, and the second level keys are the translation keys.
 *
 * ### Providing fallbacks for not-found translations
 *
 * When there are no resources loaded, or a specific key is not found in the locale resources for
 * the current language, `null` will be returned. So, it's easy to provide fallbacks for not-found
 * translations. For example:
 *
 * ```js
 *  render() {
 *     return html`
 *       <p>${t('simple-key') ?? 'This is a fallback text'}</p>
 *     `;
 *   }
 * ```
 *
 * Using the Nullish coalescing operator (??) ensures that if the key is found but its value is an
 * empty string, it does not get overriden by the fallback.
 *
 * ## Translation parameters and options
 *
 * The values retrieved from locales will be passed to [Intl
 * MessageFormat](https://formatjs.io/docs/intl-messageformat). This allows to use parameters and
 * gives a lot of flexibility to the system. For example, a component could need to show a message
 * with a dynamic value, but adjusting the text message based on that value. Example:
 *
 * ```js
 *   render() {
 *     return html`
 *       <p>${t('simple-key', { numItems: this.items })}</p>
 *     `;
 *   }
 * ```
 *
 * ```json
 * {
 *   "en": {
 *     "simple-key": "You have {numItems, plural, =0 {no elements.} =1 {one element.} other {# elements.}}"
 *   },
 *   "es": {
 *     "simple-key": "{numItems, plural, =0 {No tienes elementos.} =1 {Tienes un elemento.} other {Tienes # elementos.}}"
 *   }
 * }
 * ```
 *
 * You can pass other parameters for the available formatting options as documented in [Intl
 * MessageFormat](https://formatjs.io/docs/intl-messageformat). Examples:
 *
 * ```json
 * {
 *   "en": {
 *     "html-key": "This is a <b>value</b>",
 *     "simple-key-plural": "You have {numItems, plural, =0 {no elements.} =1 {one element.} other {# elements.}}",
 *     "simple-key-date": "Starts on {exampleDate, date, medium}",
 *     "simple-key-intl-date-lang-demo": "The date is {exampleDate, date, long}"
 *   }
 * }
 * ```
 *
 * ```js
 *   render() {
 *     return html`
 *       <p>${t('html-key', {'b': chunks => html`<strong>${chunks}</strong>`})}</p>
 *       <p>${t('simple-key-plural', { numItems: this.items })}</p>
 *       <p>${t('simple-key-date', {'exampleDate': new Date()})}</p>
 *       <p>${t('simple-key-intl-date-lang-demo', {'exampleDate': new Date()})}</p>
 *     `;
 *   }
 * ```
 *
 * ## Base language and region codes
 *
 * When the language code used in the application includes a region code (like 'en-US' or 'es-ES'),
 * `t` will look for the key in the locale resources for that specific code first. If the key is not
 * found, then it will look for it in the base language code (like 'en' or 'es'), without the region
 * part. This allows to define a base set of translations for a language and then override them with
 * specific translations for a region.
 *
 * In the following example, when translating 'key-b' for 'en-US', the value 'Value B for US' will
 * be used. But when translating 'key-b' for 'en-GB', the value 'Value B' (retrieved from 'en' base
 * language) will be used.
 *
 * ```json
 * {
 *   "en": {
 *     "key-a": "Value A",
 *     "key-b": "Value B"
 *   },
 *   "en-US": {
 *     "key-b": "Value B for US"
 *   }
 * }
 * ```
 *
 * ## Mixin usage
 *
 * The package offers a mixin, `LocalizeMixin`, which automatically imports the `t` method, invokes
 * `updateWhenLocaleResourcesChange`, and assigns `t` to a method in the component interface.
 * Example:
 *
 * ```js
 * import { LitElement, html } from 'lit';
 * import { LocalizeMixin } from '@open-cells/localize';
 *
 * class ExampleComponent extends LocalizeMixin(LitElement) {
 *   render() {
 *     return html` <p>${this.t('simple-key')}</p> `;
 *   }
 * }
 * ```
 *
 * You can also combine the mixin with the imported `t` method:
 *
 * ```js
 * import { LitElement, html } from 'lit';
 * import { LocalizeMixin, t } from '@open-cells/localize';
 *
 * class ExampleComponent extends LocalizeMixin(LitElement) {
 *   render() {
 *     return html` <p>${t('simple-key')}</p> `;
 *   }
 * }
 * ```
 *
 * The mixin also adds a `_intlConfig` state to the component, which will be updated when the global
 * intl configuration changes. This property allows to get the current state of the intl
 * configuration in the component. Example:
 *
 * ```js
 * import { LitElement, html } from 'lit';
 * import { LocalizeMixin } from '@open-cells/localize';
 *
 * class ExampleComponent extends LocalizeMixin(LitElement) {
 *   willUpdate(props) {
 *     super?.willUpdate(props);
 *     if (props.has('_intlConfig')) {
 *       this._globalIntlLang = this._intlConfig.lang;
 *     }
 *   }
 *
 *   render() {
 *     return html`
 *       <p>${this.t('simple-key')}</p>
 *       <p>Current language is: ${this._globalIntlLang}</p>
 *     `;
 *   }
 * }
 * ```
 *
 * You can use this when a component has other language-dependant features; for example, if the
 * component needs to show the first day of the week (which could be sunday or monday, generally).
 *
 * ## Configuration methods
 *
 * The global configuration is stored in the module state. The module provides a set of methods for
 * managing and updating the configuration.
 *
 * `setLang` updates the current language used in the application. It will also update the
 * `document.documentElement.lang` attribute.
 *
 * ```js
 * import { setLang } from '@open-cells/localize';
 *
 * setLang('es-ES');
 * ```
 *
 * **Note:** intl lang defaults to the `<html>` tag `lang` attribute. In order to define the initial
 * language in your application, you can just set that attribute. For example:
 *
 * ```html
 * <html lang="es">
 *   ...
 * </html>
 * ```
 *
 * `setFormats` allows to set formats for Intl MessageFormat.
 *
 * ```js
 * import { setFormats } from '@open-cells/localize';
 *
 * setFormats({
 *   number: {
 *     currency: {
 *       style: 'currency',
 *       currency: 'USD',
 *       currencyDisplay: 'symbol',
 *     },
 *   },
 * });
 * ```
 *
 * If `setWarnOnMissingKeys` is invoked with `true`, it will show a console warning when a key is
 * not found in the locale resources. This can be useful for debugging, in order to locate missing
 * translations in your app.
 *
 * ```js
 * import { setWarnOnMissingKeys } from '@open-cells/localize';
 *
 * setWarnOnMissingKeys(true);
 * ```
 *
 * ### Resources & initialization
 *
 * The path for locale resources is set using two properties: `url` and `localesHost`. They default
 * to `locales/locales.json` and `.` respectively, so the default path for locales is
 * `./locales/locales.json.`
 *
 * The resources are not automatically fetched when the module is loaded. This allows the user to
 * modify `localesHost` and `url` without triggering any requests, using the `setLocalesHost` and
 * `setUrl` methods. When the resources are needed, the `requestResources` method can be used to
 * fetch them.
 *
 * ```js
 * import { setUrl, setLocalesHost, requestResources } from '@open-cells/localize';
 *
 * setLocalesHost('base/path/for/app');
 * setUrl('locales/app-locales.json');
 *
 * // Manually retrieve resources
 * requestResources();
 * ```
 *
 * Alternatively, instead of manually invoking `requestResources`, the first component that uses
 * `updateWhenLocaleResourcesChange` will automatically trigger the request.
 *
 * Thus, apps should set all their initial configuration parameters (`localesHost`, `url`,
 * `lang`...) before any other component is loaded; then, it could just wait for the first component
 * using `updateWhenLocaleResourcesChange` to trigger the request.
 *
 * After resources are retrieved, any new modification made to `localesHost` or `url` will
 * automatically trigger a new request. The new resources will override the previous ones. You can
 * set `useBundles` to true to merge the new resources with the previous ones instead of replacing
 * them.
 *
 * ```js
 * import {
 *   setUrl,
 *   setLocalesHost,
 *   requestResources,
 *   setUseBundles,
 * } from '@open-cells/localize';
 *
 * setUseBundles(true);
 * setLocalesHost('base/path/for/app');
 * setUrl('locales/app-locales.json');
 *
 * // Manually retrieve resources
 * requestResources();
 *
 * setTimeout(() => {
 *   setUrl('locales/other-locales.json');
 * }, 3000);
 * ```
 *
 * ## Events
 *
 * The module fires events on `window` to notify about changes.
 *
 * - `app-localize-resources-loaded` is fired when a locale resources file is loaded and is available
 *   for use.
 * - `app-localize-resources-error` is fired when an error occurs while loading resources.
 * - `app-localize-status-change` is fired when the intl configuration changes; for example, when the
 *   language is updated from `en` to `es`, when the formats are updated, resources are loaded,
 *   etc.
 *
 * ## MutationObserver on document lang
 *
 * The default `lang` of the module will be set to the `document.documentElement.lang` property,
 * which matches the `lang` attribute in `<html>` tag. When loaded, the intl module automatically
 * sets a MutationObserver on the `lang` attribute of `<html>`: when it changes, the module will
 * update the `lang` config property accordingly.
 *
 * ## Demo, component locales and app locales
 *
 * In general terms, any component that renders any text by itself should use the `t` method on it.
 * This allows applications to customize that text without needing to pass a property for it.
 *
 * So, instead of
 *
 * ```js
 * render() {
 *   return html`
 *     <button type="button">Close item</button>
 *   `;
 * }
 * ```
 *
 * It should be
 *
 * ```js
 * render() {
 *   return html`
 *     <button type="button">${t('example-component-close-button') ?? 'Close item'}</button>
 *   `;
 * }
 * ```
 *
 * When a text is not defined/governed by the own component (for example, a text passed as a
 * property or through a slot), there is no need to use `t` method on it: the parent component will
 * already use `t` to translate it, if necessary. This helps maintaining a clear separation of
 * concerns and avoids unnecessary calls to `t`.
 *
 * In the following example, `this.optionalLabel` has no default value and is exclusively passed as
 * a property, so the component does not need to translate it. The `slot` content is also not
 * translated by the component, as it's not a direct content of the component.
 *
 * ```js
 * render() {
 *   return html`
 *     ${this.optionalLabel ? html`<p>${this.optionalLabel}</p>` : nothing}
 *     <div>
 *       <slot name="description"></slot>
 *     </div>
 *   `;
 * }
 * ```
 *
 * The keys that the component uses in its own render should be made available in a
 * `locales/locales.json` file in the component root folder, which should be packaged with the
 * component once it is published. The component does not load this file by itself, but this allows
 * the application using the component to recollect and merge the `locales.json` files from all its
 * dependencies. This way, the application does not need to know the specific keys used by each
 * component, but it can get them in a build step as needed.
 *
 * In fact, the component could be using other components inside the shadow root that have their own
 * locales. The component `locales/locales.json` SHOULD NOT include the keys of its children
 * components. For the component demo or tests, you can generate additional
 * `demo/locales/locales.json` or `test/locales/locales.json` that merge the component own keys and
 * the ones from its children components.
 *
 * For example, in this case:
 *
 * ```js
 * render() {
 *   return html`
 *     <button type="button">${t('example-component-close-button') ?? 'Close item'}</button>
 *     <child-component-with-locales>Content</child-component-with-locales>
 *   `;
 * }
 * ```
 *
 * The component `locales/locales.json` would look as follows:
 *
 * ```json
 * {
 *   "en": {
 *     "example-component-close-button": "Close item"
 *   },
 *   "es": {
 *     "example-component-close-button": "Cerrar elemento"
 *   }
 * }
 * ```
 *
 * But the `demo/locales/locales.json` would be:
 *
 * ```json
 * {
 *   "en": {
 *     "example-component-close-button": "Close item",
 *     "child-component-with-locales-label": "Text used in child component"
 *   },
 *   "es": {
 *     "example-component-close-button": "Cerrar elemento",
 *     "child-component-with-locales-label": "Texto utilizado en componente hijo"
 *   }
 * }
 * ```
 */
const LocalizeMixinImpl = superClass =>
  class extends superClass {
    static get properties() {
      return {
        _intlConfig: {
          state: true,
        },
      };
    }

    constructor() {
      super();
      this._intlController = updateWhenLocaleResourcesChange(this, {
        configProperty: '_intlConfig',
        intlConfig: intlState,
      });
    }

    // eslint-disable-next-line class-methods-use-this
    t(...params) {
      return t(...params);
    }
  };

export const LocalizeMixin = dedupeMixin(LocalizeMixinImpl);
