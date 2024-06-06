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

import { ElementController } from '@open-cells/element-controller';

export class PageController extends ElementController {
  static get BRIDGE_PAGE_PRIVATE_CHANNEL_PREFIX() {
    return '__oc_page_';
  }

  static getPagePrivateChannel(tagName) {
    return `${PageController.BRIDGE_PAGE_PRIVATE_CHANNEL_PREFIX}${tagName.toLowerCase().replace('-page', '')}`;
  }

  // Declare properties
  static get properties() {
    return {
      params: { type: Object },
    };
  }

  // Initialize properties
  constructor(host) {
    super(host);
    this.params = {};
  }

  hostConnected() {
    super.hostConnected();
    this.__handleConnections();
  }

  __handleConnections() {
    if (this.__hasPageHandlers()) {
      this.__handlePagePrivateChannel();
    }
  }

  __hasPageHandlers() {
    return !!this.host.onPageEnter || !!this.host.onPageLeave;
  }

  __handlePagePrivateChannel() {
    const channelName = PageController.getPagePrivateChannel(this.host.tagName);
    const wrappedPrivateChannelCallback = this.__wrapPrivateChannelCallback();

    this.subscribe(channelName, wrappedPrivateChannelCallback);
  }

  __wrapPrivateChannelCallback() {
    return ({ value: pageStatusValue }) => {
      const callback = () => {
        if (pageStatusValue) {
          this.host.onPageEnter && this.host.onPageEnter();
        } else {
          this.host.onPageLeave && this.host.onPageLeave();
        }
      };

      if (callback) {
        callback();
      }
    };
  }
}
