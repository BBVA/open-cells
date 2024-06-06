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

import { createChannel } from '../state/index.js';

/** @typedef {import('../../types').Channel} Channel */

/**
 * Represents a Channel Manager that manages channels.
 *
 * @class ChannelManager
 */
export class ChannelManager {
  /** Constructs a new ChannelManager. */
  constructor() {
    /**
     * The collection of channels.
     *
     * @type {Object<string, Channel>}
     */
    this.channels = {};
  }

  /**
   * Gets a channel by name.
   *
   * @param {string} name - The name of the channel.
   * @returns {Channel} The channel with the specified name.
   */
  get(name) {
    var channel = this.channels[name];

    if (!channel) {
      channel = this.create(name);
    }

    return channel;
  }

  /**
   * Gets a channel by name.
   *
   * @param {string} name - The name of the channel.
   * @returns {Channel} The channel with the specified name.
   */
  getUnsafe(name) {
    return this.channels[name];
  }

  /**
   * Creates a channel.
   *
   * @param {string} name - The name of the channel.
   * @returns {Channel} The newly created channel.
   */
  create(name) {
    const channel = createChannel(name);
    this.channels[name] = channel;
    return channel;
  }

  /**
   * Removes a channel from the collection.
   *
   * @param {string} name - The name of the channel to remove.
   */
  remove(name) {
    delete this.channels[name];
  }

  /**
   * Gets all channels.
   *
   * @returns {Object<string, Channel>} The channels.
   */
  getChannels() {
    return this.channels;
  }

  /**
   * Sets all channels.
   *
   * @param {Object<string, Channel>} channels - The channels.
   */
  setChannels(channels) {
    this.channels = channels;
  }

  /** Cleans all channels. */
  cleanAllChannels() {
    for (let channelName in this.channels) {
      if (this.channels.hasOwnProperty(channelName)) {
        this.channels[channelName].clean();
      }
    }
  }

  /** Removes all channels from the collection. */
  removeAllChannels() {
    for (let channelName in this.channels) {
      if (this.channels.hasOwnProperty(channelName)) {
        delete this.channels[channelName];
      }
    }
  }

  /**
   * Checks if a channel with the given name exists.
   *
   * @param {string} name - The name of the channel.
   * @returns {boolean} True if a channel with the given name exists, false otherwise.
   */
  has(name) {
    return this.channels[name] != null;
  }
}
