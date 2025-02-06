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

import { fromEvent } from 'rxjs';
import { eventManager } from './manager/events.js';
import { Subscriptor } from './state/index.js';
import { Constants } from './constants.js';
import { ElementAdapter } from './adapter/element-adapter.js';
import { ChannelManager } from './manager/channel-manager.js';
// import { BRIDGE_CHANNEL_PREFIX } from './constants.js';

/**
 * @typedef {import('rxjs').Subscription} Subscription;
 *
 * @typedef {import('../types').WCEvent} WCEvent
 *
 * @typedef {import('../types').IndexableHTMLElement} IndexableHTMLElement
 *
 * @typedef {import('rxjs').Observable<WCEvent>} ObservableWCEvent;
 *
 * @typedef {import('../types').AugmentedFunction} AugmentedFunction
 *
 * @typedef {import('../types').Binding} Binding
 *
 * @typedef {import('../types').Channel} Channel
 *
 * @typedef {import('../types').WCNode} WCNode
 *
 * @typedef {import('../types').Connection} Connection
 *
 * @typedef {import('../types').WCSubscription} WCSubscription
 *
 * @typedef {import('../types').WCSubscriptionDetail} WCSubscriptionDetail
 */

/** @constant externalEventsCodes */
const { externalEventsCodes } = Constants;

/**
 * Represents a Component Connector that manages subscriptions and publications between components.
 *
 * @class ComponentConnector
 */
export class ComponentConnector {
  /**
   * Creates a new instance of ComponentConnector.
   *
   * @param {string} channelPrefix The prefix for the bridge channels
   */
  constructor(channelPrefix) {
    /**
     * The adapter for element.
     *
     * @type {ElementAdapter}
     */
    this.adapter = new ElementAdapter(this);

    /**
     * The channel manager used to manage channels.
     *
     * @type {ChannelManager}
     */
    this.manager = new ChannelManager();

    /**
     * The map of subscriptors.
     *
     * @type {Map<WCNode, Subscriptor>}
     */
    this.subscriptors = new Map();

    this.channelPrefix = channelPrefix;
    /**
     * The regular expression pattern to match bridge channels prefix.
     *
     * @type {RegExp}
     */
    this.bridgeChannelPrefixRegex = new RegExp(`${this.channelPrefix}_(?!ch)`);
  }

  /**
   * Get a subscriptor for the given node. If the subscriptor does not exist, a new one will be
   * created.
   *
   * @param {WCNode} node - The node to get the subscriptor for.
   * @returns {Subscriptor} The subscriptor for the given node.
   */
  getSubscriptor(node) {
    let subscriptor = this.subscriptors.get(node);

    if (!subscriptor) {
      subscriptor = new Subscriptor(node, this.channelPrefix);
      this.subscriptors.set(node, subscriptor);
    }

    return subscriptor;
  }

  /**
   * Add a subscription to a node with a channel.
   *
   * @param {string} channelName - The name of the channel.
   * @param {WCNode} node - The node to add the subscription to.
   * @param {Binding} bind - The bind object.
   * @param {boolean} [previousState=false] - The previous state flag. Default is `false`
   */
  addSubscription(channelName, node, bind, previousState = false) {
    const callback = this._wrapCallbackWithNode(node, bind);
    const channel = this.manager.get(channelName);

    if (channel) {
      const subscriptor = this.getSubscriptor(node);
      subscriptor.subscribe(channel, callback, previousState, bind);
    }
  }

  /**
   * Get a channel by name.
   *
   * @param {string} channelName - The name of the channel.
   * @returns {Channel} The channel.
   */
  getChannel(channelName) {
    return this.manager.get(channelName);
  }

  /**
   * Get all channels.
   *
   * @returns {Object<string, Channel>} The channels.
   */
  getChannels() {
    return this.manager.getChannels();
  }

  /**
   * Set the channels.
   *
   * @param {Object<string, Channel>} channels - The channels.
   */
  setChannels(channels) {
    this.manager.setChannels(channels);
  }

  /** Clean all channels. */
  cleanAllChannels() {
    this.manager.cleanAllChannels();
  }

  /**
   * Update a subscription to a node with a channel.
   *
   * @param {string} channelName - The name of the channel.
   * @param {WCNode} node - The node to update the subscription for.
   * @param {Binding} bind - The bind object.
   * @param {boolean} [previousState=false] - The previous state flag. Default is `false`
   */
  updateSubscription(channelName, node, bind, previousState = false) {
    const subscriptor = this.getSubscriptor(node);

    if (
      this.isActiveBridgeChannel(channelName) ||
      (!this.isActiveBridgeChannel(channelName) && !this.hasSubscriptions(subscriptor, channelName))
    ) {
      const channel = this.manager.get(channelName);
      const callback = this._wrapCallbackWithNode(node, bind);

      subscriptor.subscribe(channel, callback, previousState, bind);
    }
  }

  /**
   * Wrap a callback function with the given node and bind name.
   *
   * @param {WCNode} node - The node to wrap the callback with.
   * @param {Binding} bindName - The bind name.
   * @returns {AugmentedFunction} The wrapped callback function.
   */
  _wrapCallbackWithNode(node, bindName) {
    //let cb = this.wrapCallback(node, bindName);
    //cb.node = node;
    //return cb;
    return this.wrapCallback(node, bindName);
  }

  /**
   * Wrap a callback function with the given node and bind name.
   *
   * @param {IndexableHTMLElement} node - The node to wrap the callback with.
   * @param {Binding} bindName - The bind name.
   * @returns {AugmentedFunction} The wrapped callback function. re t urns {function(Event): void} -
   *   The wrapped callback function that expects an Event parameter and returns void.
   */
  wrapCallback(node, bindName) {
    const _idleCallback = (/** @type IdleRequestCallback */ fn) => {
      setTimeout(function () {
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(fn);
        } else {
          setTimeout(fn, 1);
        }
      }, 100);
    };

    /**
     * @param {WCEvent} evt - The event.
     * @returns {void}
     */
    const wrappedCallback = evt => {
      /**
       * @param {MutationRecord[]} mutationsList - The mutations that were observed.
       * @param {MutationObserver} observerObject - The MutationObserver instance.
       * @returns {void}
       */
      const checkComponentResolution = (mutationsList, observerObject) => {
        if (!this.adapter.isUnresolved(node)) {
          checkDispatchActionType();

          if (observerObject) {
            observerObject.disconnect();
          }
        } else {
          _idleCallback(checkDispatchActionType);
        }
      };

      const checkDispatchActionType = () => {
        if (typeof bindName === 'function' || typeof node[bindName] === 'function') {
          this.adapter.dispatchActionFunction(evt, node, bindName);
        } else {
          this.adapter.dispatchActionProperty(evt, node, bindName);
        }
      };

      if (this.adapter.isUnresolved(node)) {
        var observer = new MutationObserver(checkComponentResolution);
        var config = { attributes: false, childList: true, characterData: true };
        observer.observe(node, config);
        _idleCallback(checkDispatchActionType);
      } else {
        checkDispatchActionType();
      }
    };

    // REVIEW: check if this does not override the node property set in the subscribe method
    Object.defineProperty(wrappedCallback, /** @type {WCNode} */ 'node', {
      writable: true,
      configurable: true,
      enumerable: true,
    });
    return wrappedCallback;
  }

  /**
   * Check if a node has a publisher for the given channel and bind name.
   *
   * @param {Subscriptor} subscriptor - The subscriptor to check.
   * @param {WCNode} node - The node to check.
   * @param {string} channelName - The name of the channel.
   * @param {string} bindName - The bind name.
   * @returns {boolean} True if the node has a publisher, false otherwise.
   */
  _hasPublisher({ publications }, node, channelName, bindName) {
    return Boolean(
      (publications._subscriptions || []).find(
        publication =>
          publication.node === node &&
          publication.channelName === channelName &&
          publication.eventName === bindName,
      ),
    );
  }

  /**
   * Add a publicator to a node.
   *
   * @param {string} channelName - The name of the channel.
   * @param {WCNode} node - The node to add the publicator to.
   * @param {string} bindName - The bind name.
   * @param {Connection | undefined} outConnectionDefinition - The out connection definition.
   */
  addPublication(channelName, node, bindName, outConnectionDefinition) {
    if (this.isBridgeChannel(channelName)) {
      console.warn(
        `Forbidden operation. You are trying to write to a private channel (${channelName}).`,
      );
    } else {
      let subscriptor = this.getSubscriptor(node);
      let hasPublisher = this._hasPublisher(subscriptor, node, channelName, bindName);

      if (!hasPublisher) {
        let channel = this.manager.get(channelName);
        subscriptor.publish(this._wrapEvent(node, bindName, channel, outConnectionDefinition));
      }
    }
  }

  /**
   * Publish a value to the given channel.
   *
   * @param {string} channelName - The name of the channel.
   * @param {Object} value - The value to publish.
   */
  publish(channelName, value) {
    if (this.isBridgeChannel(channelName)) {
      console.warn(
        `Forbidden operation. You are trying to write to a private channel (${channelName}).`,
      );
    } else {
      const channel = this.manager.get(channelName);
      const customEventName = `${channelName}-publish`;

      channel.next(new CustomEvent(customEventName, { detail: value }));
    }
  }

  /**
   * Unsubscribe a node from the given channels.
   *
   * @param {string | string[]} channels - The channels to unsubscribe from.
   * @param {WCNode} node - The node to unsubscribe.
   */
  unsubscribe(channels, node) {
    if (!channels || !node) {
      return;
    }

    const normalizedChannels = Array.isArray(channels) ? channels : [channels];
    const subscriptor = this.subscriptors.get(node);
    const byChannelName = (/** @type {WCSubscriptionDetail} */ subscription) =>
      subscription.channel?.name && normalizedChannels.includes(subscription.channel?.name);
    const filterAndRemove = (/** @type {WCSubscriptionDetail} */ sub) => {
      if (byChannelName(sub)) {
        sub.subscription.unsubscribe();
        return false;
      }
      return true;
    };

    if (!subscriptor) {
      return;
    }
    subscriptor.subscriptions = subscriptor.subscriptions?.filter(filterAndRemove);
  }

  /**
   * Unregister a node from pubsub.
   *
   * @param {WCNode | undefined} node - The node to unregister.
   * @param {boolean} cleanPrivateChannels - The private channels to clean.
   */
  unregisterComponent(node, cleanPrivateChannels) {
    if (!node) {
      return;
    }

    const subscriptor = this.subscriptors.get(node);

    if (subscriptor) {
      subscriptor.unsubscribe(cleanPrivateChannels);
      this.subscriptors.delete(node);
    }
  }

  /**
   * Unregister all subscriptors and clean private channels.
   *
   * @param {boolean} cleanPrivateChannels - The private channels to clean.
   */
  unregisterAllSubscriptors(cleanPrivateChannels) {
    this.subscriptors.forEach(s => s.unsubscribe(cleanPrivateChannels));

    this.subscriptors = new Map();
  }

  /**
   * Wrap an event with the given node, event name, channel, and connection.
   *
   * @param {WCNode} node - The node to wrap the event with.
   * @param {string} eventName - The event name.
   * @param {Channel} channel - The channel.
   * @param {Connection | undefined} connection - The connection definition.
   * @returns {WCSubscription} The wrapped event function.
   */
  _wrapEvent(node, eventName, channel, connection) {
    const { AFTER_PUBLISH, NAV_REQUEST, ROUTER_BACKSTEP, TRACK_EVENT, LOG_EVENT } =
      externalEventsCodes;

    /** @type {ObservableWCEvent} */
    const source = fromEvent(node, eventName);

    /** @type {Subscription} */
    const wrappedListener = source.subscribe((/** @type {WCEvent} */ event) => {
      if (!this.adapter.isEventAtTarget(event)) {
        // If the event bubbles up from a child element:
        return;
      }

      channel.next(event);
      eventManager.emit(AFTER_PUBLISH, event);

      if (connection && connection.link) {
        const linkObject = Object.assign({}, connection.link);

        if (connection.link.page) {
          if (connection.link.page.hasOwnProperty('bind')) {
            linkObject.page = event.detail[connection.link.page.bind];
          }
        }

        if (connection.link.cleanUntil) {
          if (connection.link.cleanUntil.hasOwnProperty('bind')) {
            linkObject.cleanUntil = event.detail[connection.link.cleanUntil.bind];
          }
        }

        eventManager.emit(NAV_REQUEST, {
          event: event,
          detail: linkObject,
        });
      }

      if (connection && connection.backStep) {
        eventManager.emit(ROUTER_BACKSTEP, {
          event: event,
          detail: {},
        });
      }

      if (connection && connection.analytics) {
        eventManager.emit(TRACK_EVENT, {
          event: event,
          detail: connection.analytics,
        });
      }

      if (connection && connection.log) {
        eventManager.emit(LOG_EVENT, {
          event: event,
          detail: connection.log,
        });
      }
    });

    Object.defineProperty(wrappedListener, /** @type {WCNode} */ 'node', {
      value: node,
      writable: true,
      configurable: true,
      enumerable: true,
    });

    Object.defineProperty(wrappedListener, /** @type {string} */ 'eventName', {
      value: eventName,
      writable: true,
      configurable: true,
      enumerable: true,
    });

    Object.defineProperty(wrappedListener, /** @type {string} */ 'channelName', {
      value: channel.name,
      writable: true,
      configurable: true,
      enumerable: true,
    });

    Object.defineProperty(wrappedListener, /** @type {Connection} */ 'options', {
      value: connection,
      writable: true,
      configurable: true,
      enumerable: true,
    });

    return wrappedListener;
  }

  /**
   * Create a new event with the given name and value.
   *
   * @param {string} name - The name of the event.
   * @param {Object} value - The value of the event.
   * @returns {WCEvent} The created event.
   */
  createEvent(name, value) {
    /** @type {WCEvent} */
    const evt = new Event(name);
    evt.detail = { value };
    return evt;
  }

  /**
   * Check if a channel with the given name is an active bridge channel.
   *
   * @param {string} name - The name of the channel.
   * @returns {boolean} True if the channel is an active bridge channel, false otherwise.
   */
  isActiveBridgeChannel(name) {
    if (this.manager.getUnsafe(name)) {
      return this.isBridgeChannel(name);
    } else {
      return false;
    }
  }

  /**
   * Check if a channel with the given name is a bridge channel.
   *
   * @param {string} name - The name of the channel.
   * @returns {boolean} True if the channel is a bridge channel, false otherwise.
   */
  isBridgeChannel(name) {
    return this.bridgeChannelPrefixRegex.test(name);
  }

  /**
   * Check if the given subscriptor has subscriptions to the given channel.
   *
   * @param {Subscriptor} subscriptor - The subscriptor to check.
   * @param {string} channelName - The name of the channel.
   * @returns {boolean} True if the subscriptor has subscriptions, false otherwise.
   */
  hasSubscriptions(subscriptor, channelName) {
    return Boolean(subscriptor.subscriptions.find(d => d.channel.name === channelName));
  }
}
