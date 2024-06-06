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

describe('Route', () => {
  let route;
  const mockAction = sinon.stub();

  beforeEach(() => {
    route = new Route('test', '/test/:id', mockAction);
  });

  describe('#constructor', () => {
    it('should create a new Route instance', () => {
      expect(route.name).to.equal('test');
      expect(route.patterns).to.deep.equal(['/test/:id']);
      expect(route.action).to.equal(mockAction);
    });
  });

  describe('#_getRegExp', () => {
    it('should return a regular expression for matching the route', () => {
      const regex = route._getRegExp('/test/:id');
      expect(regex).to.be.instanceOf(RegExp);
    });
  });

  describe('#path', () => {
    it('should generate a path for the route using the specified parameters', () => {
      const path = route.path({ id: 1 });
      expect(path).to.equal('/test/1');
    });
  });

  describe('#matchPath', () => {
    it('should match the specified path against the route patterns', () => {
      const match = route.matchPath('/test/1');
      expect(match).to.exist;
    });
  });

  describe('#parsePath', () => {
    it('should parse the specified path and extract the route parameters', () => {
      route.parsePath('/test/1');
      expect(route.params).to.deep.equal({ id: 1 });
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
  });
});
