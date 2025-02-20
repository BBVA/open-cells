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

/**
 * @typedef {import('../../types').Bridge} Bridge
 *
 * @typedef {import('./bridge-channels').BridgeChannelManager} BridgeChannelManager
 *
 * @typedef {import('../component-connector').ComponentConnector} ComponentConnector
 *
 * @typedef {import('../../types').PostMessageEvent} PostMessageEvent
 *
 * @typedef {import('../../types').WrappedEventForPublication} WrappedEventForPublication
 */

/** @class PostMessageManager */
/** Manages postMessage communication between windows. */
export class PostMessageManager {
  /** @param {Bridge} bridge - The bridge instance. */
  constructor(bridge) {
    /**
     * Indicates whether postMessage is enabled.
     *
     * @type {boolean}
     */
    this.enabled = false;

    /**
     * The target origin for postMessage.
     *
     * @type {string}
     */
    this.postMessageTargetOrigin = '';

    if (!bridge.postMessageTargetOrigin) {
      this.enabled = false;
    } else {
      if (bridge.postMessageTargetOrigin === '*') {
        this.enabled = false;
        console.warn(
          "For security reasons postMessageTargetOrigin can't be the wildcard '*'. See docs for more info. ",
        );
      } else {
        this.enabled = true;
        this.postMessageTargetOrigin = bridge.postMessageTargetOrigin;
      }
    }

    /**
     * The component connector instance.
     *
     * @type {ComponentConnector}
     */
    this.componentConnector = bridge.ComponentConnector;

    /**
     * The bridge channel manager instance.
     *
     * @type {BridgeChannelManager}
     */
    this.bridgeChannelManager = bridge.BridgeChannelManager;

    this.channelPrefix = bridge.channelPrefix;
  }

  /**
   * Handles the postMessage events sent to this window from its parent. It transforms them into
   * channels [BRIDGE_CHANNEL_PREFIX]_post_message_{your-event-name} including the payload, to do so
   * the postMessage must be: { "event" : "your-event-name", "detail" : <any> } Creates and listens
   * to the private channel [BRIDGE_CHANNEL_PREFIX]_ch_send_post_message to send postMessages to
   * parent window.
   */
  setupPostMessages() {
    if (this.enabled) {
      window.addEventListener('message', ({ data }) => {
        if (data.event) {
          const channel = this.bridgeChannelManager.getPostMessageChannel(data.event);
          const evt = this.componentConnector.createEvent(data.event, data.detail);
          channel.next(evt);
        }
      });
      // @ts-ignore
      this._sendPostMessage({ event: `${this.channelPrefix}-ready` });
      this.bridgeChannelManager
        .getBridgeChannel('send_post_message')
        // @ts-ignore
        .subscribe(evt => this._sendPostMessage(evt.detail));
    }
  }

  /**
   * Sends a postMessage to the parent window.
   *
   * @private
   * @param {PostMessageEvent} evt - The event to be sent.
   */
  _sendPostMessage(evt) {
    window.parent &&
      window.parent.postMessage(
        { eventName: evt.event, eventDetail: evt.detail },
        this.postMessageTargetOrigin,
      );
  }
}
