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

import { NavigationWithParams, Navigation, NavigationStack, RoutePage, QueryParams } from './navigation-stack';
import { ParsedRoute } from './bridge';

/**
 * Route configuration object.
 */
export interface RouteConfig {
  path: string;
  action: Function;
  notFound: boolean;
  component?: string;
}

/**
 * Current route information.
 */
export interface CurrentRoute {
  name: string;
  params: QueryParams;
  query: QueryParams;
  subroute?: string;
  handler?: () => void;
}

export interface Router {
  /**
   * Indicates whether the browser supports the History API.
   */
  SUPPORTS_HISTORY_API: boolean;

  /**
   * Indicates whether a navigation is currently in progress.
   */
  isNavigationInProgress: boolean;

  /**
   * Represents the status of a cancelled navigation.
   */
  cancelledNavigation: string;

  /**
   * Indicates whether the hash is dirty or not.
   */
  hashIsDirty: boolean;

  /**
   * Represents the navigation stack.
   */
  navigationStack: NavigationStack;

  /**
   * The context object for interceptors.
   */
  interceptorContext: Object;

  /**
   * Indicates whether to use browser history (pushState URLs without hash)
   * or hash history (#/). Defaults to false (hash history).
   */
  useHistory: boolean;

  /**
   * The routes configuration.
   */
  routes: { [key: string]: RouteConfig };

  /**
   * The current route.
   */
  currentRoute: CurrentRoute;

  /**
   * Handler function called when route changes.
   */
  handler(route: CurrentRoute): void;

  /**
   * Adds a route to the router.
   */
  addRoute(name: string, patterns: string | string[], action: Function, notFound: boolean, component: string | undefined): RouteConfig;

  /**
   * Adds routes to the router.
   */
  addRoutes(routes: ParsedRoute | undefined): void;

  /**
   * Adds skip navigations to the router.
   */
  addSkipNavigations(skipNavs: Navigation[]): void;

  /**
   * Starts the router.
   */
  start(): void;

  /**
   * Stops the router.
   */
  stop(): void;

  /**
   * Destroys the router.
   */
  destroy(): void;

  /**
   * Interceptor function.
   */
  interceptor(navigation: NavigationWithParams, context: Object): { intercept: boolean };

  /**
   * Intercepts the navigation.
   */
  intercept(routeFrom: RoutePage, routeTo: RoutePage): { from: RoutePage, to: RoutePage, redirect?: string, intercept: boolean };

  /**
   * Updates the interceptor context.
   */
  updateInterceptorContext(ctx: Object): void;

  /**
   * Sets the interceptor context.
   */
  setInterceptorContext(ctx: Object): void;

  /**
   * Returns the interceptor context.
   */
  getInterceptorContext(): Object;

  /**
   * Returns the resolved path for a given route name and parameters.
   */
  getPath(routeName: string, params: QueryParams | undefined): string | undefined;

  /**
   * Creates a new navigation object.
   */
  newNavigation(name: string): Navigation;

  /**
   * Reverses the navigation object.
   */
  reverseNavigation(nav: Navigation): Navigation;

  /**
   * Navigates to a specified route.
   */
  go(name: string, params: QueryParams | undefined, replace: boolean, skipHistory: boolean): void;

  /**
   * Navigates back to the previous route.
   */
  back(): NavigationWithParams;

  /**
   * Updates the path in the browser.
   */
  updatePathInBrowser(path: string, replace: boolean): void;

  /**
   * Updates the subroute in the browser.
   */
  updateSubrouteInBrowser(subroute: string): void;

  /**
   * Replaces the current route with a new route.
   */
  goReplacing(name: string, params: QueryParams | undefined): void;

  /**
   * Get last route from stack.
   */
  getLastRoute(): RoutePage | undefined;

  /**
   * Initialize router stack.
   */
  init(): void;

  /**
   * Clear the router stack until given page is found.
   */
  clearStackUntil(targetPage: string): void;
}
