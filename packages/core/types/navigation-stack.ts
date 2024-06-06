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

export type Navigation = {
  from?: string;
  to?: string;
  skipHistory?: boolean;
};

export type QueryParams = { [key: string]: string | number };

export type RoutePage = {
  page: string;
  params: QueryParams;
};

export type NavigationWithParams = {
  from?: RoutePage;
  to?: RoutePage;
};


export interface NavigationStack {

  readonly length: number;

  addSkipNavigation(nav: Navigation): void;

  isSkipNavigation(nav: Navigation): boolean;

  lastNavigation(): Navigation;

  createRoute(page: string, params?: QueryParams): RoutePage;

  createNavigation(routeFrom?: RoutePage, routeTo?: RoutePage): Navigation;

  push(route: RoutePage): void;

  replace(route: RoutePage): void;

  pop(): RoutePage | undefined;

  top(): RoutePage | undefined;

  isBackwardNavigation(newNav: Navigation): boolean;

  update(routeFrom?: RoutePage, routeTo?: RoutePage): RoutePage | undefined;

  clear(): void;

  replaceRoute(route: RoutePage): void;

  clearUntil(targetPage: string): void
}

