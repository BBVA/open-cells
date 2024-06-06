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

export type {
  Component,
  ComponentConnector,
  Connection,
  InConnection,
  OutConnection,
  CCSubscriptions,
  VNode,
  WCNode,
  IndexableHTMLElement,
} from './component-connector';
export type { WCEvent } from './manager/events';
export type { Channel, PublishableValue } from './state/channel';
export type { Route, RouteData } from './route';
export type { Router } from './router';
export type { Navigation, NavigationWithParams, RoutePage, QueryParams } from './navigation-stack';
export type {
  AugmentedFunction,
  Binding,
  CallBackFunction,
  NodeChannelRecord,
  WCSubscriptionDetail,
  WrappedEventForPublication,
  WCSubscription,
} from './state/subscriptor';
export type { PostMessageEvent } from './manager/post-message';
export type { Dictionary } from './manager/storage';
export type {
  TemplateConfig,
  TemplateManager,
  TemplateManagerConfig,
  TemplateNode,
  TemplateSpec,
} from './manager/template';
export type {
  Bridge,
  BridgeAPI,
  CellsConfig,
  EventSubscription,
  InterceptorFunction,
  ParsedRoute,
  RouteDefinition,
  RouteMap,
} from './bridge';
export { EventEmitter } from './event-emitter';

