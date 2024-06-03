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

/** @typedef {import('../../types').Dictionary} Dictionary */

/** Represents an in-memory storage. */
class InMemmoryStorage {
  /**
   * The dictionary object that stores the key-value pairs.
   *
   * @type {Dictionary}
   */
  dictionary = {};

  /**
   * Retrieves the value associated with the specified key.
   *
   * @param {string} key - The key to retrieve the value for.
   * @returns {any} The value associated with the key, or null if the key does not exist.
   */
  getItem(key) {
    return this.dictionary[key] || null;
  }

  /**
   * Sets the value for the specified key.
   *
   * @param {string} key - The key to set the value for.
   * @param {any} value - The value to be set.
   */
  setItem(key, value) {
    this.dictionary[key] = value;
  }

  /**
   * Removes the value for the specified key.
   *
   * @param {string} key - The key to set the value for.
   */
  removeItem(key) {
    delete this.dictionary[key];
  }
}

/**
 * Class representing a CellsStorage.
 *
 * @class
 */
export class CellsStorage {
  /**
   * The prefix for the storage keys.
   *
   * @type {string}
   */
  prefix = '';

  /**
   * Indicates whether the storage is persistent or not.
   *
   * @type {boolean}
   */
  persistent = false;

  /**
   * The internal storage used when persistent storage is not available.
   *
   * @type {InMemmoryStorage}
   */
  internalStorage = new InMemmoryStorage();

  /**
   * Creates an instance of CellsStorage.
   *
   * @param {Object} options - The options for the storage.
   */
  constructor(options) {
    Object.assign(this, options);

    if (this.persistent) {
      this.clear();
    }
  }

  /**
   * Gets the storage object.
   *
   * @type {Storage | InMemmoryStorage}
   */
  get storage() {
    let store;
    try {
      store = this.persistent ? window.localStorage : window.sessionStorage;
      store.setItem('_$_', JSON.stringify({}));
    } catch (error) {
      store = this.internalStorage;
    }
    return store;
  }

  /**
   * Gets the value associated with the specified key.
   *
   * @param {string} key - The key to retrieve the value for.
   * @returns {any | null} The value associated with the key.
   */
  getItem(key) {
    return JSON.parse(this.storage.getItem(this.prefix + key));
  }

  /**
   * Sets the value associated with the specified key.
   *
   * @param {string} key - The key to set the value for.
   * @param {any} value - The value to set.
   */
  setItem(key, value) {
    this.storage.setItem(this.prefix + key, JSON.stringify(value));
  }

  /** Clears all the storage items with keys that match the prefix. */
  clear() {
    var pattern = new RegExp('^(' + this.prefix + ')');

    for (let key in this.storage) {
      if (this.storage.hasOwnProperty(key)) {
        if (pattern.test(key)) {
          this.storage.removeItem(key);
        }
      }
    }
  }
}
