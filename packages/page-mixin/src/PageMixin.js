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

import { plugCellsCore } from '@open-cells/core-plugin';
import { dedupeMixin } from '@open-wc/dedupe-mixin';

const PageMixinImpl = base => {
  return class extends base {
    static get properties() {
      return {
        params: { type: Object },
      };
    }

    constructor() {
      super();
      this.pluginCellsCoreAPI(this);
      this.params = {};
    }

    pluginCellsCoreAPI(elem) {
      plugCellsCore(elem);
    }

    static get BRIDGE_PAGE_PRIVATE_CHANNEL_PREFIX() {
      return '__oc_page_';
    }

    static getPagePrivateChannel(tagName) {
      return `${this.BRIDGE_PAGE_PRIVATE_CHANNEL_PREFIX}${tagName
        .toLowerCase()
        .replace('-page', '')}`;
    }

    connectedCallback() {
      super.connectedCallback();
      this.__handleConnections();
    }

    __handleConnections() {
      if (this.__hasPageHandlers()) {
        this.__handlePagePrivateChannel();
      }
    }

    __hasPageHandlers() {
      return !!this.onPageEnter || !!this.onPageLeave;
    }

    __handlePagePrivateChannel() {
      const channelName = this.constructor.getPagePrivateChannel(this.tagName);
      const wrappedPrivateChannelCallback = this.__wrapPrivateChannelCallback();

      this.subscribe(channelName, wrappedPrivateChannelCallback);
    }

    __wrapPrivateChannelCallback() {
      return ({ value: pageStatusValue }) => {
        const callback = () => {
          if (pageStatusValue) {
            this.onPageEnter && this.onPageEnter();
          } else {
            this.onPageLeave && this.onPageLeave();
          }
        };

        if (callback) {
          callback();
        }
      };
    }
  };
};

export const PageMixin = dedupeMixin(PageMixinImpl);
