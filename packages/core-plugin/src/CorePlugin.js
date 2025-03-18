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

import { enqueueCommand, $bridge } from '@open-cells/core';

const services = {};
export class CorePlugin {
  /**
   * Calls a command on the bridge with the provided parameters. If the bridge is not ready, the
   * command is enqueued to be executed later.
   *
   * @param {...any} args - The arguments to pass to the bridge command. The first argument is the
   *   command name, and the rest are the parameters for the command.
   * @returns {any} The result of the bridge command, or undefined if the bridge is not ready.
   * @throws {Error} If the bridge is ready but the command does not exist on the bridge.
   */
  __callBridge(...args) {
    const [command, ...parameters] = args;
    let result;

    // cells is ready
    if ($bridge) {
      // @ts-ignore
      if (!$bridge[command]) {
        throw new Error(`WARNING: Invalid cells bridge command execution: ${command}.`);
      }
      // @ts-ignore
      result = $bridge[command](...parameters);
      return result;
    }

    enqueueCommand(command, parameters);
    return result;
  }

  registerService(serviceName, fn) {
    this.services[serviceName] = fn;
  }

  constructor() {
    this.services = services;
    const self = this;
    this.registerService('subscribe', function (channelName, callback) {
      return self.__callBridge('registerInConnection', channelName, this, callback);
    });
    this.registerService('unsubscribe', function (channels) {
      return self.__callBridge('unsubscribe', channels, this);
    });
    this.registerService('publish', function (channelName, value, options = {}) {
      return self.__callBridge('publish', channelName, value, options);
    });
    this.registerService('publishOn', function (channelName, htmlElement, eventName) {
      return self.__callBridge('registerOutConnection', channelName, htmlElement, eventName);
    });
    this.registerService('navigate', function (page, params) {
      return self.__callBridge('navigate', page, params);
    });
    this.registerService('updateInterceptorContext', function (ctx) {
      return self.__callBridge('updateInterceptorContext', ctx);
    });
    this.registerService('resetInterceptorContext', function () {
      return self.__callBridge('resetInterceptorContext');
    });
    this.registerService('getInterceptorContext', function () {
      return self.__callBridge('getInterceptorContext');
    });
    this.registerService('setInterceptorContext', function (ctx) {
      return self.__callBridge('setInterceptorContext', ctx);
    });
    this.registerService('getCurrentRoute', function () {
      return self.__callBridge('getCurrentRoute');
    });
    this.registerService('updateSubroute', function (subroute) {
      return self.__callBridge('updateSubroute', subroute);
    });
  }

  _plugCellsCore(element, bindToElement = true) {
    Object.entries(this.services).forEach(function ([key, fn]) {
      element[key] = bindToElement ? fn.bind(element) : fn;
    });
  }

  _plugCellsCoreToPrototype(element, bindToElement = true) {
    Object.entries(this.services).forEach(function ([key, fn]) {
      Object.defineProperty(element.prototype, key, {
        value: bindToElement ? fn.bind(element) : fn,
        writable: true,
        configurable: true,
      });
    });
  }

  addCellsCoreToPrototype(element) {
    _plugCellsCoreToPrototype(element, false);
  }
}

export function plugCellsCore(element) {
  const corePlugin = new CorePlugin();
  corePlugin._plugCellsCore(element, false);
  return element;
}
