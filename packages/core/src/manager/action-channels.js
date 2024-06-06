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

import { eventManager } from '../manager/events';
import { Constants } from '../constants';

const { externalEventsCodes } = Constants;

/**
 * @typedef {import('../../types').Bridge} Bridge
 *
 * @typedef {import('../../types').WCEvent} WCEvent
 *
 * @typedef {import('./bridge-channels').BridgeChannelManager} BridgeChannelManager
 *
 * @typedef {import('../../types').TemplateManager} TemplateManager
 */

/**
 * Class representing an Action Channel Manager.
 *
 * @class
 */
export class ActionChannelManager {
  /**
   * Create an Action Channel Manager.
   *
   * @class
   * @param {Bridge} bridge - The bridge object.
   */
  constructor(bridge) {
    this.bridge = bridge;
    this.ChannelManager = bridge.BridgeChannelManager;
    this.TemplateManager = bridge.TemplateManager;
  }

  /** Subscribe to all action channels. */
  subscribeAll() {
    this.ChannelManager.getBridgeChannel('config').subscribe((/** @type {WCEvent} */ evt) =>
      this._configSubscriptor(evt),
    );
    this.ChannelManager.getBridgeChannel('locales').subscribe((/** @type {WCEvent} */ evt) =>
      this._localesSubscriptor(evt),
    );
    this.ChannelManager.getBridgeChannel('logout').subscribe((/** @type {WCEvent} */ evt) =>
      this._logoutSubscriptor(),
    );
    this.ChannelManager.getBridgeChannel('interceptor_context').subscribe(
      (/** @type {WCEvent} */ evt) => this._appContextSubscriptor(evt),
    );
  }

  /**
   * Update a property of the bridge object.
   *
   * @param {string} prop - The property to update.
   * @param {any} value - The new value for the property.
   */
  updateProperty(prop, value) {
    if (this.isAllowedProperty(prop)) {
      // @ts-ignore
      this.bridge[prop] = value;
      // @ts-ignore
      window.AppConfig && (window.AppConfig[prop] = value);
    }
  }

  /**
   * Check if a property is allowed to be updated.
   *
   * @param {string} prop - The property to check.
   * @returns {boolean} - True if the property is allowed, false otherwise.
   */
  isAllowedProperty(prop) {
    // @ts-ignore
    return typeof this.bridge[prop] !== 'function';
  }

  /**
   * Event handler for the 'config' action channel.
   *
   * @private
   * @param {WCEvent} evt - The event object.
   */
  _configSubscriptor(evt) {
    const { TEMPLATE_REGISTERED } = externalEventsCodes;
    const selected = this.TemplateManager.selected;

    if (evt.detail) {
      for (let prop in evt.detail) {
        if (evt.detail.hasOwnProperty(prop)) {
          this.updateProperty(prop, evt.detail[prop]);
        }
      }

      if (evt.detail.app || evt.detail.pagesPath) {
        this.TemplateManager.removeTemplates(selected, this.bridge.crossContainerId);
        eventManager.once(TEMPLATE_REGISTERED, () => this.TemplateManager.removeTemplate(selected));
      }
    }
  }

  /**
   * Event handler for the 'locales' action channel.
   *
   * @private
   * @param {WCEvent} evt - The event object.
   */
  _localesSubscriptor(evt) {
    // @ts-ignore
    if (window.I18nMsg && evt.detail && evt.detail.lang) {
      // @ts-ignore
      window.I18nMsg.lang = evt.detail.lang;
    }
  }

  /**
   * Event handler for the 'logout' action channel.
   *
   * @private
   */
  _logoutSubscriptor() {
    this.bridge.logout();
  }

  /**
   * Event handler for the 'interceptor_context' action channel.
   *
   * @private
   * @param {WCEvent} evt - The event object.
   */
  _appContextSubscriptor(evt) {
    const appContext = evt.detail;
    this.bridge.setInterceptorContext(appContext);
  }
}
