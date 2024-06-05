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

import { NavigationWithParams } from './navigation-stack';
import { Navigation } from './navigation-stack';

export { Bridge } from '../src/bridge';

export type BridgeAPI = {
  logout: Function;
  subscribeToEvent: Function;
  registerInConnection: Function;
  unsubscribe: Function;
  registerOutConnection: Function;
  publish: Function;
  updateSubroute: Function;
  getCurrentRoute: Function;
  navigate: Function;
  updateApplicationConfig: Function;
  updateInterceptorContext: Function;
  resetInterceptorContext: Function;
  getInterceptorContext: Function;
  setInterceptorContext: Function;
};

export type EventSubscription = { event: string; callback: Function };

export type CellsConfig = {
  mainNode: string;
  postMessageTargetOrigin?: string;
  eventSubscriptions?: EventSubscription[];
  interceptor?: InterceptorFunction;
  skipNavigations?: Navigation[];
  routes?: RouteDefinition[];
  viewLimit?: number;
  persistentPages?: string[];
  initialTemplate?: string;
  appConfig?: Record<string, any>;
  commonPages?: string[];
};

export type RouteDefinition = {
  name: string;
  path: string;
  action: Function;
  notFound?: boolean;
  component: string;
};

export type ParsedRoute = {
  [name: string]: {
    path: string;
    action: Function;
    notFound: boolean;
    component: string;
  };
};

export type RouteMap = {
  [name: string]:
    | {
        path: string;
        action: Function;
      }
    | { path: string; action: Function }[];
};

export type InterceptorFunction = (
  navigation: NavigationWithParams,
  ctx: object,
) => { intercept: boolean; redirect: string };
