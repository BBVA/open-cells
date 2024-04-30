import { Route } from './route';
import { Subscription, fromEvent, merge } from 'rxjs';
import { distinctUntilChanged, map, startWith, filter } from 'rxjs/operators';
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
 *
 * @typedef {import('rxjs').TeardownLogic} TeardownLogic;
 *
 * @typedef {import('rxjs').Observable<String>} ObservableString;
 */

/**
 * @constant
 * @type {Subscription}
 */
const EMPTY = Subscription.EMPTY;
/**
 * @constant
 * @type {Constants}
 */
const { externalEventsCodes } = Constants;

/** @type {Router | null} */
let instance = null;
/** @type {boolean} */
let _useHistory = false;
/** @type {{} | { [key: string]: Route }} */
let _routes = {};
/** @type {Subscription | null} */
let _disposables;
/** @type {Route} */
let _currentRoute;
/** @type {Route | null} */
let _404Route;

/**
 * @class SerialSubscription Mimics behavior of SerialDisposable in RxJS v4, allows to add only
 *   single subscription. If new subscription's added, existing subscription will be unsubscribed.
 *
 *   By design of RxJS v5 it is no longer recommended to manage subscription imperatively vis various
 *   kind of subscription, reason it only have single kind of composite subscription. This
 *   implementation is for interop between existing codebase.
 * @extends {Subscription}
 */
class SerialSubscription extends Subscription {
  constructor() {
    super();
    this._currentSubscription = EMPTY;
  }

  /**
   * Adds a tear down to be called during the unsubscribe() of this Subscription.
   *
   * If there's existing subscription, it'll be unsubscribed and removed.
   *
   * @param {() => void} teardown The additional logic to execute on teardown.
   */
  add(teardown) {
    if (this.closed) return;
    // let newSubscription;
    // if (typeof teardown === 'function') {
    //   newSubscription = new Subscription(teardown);
    // } else {
    //   newSubscription = new Subscription();
    // }
    const newSubscription = new Subscription(teardown);

    if (this._currentSubscription) {
      this.remove(this._currentSubscription);
      this._currentSubscription.unsubscribe();
      this._currentSubscription = EMPTY;
    }

    this._currentSubscription = newSubscription;
    super.add(teardown);
  }

  // add(teardown) {
  //   if (this.closed) return;
  //   if (typeof teardown === 'function') teardown = new Subscription(teardown);

  //   if (this._currentSubscription) {
  //     this.remove(this._currentSubscription);
  //     this._currentSubscription.unsubscribe();
  //     this._currentSubscription = null;
  //   }

  //   super.add((this._currentSubscription = teardown));
  // }
}

/**
 * Represents a router that handles navigation and routing in the application. The Router class
 * provides methods for adding routes, matching routes, and handling navigation events. It also
 * supports history API and hash-based navigation.
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
   * Regular expression pattern used to match and capture route parameters.
   *
   * @type {RegExp}
   */
  static PARAM = /(?::([^/]+))/g;
  /**
   * Regular expression pattern used to match and remove leading slashes from a string.
   *
   * @type {RegExp}
   */
  static LTRIM_SLASH = /^\/(\b)/;

  /**
   * Regular expression pattern representing an empty string.
   *
   * @type {RegExp}
   */
  static EMPTY = /^$/;

  /**
   * Regular expression pattern used to match and remove hash prefixes.
   *
   * @type {RegExp}
   */
  static HASH_PREFIX = /^#!?\/*/;
  /**
   * Regular expression pattern used to match and remove leading slashes from a path.
   *
   * @type {RegExp}
   */
  static PATH_PREFIX = /^\/*/;
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
   * The channel manager handles the communication channels in the router. It is responsible for
   * managing the creation, deletion, and routing of channels.
   *
   * @type {BridgeChannelManager | null}
   */
  _channelManager = null;
  /**
   * The context object for interceptors.
   *
   * @type {Object}
   */
  interceptorContext = {};

  /**
   * Represents the constructor of the Router class.
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
    /* istanbul ignore else */
    if (Router.SUPPORTS_HISTORY_API) {
      _useHistory = value;
    }
  }

  /**
   * Getter for the useHistory property.
   *
   * @returns {boolean} The useHistory object.
   */
  get useHistory() {
    return _useHistory;
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
   * @param {{ [key: string]: Route }} routes - The routes to be set.
   */
  set routes(routes) {
    _routes = routes;
  }

  /**
   * Get the routes.
   *
   * @returns {{ [key: string]: Route }} The routes.
   */
  get routes() {
    return _routes;
  }

  /**
   * Gets the current route.
   *
   * @returns {Route} The current route.
   */
  get currentRoute() {
    return _currentRoute;
  }

  /**
   * Sets the current route.
   *
   * @param {Route} route - The current route.
   */
  set currentRoute(route) {
    _currentRoute = route;
  }

  /** @param {Route} route */
  // eslint-disable-next-line no-unused-vars
  handler(route) {
    // Overwrite to make something after all matched routes
  }

  /**
   * Adds a route to the router.
   *
   * @param {string} name - The name of the route.
   * @param {string | string[]} patterns - The patterns associated with the route.
   * @param {Function} action - The action to be executed when the route is matched.
   * @param {boolean} notFound - Indicates whether the route is the 404 page. Default is `false`.
   * @param {string | undefined} component - The name of component.
   * @returns {Route} - The newly added route.
   */
  addRoute(name, patterns, action, notFound, component) {
    this.routes[name] = new Route(name, patterns, action, notFound, component);
    return this.routes[name];
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
    for (let routeName in routes) {
      if (routes.hasOwnProperty(routeName)) {
        const { path, action, notFound, component } = routes[routeName];
        this.addRoute(routeName, path, action, notFound, component);
      }
    }
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
   * Returns the hash path by replacing the hash prefix and empty values.
   *
   * @returns {string} The hash path.
   */
  _getHashPath() {
    return location.hash.replace(Router.HASH_PREFIX, '/').replace(Router.EMPTY, '/');
  }

  /**
   * Observes the hash change event and returns an observable that emits the hash path.
   *
   * @returns {ObservableString} An observable that emits the hash path.
   */
  _observeHashChange() {
    return fromEvent(window, 'hashchange').pipe(
      map(this._getHashPath),
      startWith(this._getHashPath()),
    );
  }

  /**
   * Returns the URL path by replacing the Router.PATH_PREFIX with a forward slash.
   *
   * @returns {string} The URL path.
   */
  _getURLPath() {
    return location.pathname.replace(Router.PATH_PREFIX, '/');
  }

  /**
   * Observes changes in the browser's state (popstate and pushstate events) and returns an
   * Observable that emits the URL path whenever a state change occurs.
   *
   * @returns {ObservableString} An Observable that emits the URL path on state changes.
   */
  _observeStateChange() {
    return merge(fromEvent(window, 'popstate'), fromEvent(window, 'pushstate')).pipe(
      map(this._getURLPath),
      startWith(this._getURLPath()),
    );
  }

  /**
   * Matches the given full path against the defined routes and returns the matching route.
   *
   * @param {string} fullPath - The full path to match against the routes.
   * @returns {Route | undefined} - The matching route object, or undefined if no match is found.
   */
  matchRoute(fullPath) {
    const [path, query] = fullPath.split('?');
    const queryObject = this._parseQuery(query);
    for (let routeName in this.routes) {
      if (this.routes.hasOwnProperty(routeName)) {
        const route = this.routes[routeName];
        if ((!route.is404() || route.isAccessible) && route.matchPath(path)) {
          if (route.isWildcarded) {
            route.parsePath(fullPath);
          } else {
            route.parsePath(path);
            route.parseQuery(queryObject);
          }
          return route;
        }
      }
    }
    return undefined;
  }

  /**
   * Parses a query string and returns an object containing key-value pairs.
   *
   * @param {string} queryStr - The query string to be parsed.
   * @returns {QueryParams} - An object containing the parsed key-value pairs.
   */
  _parseQuery(queryStr) {
    /** @type {{ [key: string]: string }} */
    const params = {};
    if (queryStr) {
      // Split into key/value pairs
      const queries = queryStr.split('&');
      if (queries) {
        // Convert the array of strings into an object
        let key,
          value,
          i,
          len = queries.length;
        for (i = 0; i < len; i++) {
          [key, value] = queries[i].split('=');
          params[key] = decodeURIComponent(value);
        }
      }
    }
    return params;
  }

  /**
   * Sets up the 404 route.
   *
   * @returns {Route | null} The 404 route object.
   */
  _setup404() {
    const route404 = Object.values(this.routes).find(route => route.is404()) || null;

    // We check if 404 route have a pattern...
    if (route404 && route404.patterns.length === 1) {
      const routeWithSamePattern = this.getRouteWithPattern(route404.patterns[0]);

      route404.redirectPage = route404.name;
      route404.isAccessible = true;
    }

    return route404;
  }

  /**
   * Returns the route that matches the given pattern.
   *
   * @param {string} patternToMatch - The pattern to match against the routes.
   * @returns {Route | null} - The matching route, or null if no match is found.
   */
  getRouteWithPattern(patternToMatch) {
    for (let routeName in this.routes) {
      if (this.routes.hasOwnProperty(routeName)) {
        let route = this.routes[routeName];

        // we only take care about routes with same patterns that aren't the same
        if (!route.is404() && route.patterns.includes(patternToMatch)) {
          return route;
        }
      }
    }

    return null;
  }

  /**
   * Interceptor function that is called during navigation.
   *
   * @param {NavigationWithParams} navigation - The navigation object.
   * @param {Object} context - The context object.
   * @returns {{ intercept: boolean }} - An object with an 'intercept' property indicating whether
   *   the navigation should be intercepted.
   */
  interceptor(navigation, context) {
    return { intercept: false };
  }

  /**
   * Intercepts the navigation from one route to another.
   *
   * @param {RoutePage} routeFrom - The route object representing the current route.
   * @param {Route} routeTo - The route object representing the target route.
   * @returns {{
   *   from: RoutePage;
   *   to: RoutePage;
   *   [redirect: string];
   *   intercept: boolean;
   * }}
   *   - The intercepted navigation object.
   */
  intercept(routeFrom, routeTo) {
    const navigation = {
      from: {
        page: routeFrom.page,
        params: routeFrom.params,
      },
      to: {
        page: routeTo.name,
        path: routeTo.patterns[0],
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
   * Starts the router and initializes the necessary subscriptions and event listeners.
   *
   * @returns {Subscription} The subscription object that can be used to unsubscribe from the
   *   router.
   */
  start() {
    /* istanbul ignore else */
    if (!_disposables) {
      const active = new SerialSubscription();

      _404Route = this._setup404();

      const source = this.useHistory ? this._observeStateChange() : this._observeHashChange();

      const subscription = source.pipe(
        distinctUntilChanged(),
        map(this.matchRoute.bind(this)),
        filter(r => {
          if (r && r.name === this.cancelledNavigation) {
            this.cancelledNavigation = undefined;
            this.isNavigationInProgress = false;
            if (this.currentRoute.name !== this.navigationStack.top()?.page) {
              this.navigationStack.push({
                page: this.currentRoute.name,
                params: this.currentRoute.params,
              });
            }
            return false;
          } else return true;
        }),
      );

      subscription.forEach(route => {
        if (!this.hashIsDirty) {
          if (route) {
            // const currentRouteName = this.currentRoute ? this.currentRoute.name : undefined;
            // const currentRouteParams = this.currentRoute ? this.currentRoute.params : undefined;
            const currentRouteName = this.currentRoute?.name;
            const currentRouteParams = this.currentRoute?.params;
            const routeFrom = this.navigationStack.createRoute(
              currentRouteName,
              currentRouteParams,
            );
            const routeTo = this.navigationStack.createRoute(route.name, route.params);
            const interceptorResult = this.intercept(routeFrom, route);
            if (interceptorResult.intercept) {
              this.isNavigationInProgress = false;
              if (interceptorResult.redirect) {
                this.goReplacing(
                  interceptorResult.redirect.page,
                  interceptorResult.redirect.params,
                );
              } else {
                this.go(currentRouteName, currentRouteParams, false);
                this.cancelledNavigation = currentRouteName;
              }
              if (this.channelManager) {
                setTimeout(() => {
                  const interceptedNavigation = {
                    from: interceptorResult.from.page,
                    to: interceptorResult.to.page,
                  };
                  this.channelManager?.publishInterceptedNavigation(interceptedNavigation);
                }, 0);
              }
              return;
            } else {
              // NavigationStack computes the effective new current based on the skip navigation list
              // so it can be that the newRoute is different to the route from window.location
              const newRouteName = this.navigationStack.update(routeFrom, routeTo)?.page;
              if (newRouteName && newRouteName !== routeTo.page) {
                this.go(newRouteName, undefined, false);
                return;
              }
            }
            _currentRoute = route;
            const disposable = new Subscription(() => this.currentRoute);
            /** @type {() => void} */
            const dispose = () => disposable.unsubscribe();
            active.add(dispose);
            this.currentRoute.handler();
            this.handler(this.currentRoute);
          } else if (_404Route?.redirectPage) {
            this.goReplacing(_404Route.redirectPage);
          }
        } else {
          this.hashIsDirty = false;
        }
      });

      // _disposables = new Subscription(subscription, active);
      _disposables = active;
    }

    return _disposables;
  }

  /** Stops the router and cleans up any resources. */
  stop() {
    if (_disposables) {
      _disposables.unsubscribe();
      _disposables = null;
    }
    this.isNavigationInProgress = false;
    this.hashIsDirty = false;
  }

  /** Destroys the router by stopping it and clearing the routes. */
  destroy() {
    this.stop();
    this.routes = {};
  }

  /**
   * Returns the resolved path for a given route name and parameters.
   *
   * @param {string} routeName - The name of the route.
   * @param {QueryParams | undefined} params - The parameters for the route.
   * @returns {string | undefined} The resolved path.
   */
  getPath(routeName, params) {
    const route = this.routes[routeName];

    if (route) {
      let resolvedPath;
      const routeWithParams = route.path(params);
      const idxQueryParams = routeWithParams.indexOf('?');
      if (idxQueryParams > -1) {
        const path = routeWithParams.substring(0, idxQueryParams);
        const queryParams = routeWithParams.substring(idxQueryParams);
        resolvedPath = path.replace(/\*/g, '') + queryParams;
      } else {
        resolvedPath = routeWithParams.replace(/\*/g, '');
      }
      return resolvedPath;
    } else {
      console.error(
        'Wrong route name: %s, valid route names: %s',
        routeName,
        Object.keys(this.routes).join(', '),
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
   * @param {boolean} [replace=false] - Whether to replace the current history entry. Default is
   *   `false`
   * @param {boolean} [skipHistory=false] - Whether to skip adding the navigation to the history.
   *   Default is `false`
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

    const sanitizedName = name.replace(Router.LTRIM_SLASH, '');
    const path = this.getPath(sanitizedName, params);
    if (path && path !== this._getHashPath()) {
      this.isNavigationInProgress = true;
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
   * @param {boolean} replace - Indicates whether to replace the current history state or push a new
   *   one.
   */
  updatePathInBrowser(path, replace) {
    if (this.useHistory) {
      if (replace) {
        this.historyReplaceState(path);
      } else {
        this.historyPushState(path);
      }
    } else {
      if (replace) {
        this.locationReplace(path);
      } else {
        this.locationHash(path);
      }
    }
  }

  /**
   * Updates the subroute in the browser.
   *
   * @param {string} subroute - The subroute to be added to the current route. It must start with a
   *   slash (/)
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
   * Reemplaza el estado actual del historial del navegador con una nueva URL.
   *
   * @param {string} path - La nueva URL a reemplazar en el historial del navegador.
   */
  historyReplaceState(path) {
    history.replaceState(null, '', path);
  }

  /**
   * Pushes a new state to the browser history.
   *
   * @param {string} path - The path to push to the history.
   */
  historyPushState(path) {
    history.pushState(null, '', path);
  }

  /**
   * Replaces the current location with the specified path.
   *
   * @param {string} path - The path to replace the current location with.
   */
  locationReplace(path) {
    location.replace('#!' + path);
  }

  /**
   * Sets the location hash with the specified path.
   *
   * @param {string} path - The path to set as the location hash.
   */
  locationHash(path) {
    location.hash = '#!' + path;
  }

  /**
   * Get last route from stack.
   *
   * @returns {RoutePage | undefined} Last route from stack.
   */
  getLastRoute() {
    return this.navigationStack.top();
  }

  /** Initialize router stack. */
  init() {
    this._clearStack();
  }

  /** Clear the router stack. */
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
}
