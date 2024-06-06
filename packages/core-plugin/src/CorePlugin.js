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

import {
  subscribe,
  unsubscribe,
  publish,
  publishOn,
  navigate,
  updateInterceptorContext,
  resetInterceptorContext,
  getInterceptorContext,
  setInterceptorContext,
  getCurrentRoute,
  updateSubroute,
  backStep,
} from '@open-cells/core';

const services = {};

services['subscribe'] = function (channelName, callback) {
  subscribe(channelName, this, callback);
};

services['unsubscribe'] = function (channels) {
  unsubscribe(channels, this);
};

services['publish'] = function (channelName, value, options = {}) {
  publish(channelName, value, options);
};

services['publishOn'] = function (channelName, htmlElement, eventName) {
  publishOn(channelName, htmlElement, eventName);
};

services['navigate'] = function (page, params) {
  navigate(page, params);
};

services['updateInterceptorContext'] = function (ctx) {
  updateInterceptorContext(ctx);
};

services['resetInterceptorContext'] = function () {
  resetInterceptorContext();
};

services['getInterceptorContext'] = function () {
  return getInterceptorContext();
};

services['setInterceptorContext'] = function (ctx) {
  setInterceptorContext(ctx);
};

services['getCurrentRoute'] = function () {
  getCurrentRoute();
};

services['updateSubroute'] = function (subroute) {
  updateSubroute(subroute);
};

services['backStep'] = function () {
  backStep();
};

function _plugCellsCore(element, bindToElement = true) {
  Object.entries(services).forEach(function ([key, fn]) {
    element[key] = bindToElement ? fn.bind(element) : fn;
  });
}

function _plugCellsCoreToPrototype(element, bindToElement = true) {
  Object.entries(services).forEach(function ([key, fn]) {
    Object.defineProperty(element.prototype, key, {
      value: bindToElement ? fn.bind(element) : fn,
      writable: true,
      configurable: true,
    });
  });
}

export function addCellsCoreToPrototype(element) {
  _plugCellsCoreToPrototype(element, false);
}

export function plugCellsCore(element) {
  _plugCellsCore(element, false);
  return element;
}
