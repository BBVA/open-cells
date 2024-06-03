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

import { EventEmitter } from '../external/event-emitter';

/**
 * @typedef {import('../../types').WCNode} WCNode
 *
 * @typedef {import('../../types').WCEvent} WCEvent
 *
 * @typedef {import('../../types').AugmentedFunction} AugmentedFunction
 */

/** @type {number} */
const MAX_NUM_LISTENERS = 20;

/** Custom event emitter class that extends EventEmitter. */
class CustomEventEmitter extends EventEmitter {
  constructor(maxNumListeners = 10) {
    super();
    this.setMaxListeners(maxNumListeners);
  }
  /**
   * Listens to an event on a given node and executes the callback function once.
   *
   * @param {WCNode} node - The node to listen to the event on.
   * @param {string} name - The name of the event to listen for.
   * @param {Function} callback - The callback function to execute when the event is triggered.
   */
  listenToOnce(node, name, callback) {
    node.addEventListener(name, function cb(event) {
      callback();
      event.currentTarget?.removeEventListener(event.type, cb);
    });
  }

  /**
   * Creates an event.
   *
   * @param {string} name - The name of the event.
   * @param {any} value - The value of the event.
   * @returns {WCEvent} The created event.
   */
  createEvent(name, value) {
    /** @type {WCEvent} */
    let evt = new Event(name);
    evt.detail = { value };
    return evt;
  }
}

export const eventManager = new CustomEventEmitter(MAX_NUM_LISTENERS);
