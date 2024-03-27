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
