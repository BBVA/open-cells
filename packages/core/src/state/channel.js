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

import { ReplaySubject } from 'rxjs';

/** @typedef {import('../../types').PublishableValue} PublishableValue */

/**
 * Generate a UUID.
 *
 * @returns {String} The generated UUID.
 */
export function generateUUID() {
  let d = new Date().getTime();
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (d + Math.random() * 16) % 16 | 0;
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

/** @extends ReplaySubject<PublishableValue> */
// @ts-ignore
export class Channel extends ReplaySubject {
  /**
   * Creates a channel for sending values, errors, and completion signals.
   *
   * @param {string} name - The name of the channel.
   */
  constructor(name) {
    super(1);
    this.name = name;
  }

  /**
   * Sends the next value to the channel. If the value does not have a UUID, it generates one. If
   * the value does not have a time, it sets the current time.
   *
   * @param {PublishableValue} value - The value to be sent to the channel.
   * @returns {void}
   */
  next(value) {
    if (!value.uuid) {
      value.uuid = generateUUID();
    }
    if (!value.time) {
      value.time = new Date().getTime();
    }
    super.next(value);
  }

  /**
   * Checks if the channel has any observers.
   *
   * @returns {boolean} True if the channel has observers, false otherwise.
   * @throws {Error} If the channel is closed.
   */
  hasObservers() {
    if (this.closed) {
      throw new Error();
    }

    return this.observed;
  }

  // /**
  //  * Unsubscribes an observer from the channel.
  //  *
  //  * @param {number} index - The index of the observer to unsubscribe.
  //  * @returns {void}
  //  */
  // unsubscribeObserver(index) {
  //   this.observers?.splice(index, 1);
  //   if (this.observers?.length === 0) {
  //     this.unsubscribe();
  //   }
  // }

  /**
   * Unsubscribes all observers from the channel.
   *
   * @returns {void}
   */
  unsubscribeAllObservers() {
    this.unsubscribe();
  }

  /**
   * Cleans the channel by resetting the buffer and observers.
   *
   * @memberof Channel
   * @function
   * @returns {void}
   * @name clean
   * @instance
   */
  clean() {
    /** @type {any[]} */
    // @ts-ignore
    this._buffer = [];
    /** @type {any[]} */
    // this.observers = [];
    this._clearObservers();
  }

  get buffer() {
    // @ts-ignore
    return this._buffer;
  }

  set buffer(value) {
    // @ts-ignore
    this._buffer = value;
  }

  // /**
  //  * Disposes the channel by unsubscribing from it.
  //  *
  //  * @memberof Channel
  //  * @function
  //  * @returns {void}
  //  * @instance
  //  */
  // dispose() {
  //   this.unsubscribeAllObsrvers();
  // }
}

/**
 * Creates a channel for sending values, errors, and completion signals.
 *
 * @param {string} name - The name of the channel.
 * @returns {Channel} The created channel.
 */
export const createChannel = name => {
  return new Channel(name);
};

/**
 * Creates a channel for sending values, errors, and completion signals.
 *
 * @returns {Channel} The created channel.
 */
// export const createChannel = () => {
//   const channel = new ReplaySubject(1);

//   const _nextFromSuperClass = channel.next.bind(channel);

//   /**
//    * Send the next value on the channel.
//    * @param {PublishedValue} value The value to send.
//    */
//   channel.next = function (value) {
//     if (!value.uuid) {
//       value.uuid = generateUUID();
//     }
//     if (!value.time) {
//       value.time = new Date().getTime();
//     }
//     _nextFromSuperClass(value);
//   };
//   /**
//    * Check if the channel has observers.
//    * @returns  {boolean} True if the channel has observers, false otherwise.
//    */
//   channel.hasObservers = function () {
//     if (this.closed) {
//       throw new Error();
//     }

//     return this.observers.length > 0;
//   };

//   channel.complete = function () {};
//   /**
//    * Send an error on the channel.
//    * @param  {any} error The error to send.
//    */
//   channel.error = function (error) {
//     this.observers.forEach(function (o) {
//       o.isStopped = false;
//       o.onError(error);
//     });
//   };

//   /**
//    * Unsubscribe an observer from the channel.
//    * @param  {Number} index The index of the observer to unsubscribe.
//    */
//   channel.unsubscribe = function (index) {
//     this.observers.splice(index, 1);
//   };

//   /**
//    * Unsubscribe all observers from the channel.
//    */
//   channel.unsubscribeAll = function () {
//     this.observers.splice(0, this.observers.length);
//   };

//   /**
//    * Clean the channel.
//    */
//   channel.clean = function () {
//     this._buffer = [];
//     this.observers = [];
//   };

//   /**
//    * Dispose the channel.
//    */
//   channel.dispose = function () {
//     this.unsubscribe();
//   };

//   return channel;
// };
