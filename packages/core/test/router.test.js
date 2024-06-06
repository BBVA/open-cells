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

import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { Route } from '../src/route';

describe('Router', () => {
  let route;

  beforeEach(() => {
    route = new Route('test', '/test/:id', () => {});
  });

  describe('#_getRegExp', () => {
    it('should return a regular expression for matching the route', () => {
      const regex = route._getRegExp('/test/:id');
      expect(regex).to.be.instanceOf(RegExp);
    });

    it('should set isWildcarded to true if pattern contains a wildcard', () => {
      route._getRegExp('/test/*');
      expect(route.isWildcarded).to.be.true;
    });
  });

  describe('#path', () => {
    it('should generate a path for the route using the specified parameters', () => {
      const path = route.path({ id: 1 });
      expect(path).to.equal('/test/1');
    });

    it('should append query parameters to the path', () => {
      const path = route.path({ id: 1, foo: 'bar' });
      expect(path).to.equal('/test/1?foo=bar');
    });
  });

  describe('#matchPath', () => {
    it('should match the specified path against the route patterns', () => {
      const match = route.matchPath('/test/1');
      expect(match).to.exist;
    });

    it('should return null if no match is found', () => {
      const match = route.matchPath('/no-match');
      expect(match).to.be.null;
    });
  });

  describe('#parsePath', () => {
    it('should parse the specified path and extract the route parameters', () => {
      route.parsePath('/test/1');
      expect(route.params).to.deep.equal({ id: 1 });
    });

    it('should set subroute if path does not fully match pattern', () => {
      const routeAndSubroute = new Route('test', '/test/*', () => {});
      routeAndSubroute.parsePath('/test/subroute');
      expect(routeAndSubroute.subroute).to.equal('/subroute');
    });
  });

  describe('#parseQuery', () => {
    it('should parse the specified query string and add the parameters to the route', () => {
      route.parseQuery({ foo: 'bar' });
      expect(route.params).to.deep.equal({ foo: 'bar' });
    });
  });

  describe('#is404', () => {
    it('should check if the route represents the 404 page', () => {
      const is404 = route.is404();
      expect(is404).to.be.false;
    });
  });

  describe('#_isNumber', () => {
    it('should check if a value is a number', () => {
      const isNumber = route._isNumber('1');
      expect(isNumber).to.be.true;
    });

    it('should return false if value is not a number', () => {
      const isNumber = route._isNumber('abc');
      expect(isNumber).to.be.false;
    });
  });
});
