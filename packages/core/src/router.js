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

import { createRouter, createHashHistory, createBrowserHistory } from '@remix-run/router';
import { eventManager } from './manager/events';
import { NavigationStack } from './navigation-stack';
import { Constants } from './constants';

/**
 * @typedef {import('../types').Navigation} Navigation
 *
 * @typedef {import('../types').QueryParams} QueryParams
 *
 * @typedef {import('../types').ParsedRoute} ParsedRoute
 *
 * @typedef {import('../types').RoutePage} RoutePage
 *
 * @typedef {import('./manager/bridge-channels').BridgeChannelManager} BridgeChannelManager
 *
 * @typedef {import('../types').NavigationWithParams} NavigationWithParams
 *
 * @typedef {import('../types').WCEvent} WCEvent
 */

/**
 * @constant
 * @type {Constants}
 */
const { externalEventsCodes } = Constants;

/** @type {Router | null} */
let instance = null;

/**
 * Represents a router that handles navigation and routing in the application using @remix-run/router.
 * The Router class provides methods for adding routes, matching routes, and handling navigation events.
 *
 * @class Router
 */
export class Router {
  /**
   * Indicates whether the browser supports the History API.
   *
   * @type {boolean}
   */
  static SUPPORTS_HISTORY_API = window.history && 'pushState' in window.history;

  /**
   * Indicates whether a navigation is currently in progress.
   *
   * @type {boolean}
   */
  static isNavigationInProgress = false;

  /**
   * Represents the status of a cancelled navigation.
   *
   * @type {string}
   */
  static cancelledNavigation;

  /**
   * Indicates whether the hash is dirty or not.
   *
   * @type {boolean}
   */
  static hashIsDirty = false;

  /**
   * Represents the navigation stack.
   *
   * @type {NavigationStack}
   */
  navigationStack;

  /**
   * The channel manager handles the communication channels in the router.
   *
   * @type {BridgeChannelManager | null}
   */
  _channelManager = null;

  /**
   * Indicates whether to use browser history (pushState) or hash history.
   * When true, uses createBrowserHistory; when false, uses createHashHistory.
   *
   * @type {boolean}
   */
  _useHistory = false;

  /**
   * The context object for interceptors.
   *
   * @type {Object}
   */
  interceptorContext = {};

  /**
   * The remix-run router instance.
   *
   * @type {import('@remix-run/router').Router | null}
   */
  _remixRouter = null;

  /**
   * The browser or hash history instance.
   *
   * @type {import('@remix-run/router').HashHistory | import('@remix-run/router').BrowserHistory | null}
   */
  _history = null;

  /**
   * Map of route names to route configurations.
   *
   * @type {Map<string, {path: string, action: Function, notFound: boolean, component: string|undefined}>}
   */
  _routeConfig = new Map();

  /**
   * Current route information.
   *
   * @type {{name: string, params: QueryParams, query: QueryParams, subroute: string|undefined}}
   */
  _currentRoute = {
    name: '',
    params: {},
    query: {},
    subroute: undefined
  };

  /**
   * Subscription to the remix router state changes.
   *
   * @type {Function | null}
   */
  _unsubscribeRemixRouter = null;

  /**
   * Internal scroll restoration state for the remix router.
   *
   * @type {Record<string, number>}
   */
  _scrollPositions = {};

  /**
   * Internal route snapshot metadata used by the wrapper.
   *
   * @type {Object | null}
   */
  _routeSnapshot = null;

  /**
   * Creates a new Router instance.
   *
   * @class
   */
  constructor() {
    const { TEMPLATE_TRANSITION_END } = externalEventsCodes;

    if (!instance) {
      instance = this;
    }

    this.navigationStack = this._createNavigationStack();

    eventManager.on(TEMPLATE_TRANSITION_END, () => {
      this.isNavigationInProgress = false;
    });

    return instance;
  }

  /**
   * Creates a new navigation stack.
   *
   * @returns {NavigationStack} The newly created navigation stack.
   */
  _createNavigationStack() {
    return new NavigationStack();
  }

  /**
   * Setter for the useHistory property.
   *
   * @param {boolean} value - The value to set for useHistory.
   */
  set useHistory(value) {
    if (Router.SUPPORTS_HISTORY_API) {
      this._useHistory = value;
    }
  }

  /**
   * Getter for the useHistory property.
   *
   * @returns {boolean} The useHistory object.
   */
  get useHistory() {
    return this._useHistory;
  }

  /**
   * Setter for the channelManager property.
   *
   * @param {BridgeChannelManager} channelManager - The channel manager to be set.
   */
  set channelManager(channelManager) {
    this._channelManager = channelManager;
  }

  /**
   * Getter for the channelManager property.
   *
   * @returns {BridgeChannelManager | null} The channel manager.
   */
  get channelManager() {
    return this._channelManager;
  }

  /**
   * Setter for the routes property.
   *
   * @param {Object} routes - The routes to be set.
   */
  set routes(routes) {
    // Convert routes object to route config map
    this._routeConfig.clear();
    if (routes) {
      Object.entries(routes).forEach(([name, config]) => {
        this._routeConfig.set(name, {
          path: config.path,
          action: config.action,
          notFound: Boolean(config.notFound),
          component: config.component
        });
      });
    }
  }

  /**
   * Get the routes.
   *
   * @returns {Object} The routes.
   */
  get routes() {
    const routesObj = {};
    this._routeConfig.forEach((config, name) => {
      routesObj[name] = {
        path: config.path,
        action: config.action,
        notFound: config.notFound,
        component: config.component
      };
    });
    return routesObj;
  }

  /**
   * Gets the current route.
   *
   * @returns {Object} The current route.
   */
  get currentRoute() {
    return this._currentRoute;
  }

  /**
   * Sets the current route.
   *
   * @param {Object} route - The current route.
   */
  set currentRoute(route) {
    this._currentRoute = route;
  }

  /**
   * Handler function called when route changes.
   *
   * @param {Object} route - The current route.
   */
  handler(route) {
    console.log('🎯 Router.handler() called with:', route);
    // Overwrite to make something after all matched routes
  }

  /**
   * Adds a route to the router.
   *
   * @param {string} name - The name of the route.
   * @param {string | string[]} patterns - The patterns associated with the route.
   * @param {Function} action - The action to be executed when the route is matched.
   * @param {boolean} notFound - Indicates whether the route is the 404 page.
   * @param {string | undefined} component - The name of component.
   * @returns {Object} - The newly added route.
   */
  addRoute(name, patterns, action, notFound = false, component = undefined) {
    const path = Array.isArray(patterns) ? patterns[0] : patterns;
    this._routeConfig.set(name, { path, action, notFound, component });
    return { name, path, action, notFound, component };
  }

  /**
   * Adds routes to the router.
   *
   * @param {ParsedRoute | undefined} routes
   */
  addRoutes(routes) {
    if (!routes) {
      throw new Error('Routes must be defined');
    }
    Object.entries(routes).forEach(([name, config]) => {
      this.addRoute(name, config.path, config.action, config.notFound, config.component);
    });
  }

  /**
   * Adds skip navigations to the router.
   *
   * @param {Navigation[]} skipNavs - The skip navigations to be added.
   */
  addSkipNavigations(skipNavs) {
    for (let i = 0; i < skipNavs.length; i++) {
      this.navigationStack.addSkipNavigation(skipNavs[i]);
    }
  }

  /**
   * Returns the hash path.
   *
   * @returns {string} The hash path.
   */
  _getHashPath() {
    if (this._history) {
      return this._history.location.pathname + this._history.location.search;
    }
    if (this.useHistory) {
      return location.pathname + location.search;
    }
    return location.hash.replace(/^#!?\/*/, '/').replace(/^$/, '/');
  }

  /**
   * Converts route config to remix-run router routes format.
   *
   * @returns {Array} Routes in remix-run router format.
   */
  _buildRemixRoutes() {
    const routes = [];
    this._routeConfig.forEach((config, name) => {
      routes.push({
        path: config.path,
        id: name,
        loader: async ({ params, request }) => {
          const url = new URL(request.url);
          const query = {};
          url.searchParams.forEach((value, key) => {
            query[key] = value;
          });
          return {
            name,
            params: params || {},
            query,
            subroute: undefined
          };
        }
      });
    });
    return routes;
  }

  /**
   * Builds an internal route snapshot from the remix router state.
   *
   * @param {Object} state - Remix router state.
   * @param {{path: string, component: string|undefined}} config - Route config.
   * @returns {Object} Route snapshot compatible with the existing API.
   */
  _createRouteSnapshot(state, config) {
    const location = state.location || {};
    const match = Array.isArray(state.matches) && state.matches.length > 0
      ? state.matches[state.matches.length - 1]
      : null;
    const routeId = match?.route?.id || this.currentRoute?.name || '';
    const routeConfig = this._routeConfig.get(routeId) || config || null;

    const params = {
      ...(match?.params || {}),
      ...Object.fromEntries(new URLSearchParams(location.search || ''))
    };

    const snapshot = {
      name: routeId,
      params,
      query: Object.fromEntries(new URLSearchParams(location.search || '')),
      subroute: undefined,
      component: routeConfig?.component,
      pending: state.navigation?.state !== 'idle',
      revalidating: state.revalidation === 'loading',
      historyAction: state.historyAction,
      loaderData: state.loaderData?.[routeId] || null,
      actionData: state.actionData?.[routeId] || null,
      error: state.errors?.[routeId] || null,
      location,
      matches: state.matches || [],
      handler: () => {
        if (routeConfig?.action) {
          routeConfig.action();
        }
      }
    };

    return snapshot;
  }

  /**
   * Applies the route snapshot to the current wrapper internals.
   *
   * @param {Object} snapshot - Internal route snapshot.
   * @returns {void}
   */
  _applyRouteSnapshot(snapshot) {
    this._routeSnapshot = snapshot;
    this._currentRoute = {
      name: snapshot.name,
      params: snapshot.params,
      query: snapshot.query,
      subroute: snapshot.subroute,
      component: snapshot.component,
      handler: () => {
        if (snapshot?.handler) {
          snapshot.handler();
        }
      }
    };
  }

  /**
   * Finds a route name by path.
   *
   * @param {string} path - The path to match.
   * @returns {string | null} The route name or null if not found.
   */
  _findRouteByPath(path) {
    for (const [name, config] of this._routeConfig) {
      if (config.path === path) {
        return name;
      }
    }
    // Try to match dynamic routes
    for (const [name, config] of this._routeConfig) {
      if (config.path.includes(':')) {
        const pattern = config.path.replace(/:[^/]+/g, '[^/]+');
        const regex = new RegExp(`^${pattern}$`);
        if (regex.test(path)) {
          return name;
        }
      }
    }
    return null;
  }

  /**
   * Extracts params from path based on route pattern.
   *
   * @param {string} pattern - The route pattern.
   * @param {string} path - The actual path.
   * @returns {QueryParams} The extracted params.
   */
  _extractParams(pattern, path) {
    const params = {};
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        const paramName = patternParts[i].substring(1);
        params[paramName] = pathParts[i];
      }
    }
    return params;
  }

  /**
   * Starts the router and initializes the remix-run router.
   *
   * @returns {void}
   */
  start() {
    if (this._remixRouter) {
      return;
    }

    // Create browser or hash history depending on useHistory.
    // Both sync with the browser URL and handle back/forward buttons natively.
    this._history = this.useHistory ? createBrowserHistory() : createHashHistory();

    // Build remix routes
    const remixRoutes = this._buildRemixRoutes();

    // Create remix router
    console.log('[router][start] Inicializando router con rutas:', remixRoutes.map((route) => route.id));

    this._remixRouter = createRouter({
      routes: remixRoutes,
      history: this._history,
      future: {
        v7_partialHydration: true
      }
    });

    this._remixRouter.enableScrollRestoration(
      this._scrollPositions,
      () => window.scrollY,
      (location) => `${location.pathname}${location.search}`
    );

    this._unsubscribeRemixRouter = this._remixRouter.subscribe((state) => {
      console.log('[router][state]', {
        phase: state.navigation?.state === 'loading' || state.navigation?.state === 'submitting'
          ? 'navegacion'
          : state.revalidation === 'loading'
            ? 'revalidacion'
            : 'inicio',
        navigationState: state.navigation?.state,
        initialized: state.initialized,
        pathname: state.location?.pathname,
        historyAction: state.historyAction,
        revalidation: state.revalidation
      });

      if (!state.initialized) {
        console.log('[router][state] Aún no está inicializado; esperando primer ciclo de carga.');
        return;
      }

      const location = state.location;
      const routeName = this._findRouteByPath(location.pathname);

      if (!routeName) {
        console.warn('[router][error] Ruta no encontrada para:', location.pathname);
        return;
      }

      console.log('[router][route] Ruta resuelta:', routeName, 'para', location.pathname);

      const config = this._routeConfig.get(routeName);
      const snapshot = this._createRouteSnapshot(state, config);
      console.log('[router][snapshot]', snapshot);
      const currentRouteName = this.currentRoute?.name;
      const currentRouteParams = this.currentRoute?.params;
      const routeFrom = this.navigationStack.createRoute(currentRouteName, currentRouteParams);
      const routeTo = this.navigationStack.createRoute(snapshot.name, snapshot.params);

      const interceptorResult = this.intercept(routeFrom, routeTo);

      if (snapshot.error) {
        console.warn('[router][error] Error de ruta detectado:', snapshot.error);
      }

      if (snapshot.pending) {
        console.log('[router][navegacion] transición pendiente para:', snapshot.name);
      }

      if (snapshot.revalidating) {
        console.log('[router][revalidacion] revalidando loaders para:', snapshot.name);
      }

      if (interceptorResult.intercept) {
        this.isNavigationInProgress = false;
        if (interceptorResult.redirect) {
          this.goReplacing(interceptorResult.redirect.page, interceptorResult.redirect.params);
        } else {
          this.go(currentRouteName, currentRouteParams, false);
          this.cancelledNavigation = currentRouteName;
        }
        if (this.channelManager) {
          setTimeout(() => {
            const interceptedNavigation = {
              from: {
                page: interceptorResult.from.page,
                params: interceptorResult.from.params,
              },
              to: { page: interceptorResult.to.page, params: interceptorResult.to.params },
            };
            this.channelManager?.publishInterceptedNavigation(interceptedNavigation);
          }, 0);
        }
        return;
      }

      const newRouteName = this.navigationStack.update(routeFrom, routeTo)?.page;
      if (newRouteName && newRouteName !== routeTo.page) {
        this.go(newRouteName, undefined, false);
        return;
      }

      this._applyRouteSnapshot(snapshot);
      if (snapshot.handler) {
        snapshot.handler();
      }
      this.handler(this.currentRoute);
    });

    console.log('[router][start] Inicializando instancia de Remix Router');
    this._remixRouter.initialize();

    const initialLocation = this._history.location;
    const initialRouteName = this._findRouteByPath(initialLocation.pathname);

    if (initialRouteName) {
      const config = this._routeConfig.get(initialRouteName);
      const snapshot = this._createRouteSnapshot(
        {
          location: initialLocation,
          navigation: { state: 'idle' },
          revalidation: 'idle',
          loaderData: {},
          actionData: null,
          errors: null,
          matches: [{ route: { id: initialRouteName }, params: this._extractParams(config.path, initialLocation.pathname) }],
          historyAction: 'POP'
        },
        config
      );

      this._applyRouteSnapshot(snapshot);
      console.log('[router][start] Ejecutando handler inicial para:', snapshot.name);
      if (snapshot.handler) {
        snapshot.handler();
      }
      this.handler(this.currentRoute);
    }
  }

  /**
   * Stops the router and cleans up any resources.
   */
  stop() {
    if (this._unsubscribeRemixRouter) {
      this._unsubscribeRemixRouter();
      this._unsubscribeRemixRouter = null;
    }

    if (this._remixRouter) {
      this._remixRouter.dispose();
      this._remixRouter = null;
      this._history = null;
    }
    this.isNavigationInProgress = false;
    this.hashIsDirty = false;
  }

  /**
   * Destroys the router by stopping it and clearing the routes.
   */
  destroy() {
    this.stop();
    this._routeConfig.clear();
  }

  /**
   * Interceptor function that is called during navigation.
   *
   * @param {NavigationWithParams} navigation - The navigation object.
   * @param {Object} context - The context object.
   * @returns {{ intercept: boolean }} - An object with an 'intercept' property.
   */
  interceptor(navigation, context) {
    return { intercept: false };
  }

  /**
   * Intercepts the navigation from one route to another.
   *
   * @param {RoutePage} routeFrom - The route object representing the current route.
   * @param {RoutePage} routeTo - The route object representing the target route.
   * @returns {Object} - The intercepted navigation object.
   */
  intercept(routeFrom, routeTo) {
    const navigation = {
      from: {
        page: routeFrom.page,
        params: routeFrom.params,
      },
      to: {
        page: routeTo.name || routeTo.page,
        path: routeTo.path || routeTo.page,
        params: routeTo.params,
      },
    };
    return { ...this.interceptor(navigation, this.interceptorContext), ...navigation };
  }

  /**
   * Updates the interceptor context with the provided values.
   *
   * @param {Object} ctx - The new values to be merged into the interceptor context.
   */
  updateInterceptorContext(ctx) {
    this.interceptorContext = Object.assign({}, this.interceptorContext, ctx);
  }

  /**
   * Sets the interceptor context.
   *
   * @param {Object} ctx - The context object.
   */
  setInterceptorContext(ctx) {
    this.interceptorContext = Object.assign({}, ctx);
  }

  /**
   * Returns the interceptor context.
   *
   * @returns {Object} The interceptor context.
   */
  getInterceptorContext() {
    return Object.assign({}, this.interceptorContext);
  }

  /**
   * Returns the resolved path for a given route name and parameters.
   *
   * @param {string} routeName - The name of the route.
   * @param {QueryParams | undefined} params - The parameters for the route.
   * @returns {string | undefined} The resolved path.
   */
  getPath(routeName, params) {
    const config = this._routeConfig.get(routeName);

    if (config) {
      let path = config.path;
      const queryParams = [];

      if (params) {
        // Replace path params
        Object.entries(params).forEach(([key, value]) => {
          if (path.includes(`:${key}`)) {
            path = path.replace(`:${key}`, String(value));
          } else {
            queryParams.push(`${key}=${encodeURIComponent(String(value))}`);
          }
        });
      }

      // Remove any remaining path params (optional params not provided)
      path = path.replace(/:[^/]+/g, '');

      // Clean up double slashes
      path = path.replace(/\/+/g, '/');

      if (queryParams.length > 0) {
        path += '?' + queryParams.join('&');
      }

      return path;
    } else {
      console.error(
        'Wrong route name: %s, valid route names: %s',
        routeName,
        Array.from(this._routeConfig.keys()).join(', ')
      );
      return undefined;
    }
  }

  /**
   * Creates a new navigation object.
   *
   * @param {string} name - The name of the route to navigate to.
   * @returns {Navigation} - The navigation object with 'from' and 'to' properties.
   */
  newNavigation(name) {
    return {
      from: this.currentRoute ? this.currentRoute.name : undefined,
      to: name,
    };
  }

  /**
   * Reverses the navigation object by swapping the 'from' and 'to' properties.
   *
   * @param {Navigation} nav - The navigation object.
   * @returns {Navigation} - The reversed navigation object.
   */
  reverseNavigation(nav) {
    return {
      from: nav.to,
      to: nav.from,
    };
  }

  /**
   * Navigates to a specified route.
   *
   * @param {string} name - The name of the route.
   * @param {QueryParams | undefined} params - The parameters for the route.
   * @param {boolean} [replace=false] - Whether to replace the current history entry.
   * @param {boolean} [skipHistory=false] - Whether to skip adding the navigation to the history.
   */
  go(name, params = undefined, replace = false, skipHistory = false) {
    if (this.isNavigationInProgress) {
      return;
    }

    if (skipHistory !== undefined) {
      const newNav = this.newNavigation(name);
      const reverseNav = this.reverseNavigation(newNav);
      reverseNav.skipHistory = skipHistory;
      this.navigationStack.addSkipNavigation(reverseNav);
    }

    const sanitizedName = name.replace(/^\/(\b)/, '');
    const path = this.getPath(sanitizedName, params);

    console.log('[router][navigation] go() llamado:', { name, params, replace, skipHistory });
    console.log('[router][navigation] path generado:', path, 'actual:', this._getHashPath());

    if (path && path !== this._getHashPath()) {
      this.isNavigationInProgress = true;
      console.log('[router][navigation] updatePathInBrowser:', { path, replace });
      this.updatePathInBrowser(path, replace);
    }
  }

  /**
   * Navigates back to the previous route in the navigation stack.
   *
   * @returns {NavigationWithParams} The navigation object containing the 'from' and 'to' routes.
   * @throws {Error} If there is no page to go back to.
   */
  back() {
    const navigation = {};
    if (this.navigationStack.length > 1) {
      let fromRoute = this.navigationStack.pop();
      let auxFromRoute = fromRoute;
      let backRoute = this.getLastRoute();

      while (
        this.navigationStack.isSkipNavigation({ from: auxFromRoute?.page, to: backRoute?.page }) &&
        this.navigationStack.length > 1
      ) {
        auxFromRoute = this.navigationStack.pop();
        if (this.navigationStack.length > 0) {
          backRoute = this.getLastRoute();
        }
      }

      const page = backRoute?.page;
      const params = backRoute?.params;

      navigation.from = fromRoute;
      navigation.to = backRoute;

      if (page) {
        this.go(page, params);
      } else {
        throw new Error('No page to go back to');
      }
    } else {
      navigation.from = this.getLastRoute();
      navigation.to = this.getLastRoute();
    }
    return navigation;
  }

  /**
   * Updates the path in the browser's address bar.
   *
   * @param {string} path - The new path to be set in the address bar.
   * @param {boolean} replace - Indicates whether to replace the current history state or push a new one.
   */
  updatePathInBrowser(path, replace) {
    if (this._remixRouter) {
      this._remixRouter.navigate(path, {
        replace,
        preventScrollReset: true
      }).then(() => {
        console.log('[router][navigation] transición completada');
      }).catch(err => {
        console.error('[router][error] error de navegación:', err);
        this.isNavigationInProgress = false;
      });
    } else {
      console.log('[router][error] no hay remix router disponible');
      this.isNavigationInProgress = false;
    }
  }

  /**
   * Updates the subroute in the browser.
   *
   * @param {string} subroute - The subroute to be added to the current route.
   */
  updateSubrouteInBrowser(subroute) {
    const currentRoute = this.currentRoute;
    let pathWithSubroute = this.getPath(currentRoute.name, currentRoute.params);
    if (pathWithSubroute) {
      if (subroute) {
        if (pathWithSubroute?.endsWith('/')) {
          pathWithSubroute = pathWithSubroute.substring(0, pathWithSubroute.length - 1);
        }
        pathWithSubroute = pathWithSubroute + subroute;
      }
      this.updatePathInBrowser(pathWithSubroute, true);
      this.hashIsDirty = true;
    }
  }

  /**
   * Replaces the current route with a new route using the specified name and parameters.
   *
   * @param {string} name - The name of the route to navigate to.
   * @param {QueryParams} [params] - The parameters to pass to the new route.
   */
  goReplacing(name, params = undefined) {
    this.go(name, params, true);
  }

  /**
   * Get last route from stack.
   *
   * @returns {RoutePage | undefined} Last route from stack.
   */
  getLastRoute() {
    return this.navigationStack.top();
  }

  /**
   * Initialize router stack.
   */
  init() {
    this._clearStack();
  }

  /**
   * Clear the router stack.
   */
  _clearStack() {
    this.navigationStack.clear();
  }

  /**
   * Clear the router stack until given page is found on router stack.
   *
   * @param {string} targetPage
   */
  clearStackUntil(targetPage) {
    this.navigationStack.clearUntil(targetPage);
  }

  /**
   * Indicates whether a navigation is currently in progress.
   *
   * @type {boolean}
   */
  get isNavigationInProgress() {
    return Router.isNavigationInProgress;
  }

  set isNavigationInProgress(value) {
    Router.isNavigationInProgress = value;
  }

  /**
   * Represents the status of a cancelled navigation.
   *
   * @type {string}
   */
  get cancelledNavigation() {
    return Router.cancelledNavigation;
  }

  set cancelledNavigation(value) {
    Router.cancelledNavigation = value;
  }

  /**
   * Indicates whether the hash is dirty or not.
   *
   * @type {boolean}
   */
  get hashIsDirty() {
    return Router.hashIsDirty;
  }

  set hashIsDirty(value) {
    Router.hashIsDirty = value;
  }
}
