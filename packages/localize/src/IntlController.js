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

import { eventTypes } from './event-types.js';

/** @internal */
export class IntlController {
  constructor(host, { configProperty = null, intlConfig = {} } = {}) {
    this.host = host;
    this.configProperty = configProperty;
    this.intlConfig = intlConfig;

    this.__onLocalizeStatusChange = this.__onLocalizeStatusChange.bind(this);
  }

  __onLocalizeStatusChange() {
    if (this.configProperty) {
      this.host[this.configProperty] = this.intlConfig;
      this.host.requestUpdate(this.configProperty);
    } else {
      this.host.requestUpdate();
    }
  }

  hostConnected() {
    window.addEventListener(eventTypes.STATUS_CHANGE, this.__onLocalizeStatusChange);
  }

  hostDisconnected() {
    window.removeEventListener(eventTypes.STATUS_CHANGE, this.__onLocalizeStatusChange);
  }
}
