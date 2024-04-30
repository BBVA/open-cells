import { BRIDGE_CHANNEL_PREFIX } from '../constants';

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
      this._sendPostMessage({ event: `${BRIDGE_CHANNEL_PREFIX}-ready` });
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
