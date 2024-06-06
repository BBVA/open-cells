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

/** @typedef {import('../types').QueryParams} QueryParams */

/**
 * Represents a route in a web application.
 *
 * @class Route
 */
export class Route {
  /**
   * Regular expression to match route parameters in a route pattern.
   *
   * @type {RegExp}
   */
  static PARAM = /(?::([^/]+))/g;
  /**
   * Regular expression to match trailing slashes in a route pattern.
   *
   * @type {RegExp}
   */
  static TRAILING_SLASHES = /\/*$/;

  /**
   * The name of the route.
   *
   * @type {string}
   */
  name = '';
  /**
   * The parameters of the route.
   *
   * @type {QueryParams}
   * @t ype {{ [key: string]: string | number }}
   */
  params = {};
  /**
   * The patterns of the route.
   *
   * @type {string[]}
   */
  patterns = [''];
  /**
   * The regular expressions derived from the route patterns.
   *
   * @type {RegExp[]}
   */
  regexps;
  /**
   * The page to redirect to.
   *
   * @type {string | null}
   */
  redirectPage = null;
  /**
   * Indicates whether the route is accessible.
   *
   * @type {boolean}
   */
  isAccessible = true;
  /**
   * Indicates whether the route is wildcarded.
   *
   * @type {boolean}
   */
  isWildcarded = false;

  /**
   * Creates a new Route instance.
   *
   * @param {string} name - The name of the route.
   * @param {string | string[]} pattern - The pattern(s) of the route.
   * @param {Function} action - The action to be performed when the route is matched.
   * @param {boolean} [notFound=false] - Indicates whether the route represents the 404 page.
   * @param {string | undefined} component - The name of component.
   *   Default is `false`
   */
  constructor(name, pattern, action, notFound = false, component = undefined) {
    this.name = name;
    this.patterns = typeof pattern === 'string' ? [pattern] : pattern;
    this.action = action;
    this.notFound = notFound;
    this.component = component;
    this.regexps = this.patterns.map(p => this._getRegExp(p));
  }

  /**
   * Sanitizes a route pattern and returns a regular expression for matching the route.
   *
   * @param {string} p - The route pattern.
   * @returns {RegExp} - The regular expression for matching the route.
   */
  _getRegExp(p) {
    let urlPattern = p;
    let regex;
    let trailingSlashesReplacement = '/*';
    let regExEnding = '$';

    const indexOfWildcard = urlPattern.indexOf('*');
    if (indexOfWildcard >= 0) {
      this.isWildcarded = true;
      urlPattern = urlPattern.substring(0, indexOfWildcard);
      trailingSlashesReplacement = '/+';
      regExEnding = '';
    }
    let regexpStr = urlPattern
      .replace(Route.PARAM, '([^/]+)')
      .replace(Route.TRAILING_SLASHES, trailingSlashesReplacement);
    return new RegExp('^' + regexpStr + regExEnding);
  }

  /**
   * Generates a path for the route using the specified parameters.
   *
   * @param {QueryParams | undefined} params - The parameters for generating the path.
   * @returns {string} - The generated path.
   */
  path(params) {
    params = params || {};
    this.params = {};
    /** @type {RegExpExecArray | null} */
    let parts;
    let path = this.patterns[0];
    while ((parts = Route.PARAM.exec(this.patterns[0])) !== null) {
      path = path.replace(parts[0], '' + params[parts[1]]);
      this.params[parts[1]] = params[parts[1]];
    }
    const queryParams = [];
    for (let param in params) {
      if (!this.params.hasOwnProperty(param)) {
        queryParams.push(param + '=' + encodeURIComponent(params[param]));
      }
    }
    if (queryParams.length) {
      path += '?' + queryParams.join('&');
    }
    return path;
  }

  /**
   * Matches the specified path against the route patterns and returns the matching information.
   *
   * @param {string} path - The path to match.
   * @returns {?{
   *   index: number;
   *   parts: RegExpExecArray;
   *   pattern: string;
   *   regex: RegExp;
   * }}
   *   - The matching information, or null if no match is found.
   */
  matchPath(path) {
    let match = null;
    this.regexps.forEach((re, i) => {
      let result = path.match(re);
      if (result) {
        match = {
          index: i,
          regex: this.regexps[i],
          pattern: this.patterns[i],
          parts: result,
        };
      }
    });
    return match;
  }

  /**
   * Parses the specified path and extracts the route parameters.
   *
   * @param {string} path - The path to parse.
   */
  parsePath(path) {
    let match = this.matchPath(path);
    this.params = {};
    this.subroute = undefined;
    if (match) {
      let i = 1;
      let parts;
      if (match.parts[0] !== match.parts.input) {
        this.subroute = match.parts.input.substring(match.parts[0].length - 1);
      }
      while ((parts = Route.PARAM.exec(match.pattern)) !== null) {
        this.params[parts[1]] = this._parseParam(match.parts[i]);
        i++;
      }
    }
  }

  /**
   * Parses the specified query string and adds the parameters to the route.
   *
   * @param {any} query - The query string or object.
   */
  parseQuery(query) {
    this.query = query;
    for (let queryParam in this.query) {
      if (this.query.hasOwnProperty(queryParam)) {
        this.params[queryParam] = this.query[queryParam];
      }
    }
  }

  /**
   * Checks if the route represents the 404 page.
   *
   * @returns {boolean} - True if the route represents the 404 page, false otherwise.
   */
  is404() {
    return this.notFound === true;
  }

  /**
   * Checks if a value is a number.
   *
   * @private
   * @param {string} value - The value to check.
   * @returns {boolean} - True if the value is a number, false otherwise.
   */
  _isNumber(value) {
    return parseInt(value) + '' === value || parseFloat(value) + '' === value;
  }

  /**
   * Parses a route parameter and returns it as a string or number.
   *
   * @private
   * @param {string} param - The route parameter to parse.
   * @returns {string | number} - The parsed route parameter.
   */
  _parseParam(param) {
    return this._isNumber(param) ? +param : param;
  }

  /** Placeholder method for handling the current route. */
  handler() {
    // Overwrite to perform actions with the current route
  }
}
