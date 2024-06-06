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
export class ElementController {
  constructor(host) {
    this.subscriptions = [];
    plugCellsCore(this);
    this.subscribe = this.subscribe.bind(host);
    this.unsubscribe = this.unsubscribe.bind(host);
    this.publish = this.publish.bind(host);
    (this.host = host).addController(this);
    this._definedBoundedProperties();
  }

  _definedBoundedProperties() {
    const inbounds = this.host.constructor.inbounds;
    const outbounds = this.host.constructor.outbounds;

    if (!inbounds && !outbounds) {
      return;
    }

    const inout = this._mergeBounds(inbounds, outbounds);

    Object.keys(inout).forEach(key => {
      let { output, input, skipUpdate, action } = inout[key];
      this._inOut(key, output, input, (skipUpdate = false), action);
    });
  }

  _mergeBounds(inbounds = {}, outbounds = {}) {
    const inout = [];
    Object.keys(inbounds).forEach(key => {
      const { channel: input, skipUpdate, action } = inbounds[key];
      inout[key] = { input, skipUpdate, action };
    });
    Object.keys(outbounds).forEach(key => {
      const { channel: output } = outbounds[key];
      let previous = inout[key] || {};
      inout[key] = { ...previous, output };
    });
    return inout;
  }

  _inOut(propertyName, outChannelName, inChannelName, skipUpdate = false, action) {
    let internalValue;
    let setter = value => {
      internalValue = value;
      this.publish(outChannelName, value);
    };
    let getter = () => {
      return internalValue;
    };

    let internalSubscriberAction;
    if (action && typeof action === 'function') {
      internalSubscriberAction = value => {
        internalValue = action(value);
        if (!skipUpdate) {
          this.host.requestUpdate();
        }
      };
    } else {
      internalSubscriberAction = value => {
        internalValue = value;
        if (!skipUpdate) {
          this.host.requestUpdate();
        }
      };
    }

    this.subscriptions.push({ channel: inChannelName, action: internalSubscriberAction });
    if (outChannelName) {
      Object.defineProperties(this.host, {
        [propertyName]: {
          get: getter,
          set: setter,
        },
      });
    } else {
      Object.defineProperties(this.host, {
        [propertyName]: {
          get: getter,
        },
      });
    }
  }

  hostConnected() {
    for (const subscription of this.subscriptions) {
      this.subscribe(subscription.channel, subscription.action);
    }
  }

  hostDisconnected() {
    for (const subscription of this.subscriptions) {
      this.unsubscribe(subscription.channel);
    }
  }
}
