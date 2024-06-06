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

import { CellsStorage } from './storage';

const CONFIG_STORAGE_PREFIX = '__app_';
const CONFIG_STORAGE_KEY = 'state';

/** @typedef {import('../component-connector').ComponentConnector} ComponentConnector */

/** Represents the application state manager. */
export class ApplicationStateManager {
  /**
   * @param {object} config - The configuration object.
   * @param {ComponentConnector} config.ComponentConnector - The component connector instance.
   */
  constructor({ ComponentConnector }) {
    this.ComponentConnector = ComponentConnector;
    this.storage = this._getAppStateStorage();
  }

  /**
   * Returns the application state storage.
   *
   * @private
   * @returns {CellsStorage} The application state storage.
   */
  _getAppStateStorage() {
    return new CellsStorage({
      prefix: CONFIG_STORAGE_PREFIX,
      persistent: false,
    });
  }

  /**
   * Saves the application state for a specific channel.
   *
   * @param {string} channelName - The name of the channel.
   * @param {any} value - The value to be saved.
   */
  saveAppState(channelName, value) {
    const state = this.storage.getItem(CONFIG_STORAGE_KEY);

    if (state) {
      state[channelName] = value;
      this.storage.setItem(CONFIG_STORAGE_KEY, state);
    }
  }

  /** Loads the application state from storage and publishes it to the corresponding channels. */
  loadAppState() {
    const state = this.storage.getItem(CONFIG_STORAGE_KEY);

    for (let channel in state) {
      this.ComponentConnector.publish(channel, state[channel]);
    }
  }
}
