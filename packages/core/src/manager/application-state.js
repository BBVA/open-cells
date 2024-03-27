import { CellsStorage } from './storage';

const CONFIG_STORAGE_PREFIX = '__app_';
const CONFIG_STORAGE_KEY = 'state';

/** @typedef {import('../component-connector').ComponentConnector} ComponentConnector */

/** Represents the application state manager. */
export class ApplicationStateManager {
  /**
   * @param {object} config - The configuration object.
   * @param {ComponentConnector} config.ComponentConnector - The component connector instance.
   */
  constructor({ ComponentConnector }) {
    this.ComponentConnector = ComponentConnector;
    this.storage = this._getAppStateStorage();
  }

  /**
   * Returns the application state storage.
   *
   * @private
   * @returns {CellsStorage} The application state storage.
   */
  _getAppStateStorage() {
    return new CellsStorage({
      prefix: CONFIG_STORAGE_PREFIX,
      persistent: false,
    });
  }

  /**
   * Saves the application state for a specific channel.
   *
   * @param {string} channelName - The name of the channel.
   * @param {any} value - The value to be saved.
   */
  saveAppState(channelName, value) {
    const state = this.storage.getItem(CONFIG_STORAGE_KEY);

    if (state) {
      state[channelName] = value;
      this.storage.setItem(CONFIG_STORAGE_KEY, state);
    }
  }

  /** Loads the application state from storage and publishes it to the corresponding channels. */
  loadAppState() {
    const state = this.storage.getItem(CONFIG_STORAGE_KEY);

    for (let channel in state) {
      this.ComponentConnector.publish(channel, state[channel]);
    }
  }
}
