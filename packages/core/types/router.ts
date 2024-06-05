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
import { Route } from './route';
import { ParsedRoute } from './bridge';
import { Subscription } from "rxjs";


export interface Router {
    
    SUPPORTS_HISTORY_API : boolean;
    
    PARAM : RegExp;
    
    LTRIM_SLASH : RegExp;

    EMPTY : RegExp;

    HASH_PREFIX : RegExp;

    PATH_PREFIX : RegExp;

    isNavigationInProgress : boolean;

    cancelledNavigation : string;

    hashIsDirty : boolean;

    navigationStack : NavigationStack;

    interceptorContext : Object;

    useHistory : boolean;

    matchRoute(fullPath : string) : Route | undefined;

    getRouteWithPattern(patternToMatch : string) : Route | null;

    interceptor(navigation : NavigationWithParams, context : Object) : { intercept : boolean };

    intercept(routeFrom : RoutePage, routeTo : Route) : { from : RoutePage, to : RoutePage, redirect : string, intercept : boolean };

    updateInterceptorContext(ctx : Object) : void;

    setInterceptorContext(ctx : Object) : void;

    getInterceptorContext() : Object;

    start() : Subscription;

    stop() : void;

    destroy() : void;
    
    routes : { [key: string]: Route };

    currentRoute : Route;

    handler(route : Route) : void;

    addRoute(name : string, patterns : string | string[], action : Function, notFound : boolean, component : string | undefined) : Route;

    addRoutes(routes : ParsedRoute | undefined) : void;

    addSkipNavigations(skipNavs : Navigation[]) : void;

    matchRoute(fullPath : string) : Route | undefined;

    getRouteWithPattern(patternToMatch : string) : Route | null;

    newNavigation(name : string) : Navigation;

    reverseNavigation(nav : Navigation) : Navigation;

    getPath(routeName : string, params : QueryParams | undefined) : string | undefined;

    go(name : string, params : QueryParams | undefined, replace : boolean, skipHistory : boolean) : void;

    back() : NavigationWithParams;

    updatePathInBrowser(path : string, replace : boolean) : void;

    updateSubrouteInBrowser(subroute : string) : void;

    goReplacing(name : string, params : QueryParams | undefined) : void;

    historyReplaceState(path : string) : void;

    historyPushState(path : string) : void;

    locationReplace(path : string) : void;

    locationHash(path : string) : void;

    getLastRoute() : RoutePage | undefined;

    init() : void;

    clearStackUntil(targetPage : string) : void;
    }
    