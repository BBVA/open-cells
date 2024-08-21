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

import { attributeWhiteList, setAttribute } from '../utils.js';

const dashToCamelCase = input => {
  return input.toLowerCase().replace(/-(.)/g, function (match, group1) {
    return group1.toUpperCase();
  });
};

/**
 * Checks if the given string is a valid custom element tag name
 * @param {string} tagName - element tag mane
 * @returns {boolean}
 */
export function isCustomElementTagName(tagName) {
  return tagName.includes('-');
}

/**
 * Invoke a given function when element has been defined, non custom elements
 * callback is inmediallty executed
 * @param {Element} node - given node element to wait for registration
 * @param {Function} cb - callback to be executed
 */
export function whenElementDefined(node, cb) {
  const nodeName = node.tagName.toLowerCase();
  if (isCustomElementTagName(nodeName)) {
    window.customElements.whenDefined(nodeName)
      .then(() => {
        try {
          // prevent to execute callback when node has not been upgrated after element registration
          window.customElements.upgrade(node);
        } finally {
          cb();
        }
      });
  } else {
    cb();
  }
}

/**
 * Checks if the given node is a web component and has been registered into
 * CustomElementRegistry
 * @param {Element} node
 * @returns {boolean}
 */
export function elementHasBeenResolved(node) {
  const nodeName = node.tagName.toLowerCase();
  return !isCustomElementTagName(nodeName) || !!window.customElements.get(nodeName);
}

export function isEventAtTarget(event) {
  const AT_TARGET_VALUE = Event.AT_TARGET || Event.prototype.AT_TARGET;
  return event.eventPhase === AT_TARGET_VALUE;
}

/**
  * Dispatches a function from a given HTMLElement.
  * @param {HTMLElement} target - element to be invoked
  * @param {(keyof HTMLElement)} method - method to be executed
  * @param {CustomEvent} e - event with the current value
  */
export function dispatchNodeFunction(target, method, e) {
  if (target[method] && typeof target[method] === 'function') {
    target[method](e.detail)
  }
}

/**
  * Sets given value from a given HTMLElement.
  * @template {HTMLElement} T
  * @param {T} target - element to be invoked
  * @param {(keyof T)} property - property to be setted
  * @param {CustomEvent} e - event with the current value
  */
export function dispatchNodeProperty(target, property, e) {
  const changedProperty = getChangedProperty(e.type);
  let value;
  if(changedProperty && e.detail && Object.prototype.hasOwnProperty.call(evt.detail, 'value')) {
    value = e.detail.value;
  } else {
    value = e.detail;
  }

  if(!attributeWhiteList.includes(property) && target[property]) {
    target[property] = value;
  } else {
    setAttribute(target, property, value);
  }
}

/**
 * Gets the property of a changed event name.
 * @param {string} name - event type
 */
function getChangedProperty(name) {
  const EVENT_CHANGED = '-changed';

  if (name.indexOf(EVENT_CHANGED, name.length - EVENT_CHANGED.length) !== -1) {
    let propertyName;
    propertyName = name.slice(0, -EVENT_CHANGED.length);
    propertyName = dashToCamelCase(propertyName);
    return propertyName;
  }

  return null;
}
