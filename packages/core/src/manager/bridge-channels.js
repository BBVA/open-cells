import { Observable, fromEvent } from 'rxjs';
import { first } from 'rxjs/operators';
import { eventManager } from './events';
import { BRIDGE_CHANNEL_PREFIX } from '../constants';

/**
 * @typedef {import('../../types').AugmentedFunction} AugmentedFunction
 *
 * @typedef {import('../../types').Bridge} Bridge
 *
 * @typedef {import('../../types').Channel} Channel
 *
 * @typedef {import('../../types').Navigation} Navigation
 *
 * @typedef {import('../../types').Binding} Binding
 *
 * @typedef {import('../../types').InConnection} InConnection
 *
 * @typedef {import('../../types').OutConnection} OutConnection
 *
 * @typedef {import('../../types').CCSubscriptions} CCSubscriptions
 *
 * @typedef {import('../../types').Route} Route
 *
 * @typedef {import('../../types').RouteData} RouteData
 *
 * @typedef {import('../../types').Router} Router
 *
 * @typedef {import('../state/subscriptor').Subscriptor} Subscriptor
 *
 * @typedef {import('../../types').WCNode} WCNode
 *
 * @typedef {import('../../types').WCSubscription} WCSubscription
 *
 * @typedef {import('../../types').WCSubscriptionDetail} WCSubscriptionDetail
 */

/**
 * @class BridgeChannelManager
 *
 *   Manages the bridge channels for communication between components.
 */
export class BridgeChannelManager {
  /**
   * Creates a new instance of BridgeChannelManager.
   *
   * @param {Bridge} bridge - The bridge instance.
   */
  constructor(bridge) {
    this.componentConnector = bridge.ComponentConnector;
    this.privateChannels = new Set();
  }

  /**
   * Returns the name of the application context channel.
   *
   * @returns {string} The application context channel name.
   */
  getAppContextChannelName() {
    return `${BRIDGE_CHANNEL_PREFIX}_app`;
  }

  /**
   * Returns the name of the channel that has cancellations of back navigations.
   *
   * @returns {string} The cancelled back navigation channel name.
   */
  getCancelledBackNavigationChannelName() {
    return `${BRIDGE_CHANNEL_PREFIX}_cancelled_back_navigation`;
  }

  /**
   * Returns the name of the channel that has intercepted navigations.
   *
   * @returns {string} The intercepted navigation channel name.
   */
  getInterceptedNavigationChannelName() {
    return `${BRIDGE_CHANNEL_PREFIX}_intercepted_navigation`;
  }

  /**
   * Returns the prefix for private channels.
   *
   * @returns {string} The private channel prefix.
   */
  getPrivateChannelPrefix() {
    return `${BRIDGE_CHANNEL_PREFIX}_page_`;
  }

  /**
   * Returns the prefix for event channels.
   *
   * @returns {string} The event channel prefix.
   */
  getEventChannelPrefix() {
    return `${BRIDGE_CHANNEL_PREFIX}_evt_`;
  }

  /**
   * Returns the prefix for generic channels.
   *
   * @returns {string} The bridge channel prefix.
   */
  getBridgeChannelPrefix() {
    return `${BRIDGE_CHANNEL_PREFIX}_ch_`;
  }

  /**
   * Returns the prefix for post message channels.
   *
   * @returns {string} The post message channel prefix.
   */
  getPostMessageChannelPrefix() {
    return `${BRIDGE_CHANNEL_PREFIX}_post_message_`;
  }

  /**
   * Gets a bridge channel. If the channel doesn't exist, it creates one.
   *
   * @param {string} channelName - The name of the channel to retrieve/create.
   * @returns {Channel} The bridge channel.
   */
  getBridgeChannel(channelName) {
    // return this.componentConnector.manager.get(this.getBridgeChannelPrefix() + channelName);
    return this.componentConnector.getChannel(this.getBridgeChannelPrefix() + channelName);
  }

  // /**
  //  * Gets the idle callback channel.
  //  *
  //  * @returns {Observable<boolean>} The idle callback channel.
  //  */
  // getIdleCallbackChannel() {
  //   const idleChannel$ = new Observable(observer => observer.next(true));

  //   return idleChannel$.pipe(first());
  // }

  /**
   * Gets the application context channel.
   *
   * @returns {Channel} The application context channel.
   */
  getAppContextChannel() {
    // return this.componentConnector.manager.get(this.getAppContextChannelName());
    return this.componentConnector.getChannel(this.getAppContextChannelName());
  }

  /**
   * Gets the cancelled back navigations channel.
   *
   * @returns {Channel} The cancelled back navigation channel.
   */
  getCancelledBackNavigationChannel() {
    // return this.componentConnector.manager.get(this.getCancelledBackNavigationChannelName());
    return this.componentConnector.getChannel(this.getCancelledBackNavigationChannelName());
  }

  /**
   * Gets the intercepted navigations channel.
   *
   * @returns {Channel} The intercepted navigation channel.
   */
  getInterceptedNavigationChannel() {
    // return this.componentConnector.manager.get(this.getInterceptedNavigationChannelName());
    return this.componentConnector.getChannel(this.getInterceptedNavigationChannelName());
  }

  /**
   * Gets the private channel that corresponds to a page.
   *
   * @param {string} pageName - The name of the page.
   * @returns {Channel} The private channel.
   */
  getPrivate(pageName) {
    const newName = this.getPrivateChannelPrefix() + pageName;
    // const channel = this.componentConnector.manager.get(newName);
    const channel = this.componentConnector.getChannel(newName);
    this.privateChannels.add(newName);
    return channel;
  }

  /**
   * Gets the post message channel for the given event name.
   *
   * @param {string} eventName - The name of the event.
   * @returns {Channel} The post message channel.
   */
  getPostMessageChannel(eventName) {
    const newName = this.getPostMessageChannelPrefix() + eventName;

    // return this.componentConnector.manager.get(newName);
    return this.componentConnector.getChannel(newName);
  }

  /** Initializes the application context channel. */
  initAppContextChannel() {
    this.getAppContextChannel();
  }

  /** Initializes the cancelled back navigation channel. */
  initCancelledBackNavigationChannel() {
    this.getCancelledBackNavigationChannel();
  }

  /**
   * Initializes the private channel for the given page.
   *
   * @param {string | undefined} oldPageName - The name of the old page.
   * @param {string} newPageName - The name of the new page.
   */
  initPrivateChannel(oldPageName, newPageName) {
    this.publishPrivatePageStatus(newPageName, true);

    if (oldPageName) {
      this.publishPrivatePageStatus(oldPageName, false);
    }
  }

  /**
   * Publishes the status of a page in its private channel.
   *
   * @param {string} pageName - The name of the page.
   * @param {boolean} status - The status of the page.
   */
  publishPrivatePageStatus(pageName, status) {
    const channel = this.getPrivate(pageName);
    const evt = eventManager.createEvent('page-load', status);

    channel.next(evt);
  }

  /**
   * Updates the application context.
   *
   * @param {string | undefined} oldPage - The previous current page.
   * @param {string} newPage - The new current page.
   * @param {Object} appContext - The application context.
   * @param {RouteData} currentRoute - The details about the route.
   */
  updateAppContext(oldPage, newPage, appContext, currentRoute) {
    const evt = eventManager.createEvent('app-context', {
      currentPage: newPage,
      fromPage: oldPage,
      interceptorContext: appContext,
      currentRoute,
    });

    this.getAppContextChannel().next(evt);
  }

  /**
   * Updates the bridge channels.
   *
   * @param {string | undefined} oldPage - The previous current page.
   * @param {string} newPage - The new current page.
   * @param {Object} appContext - The application context.
   * @param {RouteData} currentRoute - The details about the route.
   */
  updateBridgeChannels(oldPage, newPage, appContext, currentRoute) {
    this.updateAppContext(oldPage, newPage, appContext, currentRoute);
    this.initPrivateChannel(oldPage, newPage);
  }

  /**
   * Publishes the cancelled back navigation event.
   *
   * @param {Navigation} navigation - The navigation details.
   */
  publishCancelledBackNavigation(navigation) {
    const evt = eventManager.createEvent('back-nav-cancelled', navigation);

    this.getCancelledBackNavigationChannel().next(evt);
  }

  /**
   * Publishes the intercepted navigation event.
   *
   * @param {Navigation} navigation - The navigation details.
   */
  publishInterceptedNavigation(navigation) {
    const evt = eventManager.createEvent('intercepted-navigation', navigation);

    this.getInterceptedNavigationChannel().next(evt);
  }

  /**
   * Checks if the given name matches a private channel's name.
   *
   * @param {string} name - The name to check.
   * @returns {boolean} True if the name matches a private channel's name, false otherwise.
   */
  isPrivateChannel(name) {
    return name.indexOf(this.getPrivateChannelPrefix()) === 0;
  }

  /**
   * Checks if there's an active private channel with the given name.
   *
   * @param {string} name - The name to check.
   * @returns {boolean} True if there's an active private channel with the given name, false
   *   otherwise.
   */
  isActivePrivateChannel(name) {
    return this.privateChannels.has(name);
  }

  /**
   * Resets all channels, including the private channels. It removes all observers and publications.
   *
   * @param {WCNode} mainNode - The main node.
   * @param {boolean} cleanPrivateChannels - Whether to clean private channels or not.
   */
  resetBridgeChannels(mainNode, cleanPrivateChannels) {
    // const bridgeChannels = Object.keys(this.componentConnector.manager.channels);
    const bridgeChannels = Object.keys(this.componentConnector.getChannels());

    bridgeChannels.forEach(chnlName => {
      // let chnl = this.componentConnector.manager.get(chnlName);
      let chnl = this.componentConnector.getChannel(chnlName);
      chnl.clean();
      chnl.unsubscribe();
    });

    this.componentConnector.unregisterComponent(mainNode, cleanPrivateChannels);
    this.componentConnector.unregisterAllSubscriptors(cleanPrivateChannels);
    // this.componentConnector.manager.cleanAllChannels();
    this.componentConnector.cleanAllChannels();
  }

  /**
   * Gets the cross-container and main node connections.
   *
   * @param {string} crossContainerId - The ID of the cross-container.
   * @param {string} mainNodeId - The ID of the main node.
   * @returns {CCSubscriptions} The cross-container and main node connections.
   */
  getCCSubscriptions(crossContainerId, mainNodeId) {
    /** @type {Subscriptor[]} } */
    const crossComponents = Array.from(this.componentConnector.subscriptors.values()).filter(
      c =>
        // @ts-ignore
        c.node.parentNode?.id === crossContainerId ||
        // @ts-ignore
        c.node.parentNode?.id === mainNodeId ||
        c.node.id === mainNodeId,
    );

    /** @type {OutConnection[]} */
    const outConnections =
      crossComponents
        .map(c =>
          /** @type {WCSubscription[]} */
          c.publications?._subscriptions?.map((/** @type {WCSubscription} */ s) => {
            /** @type {OutConnection} */
            return {
              channel: s.channelName || '',
              bind: s.eventName || '',
              component: c.node,
              //options: s.options,
              options: undefined,
            };
          }),
        )
        .filter(c => c !== undefined)
        .reduce((acc, cnxs) => acc?.concat(cnxs || []), []) || [];

    /** @type {InConnection[]} */
    let inConnections = crossComponents
      .map(
        /** @type {Subscriptor} */ c =>
          c.subscriptions?.map((/** @type {WCSubscriptionDetail} */ s) => {
            /** @type {InConnection} */
            return {
              channel: s.channel.name,
              bind: s.bind,
              component: c.node,
            };
          }),
      )
      .filter((/** @type {InConnection[]} */ c) => c !== undefined)
      .reduce(
        (/** @type {InConnection[]} */ acc, /** @type {InConnection[]} */ cnxs) => acc.concat(cnxs),
        [],
      );

    return { inConnections, outConnections };
  }

  /**
   * Initializes the event channels.
   *
   * @param {Node} node - The node to listen for events.
   * @param {string[]} externalEvents - The names of the external events.
   */
  initEventChannels(node, externalEvents) {
    externalEvents.forEach(eventName => {
      const prefix = this.getEventChannelPrefix();
      const channelName = prefix + eventName;
      // const channel = this.componentConnector.manager.get(channelName);
      const channel = this.componentConnector.getChannel(channelName);
      const source = fromEvent(node, eventName);
      source.subscribe(event => channel.next(event));
    });
  }

  /**
   * Subscribes to an event channel.
   *
   * @param {HTMLElement} node - The node to subscribe.
   * @param {string} eventName - The name of the event.
   * @param {Function} callback - The callback function.
   */
  subscribeToEvent(node, eventName, callback) {
    const prefix = this.getEventChannelPrefix();
    const channelName = prefix + eventName;
    const subscriptor = this.componentConnector.getSubscriptor(node);
    // const channel = this.componentConnector.manager.get(channelName);
    const channel = this.componentConnector.getChannel(channelName);

    // callback.node = node;
    const augmentedCallback = callback;
    Object.defineProperty(augmentedCallback, /** @type {WCNode} */ 'node', {
      writable: true,
      configurable: true,
      enumerable: true,
    });
    subscriptor.subscribe(channel, augmentedCallback, false, '');
  }
}
