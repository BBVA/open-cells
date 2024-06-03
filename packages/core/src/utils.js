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

// Taken from string.js npm package
// https://github.com/jprichardson/string.js

/**
 * Converts a string to dasherized format.
 *
 * @param {string} str - The input string.
 * @returns {string} - The dasherized string.
 */
export const dasherize = str =>
  str
    .trim()
    .replace(/[_\s]+/g, '-')
    .replace(/([A-Z])/g, '-$1')
    .replace(/-+/g, '-')
    .toLowerCase();

/**
 * Converts a string to camelized format.
 *
 * @param {string} str - The input string.
 * @returns {string} - The camelized string.
 */
export const camelize = str =>
  str.trim().replace(/(-|_|\s)+(.)?/g, (mathc, sep, c) => (c ? c.toUpperCase() : ''));

/**
 * Checks if an object is a plain object.
 *
 * @param {any} obj - The object to check.
 * @returns {boolean} - True if the object is a plain object, false otherwise.
 */
export const isPlainObject = obj => Object.prototype.toString.call(obj) === '[object Object]';

/**
 * Finds a property in an array of objects.
 *
 * @param {string} prop - The property to find.
 * @returns {function(any[]): any[]} - A function that takes an array and returns an array of values
 *   for the given property.
 */
export const findPropertyInArray =
  /** @type {function(string): function(any[]): any[]} */
  prop => arr => arr.map(findProperty(prop)).flat();

/**
 * Finds a property in an object or nested objects.
 *
 * @param {string} prop - The property to find.
 * @returns {function(Object): any[]} - A function that takes an object and returns an array of
 *   values for the given property.
 */
export const findPropertyInObject =
  /** @type {function(string): function(Object): any[]} */
  prop => collection =>
    Object.entries(collection)
      .map(([k, v]) => (k === prop ? [v] : findProperty(prop)(v)))
      .flat();

/**
 * Finds a property in an object or nested objects.
 *
 * @param {string} prop - The property to find.
 * @returns {function( any ): any[]} - A function that takes a value and returns an array of values
 *   for the given property.
 */
export const findProperty =
  /** @type {function(string): function( any ): any[]} */
  prop => v =>
    isPlainObject(v)
      ? findPropertyInObject(prop)(v)
      : Array.isArray(v)
        ? findPropertyInArray(prop)(v)
        : [];

/**
 * List of attribute names that are allowed.
 *
 * @type {string[]}
 */
export const attributeWhiteList = ['ambient', 'variant', 'disabled'];

/**
 * Sets an attribute on a DOM node.
 *
 * @param {HTMLElement} node - The DOM node.
 * @param {string} attr - The attribute name.
 * @param {string | boolean} value - The attribute value.
 * @returns {void}
 */
export const setAttribute = (node, attr, value) => {
  if (typeof value === 'boolean') {
    if (value) {
      node.setAttribute(attr, '');
    } else {
      node.removeAttribute(attr);
    }
  } else {
    node.setAttribute(attr, value);
  }
};

export const Utils = {
  dasherize,
  camelize,
  findProperty,
  attributeWhiteList,
  setAttribute,
};
