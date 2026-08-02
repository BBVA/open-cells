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
import { Router } from '../src/router';

describe('Router', () => {
  let route;

  describe('#_createRouteSnapshot', () => {
    it('should build an internal route snapshot from remix router state', () => {
      const router = new Router();
      const state = {
        location: { pathname: '/test/42', search: '?foo=bar' },
        navigation: { state: 'loading' },
        revalidation: 'loading',
        loaderData: { home: { ok: true } },
        actionData: { home: { submitted: true } },
        errors: null,
        matches: [{ route: { id: 'home' }, params: { id: '42' } }],
        historyAction: 'PUSH'
      };

      const snapshot = router._createRouteSnapshot(state, {
        path: '/test/:id',
        component: 'home-component'
      });

      expect(snapshot.name).to.equal('home');
      expect(snapshot.params).to.deep.equal({ id: '42', foo: 'bar' });
      expect(snapshot.query).to.deep.equal({ foo: 'bar' });
      expect(snapshot.pending).to.equal(true);
      expect(snapshot.revalidating).to.equal(true);
      expect(snapshot.historyAction).to.equal('PUSH');
      expect(snapshot.component).to.equal('home-component');
      expect(snapshot.loaderData).to.deep.equal({ ok: true });
      expect(snapshot.actionData).to.deep.equal({ submitted: true });
    });
  });

  describe('#_resolvePhase', () => {
    it('should classify router state into lifecycle phases', () => {
      const router = new Router();

      expect(router._resolvePhase({ initialized: false })).to.equal('start');
      expect(router._resolvePhase({ initialized: true, errors: { home: new Error('boom') } })).to.equal('error');
      expect(router._resolvePhase({ initialized: true, revalidation: 'loading' })).to.equal('revalidate');
      expect(router._resolvePhase({ initialized: true, navigation: { state: 'submitting' } })).to.equal('navigation');
      expect(router._resolvePhase({ initialized: true, navigation: { state: 'idle' }, revalidation: 'idle' })).to.equal('ready');
    });
  });

  describe('#_isInitialBootstrap', () => {
    it('should detect the initial bootstrap before any route has been applied', () => {
      const router = new Router();
      expect(router._isInitialBootstrap()).to.equal(true);

      router._currentRoute = { name: 'home' };
      expect(router._isInitialBootstrap()).to.equal(false);
    });
  });

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
