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

const externalEventsCodes = {
  PARSE_ROUTE: 'parse-route',
  AFTER_PUBLISH: 'after-publish',
  NAV_REQUEST: 'nav-request',
  TEMPLATE_TRANSITION_END: 'template-transition-end',
  TRACK_EVENT: 'track-event',
  TEMPLATE_REGISTERED: 'template-registered',
  ROUTER_BACKSTEP: 'router-backstep',
  LOG_EVENT: 'log-event',
};

const externalEvents = Object.values(externalEventsCodes);

// initialTemplate

const initialTemplate = 'login';

// pagesPath

const pagesPath = './pages/';

// render engines

const renderEngines = {
  LIT_ELEMENT: 'litElement',
};

export const BRIDGE_CHANNEL_PREFIX = '__oc';

export const Constants = {
  bridgeChannelPrefix: BRIDGE_CHANNEL_PREFIX,
  externalEvents,
  externalEventsCodes,
  initialTemplate,
  pagesPath,
  renderEngines,
};
