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

import { Subscription } from 'rxjs';
import { BRIDGE_CHANNEL_PREFIX } from '../constants';

/**
 * @typedef {import('../../types').WCNode} WCNode
 *
 * @typedef {import('../../types').WCSubscription} WCSubscription
 *
 * @typedef {import('../../types').NodeChannelRecord} NodeChannelRecord
 *
 * @typedef {import('../../types').Channel} Channel
 *
 * @typedef {import('../../types').WrappedEventForPublication} WrappedEventForPublication
 *
 * @typedef {import('../../types').WCSubscriptionDetail} WCSubscriptionDetail
 *
 * @typedef {import('../../types').AugmentedFunction} AugmentedFunction
 *
 * @typedef {import('../../types').Binding} Binding
 */

/** @class Subscriptor */
export class Subscriptor {
  /** @param {WCNode} node */
  constructor(node) {
    this.node = node;
    /** @type {WCSubscriptionDetail[]} */
    this.subscriptions = [];
    /** @type {WCSubscription} */
    this.publications = new Subscription();
    /** @type {NodeChannelRecord} */
    this.nodeChannelData = {};
  }

  /**
   * Indicates if the node has a subscription to a channel.
   *
   * @param {Channel} channel - Channel to check
   * @returns {boolean} True if the node has a subscription to the channel, false otherwise.
   */
  hasSubscription(channel) {
    return this.subscriptions.filter(d => d.channel === channel).length > 0;
  }

  /**
   * Publish an event.
   *
   * @param {WrappedEventForPublication} WrappedEvent
   */
  publish(WrappedEvent) {
    this.publications.add(WrappedEvent);
  }

  /**
   * Retrieves the time interval from the specified channel name.
   *
   * @param {string} channelName - The name of the channel.
   * @returns {number | null} The time interval of the channel.
   */
  getTimeFromNode(channelName) {
    return this.nodeChannelData[channelName].interval;
  }

  /**
   * Sets the time interval for a specific channel.
   *
   * @param {string} channelName - The name of the channel.
   * @param {number} time - The time interval to set.
   */
  setTimeForNode(channelName, time) {
    this.nodeChannelData[channelName].interval = time;
  }

  /**
   * Returns the time from the given channel.
   *
   * @param {Channel} channel - The channel object.
   * @returns {number} The time from the channel.
   */
  getTimeFromChannel(channel) {
    if (channel?.buffer?.length && channel.buffer.length > 0) {
      return channel.buffer[0].time;
    } else {
      return 1;
    }
  }

  /**
   * Obtiene el ID asociado a un nombre de canal.
   *
   * @param {string} channelName - El nombre del canal.
   * @returns {string | null} - El ID asociado al nombre del canal.
   */
  getIdFromNode(channelName) {
    return this.nodeChannelData[channelName].id;
  }

  /**
   * Sets the ID for a specific channel node.
   *
   * @param {string} channelName - The name of the channel.
   * @param {string} id - The ID to set for the channel node.
   */
  setIdForNode(channelName, id) {
    this.nodeChannelData[channelName].id = id;
  }

  /**
   * Retrieves the ID from the given channel.
   *
   * @param {Object} channel - The channel object.
   * @returns {string | null} The ID of the channel, or null if the channel is empty.
   */
  getIdFromChannel(channel) {
    // @ts-ignore
    if (channel.buffer?.length && channel.buffer?.length > 0) {
      // @ts-ignore
      return channel.buffer[0].uuid;
    } else {
      return null;
    }
    // return channel._buffer?.length > 0 ? channel._buffer[0].uuid : null;
  }

  /**
   * @param {Channel} channel
   * @param {AugmentedFunction} fn Callback function to run when a value from a channel changed
   * @returns {AugmentedFunction}
   */
  makeCallbackWithNoReplay(channel, fn) {
    if (!this.nodeChannelData[channel.name]) {
      this.nodeChannelData[channel.name] = { interval: null, id: null };
    }

    const self = this;
    /**
     * A function that only runs if the last interval from the channel is more recent than the
     * node's interval, or if the intervals are the same but the IDs are different or if the node
     * has no interval.
     *
     * @type {AugmentedFunction}
     */
    const fnReplayOff = function () {
      let lastInterval = self.getTimeFromChannel(channel);
      let nodeInterval = self.getTimeFromNode(channel.name);
      let lastId = self.getIdFromChannel(channel);
      let nodeId = self.getIdFromNode(channel.name);
      if (
        !nodeInterval ||
        nodeInterval < lastInterval ||
        (nodeInterval === lastInterval && nodeId != lastId)
      ) {
        self.setTimeForNode(channel.name, lastInterval);
        if (lastId) {
          self.setIdForNode(channel.name, lastId);
        }
        return fn.apply(/** @type {any} */ self, arguments);
      }
      self.setTimeForNode(channel.name, lastInterval);
    }.bind(self);

    return fnReplayOff;
  }

  /**
   * Subscribe to a channel.
   *
   * @param {Channel} channel - Channel to subscribe
   * @param {AugmentedFunction} fn - Callback function to run when a value from a channel changed
   * @param {boolean} previousState
   * @param {Binding} bind
   */
  subscribe(channel, fn, previousState, bind) {
    if (!this.hasSubscription(channel)) {
      let callback = fn;
      /** @type {WCSubscription} */
      let subscription;
      if (previousState === false) {
        callback = this.makeCallbackWithNoReplay(channel, fn);
      }

      let pos = this._firstInstanceOfObserver(this.node, channel);
      if (pos === -1) {
        /** @type {WCSubscription} */
        subscription = channel.subscribe(callback);
      } else {
        subscription = this.subscriptions[pos].subscription;
      }

      const subscriptionDetail = {
        channel,
        bind,
        node: this.node,
        subscription: subscription,
      };

      this.subscriptions.push(subscriptionDetail);
    }
  }

  /**
   * Remove all active subscriptions.
   *
   * @param {Boolean} cleanPrivateChannels
   */
  unsubscribe(cleanPrivateChannels) {
    this.subscriptions.forEach(({ channel, subscription }) => {
      if (
        cleanPrivateChannels === true ||
        !channel.name.match(new RegExp(`\\b${BRIDGE_CHANNEL_PREFIX}`))
      ) {
        //if (cleanPrivateChannels === true || !channel.name.match(/\b__bridge_/)) {
        subscription.unsubscribe();
      }
      //}
    });

    this.publications.unsubscribe();
  }

  /**
   * Returns the position of the first occurrence of the observer's node in the channel. If the node
   * has none observer registered to the channel, it returns -1.
   *
   * @param {WCNode} node
   * @param {Channel} channel
   * @returns {number}
   */
  _firstInstanceOfObserver(node, channel) {
    return this.subscriptions.findIndex(
      subscriptionDetail =>
        channel === subscriptionDetail.channel && node === subscriptionDetail.subscription.node,
    );
  }
}
