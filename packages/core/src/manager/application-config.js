import { CellsStorage } from './storage';

const CONFIG_STORAGE_PREFIX = '__app_';
const CONFIG_STORAGE_KEY = 'config';

/** @typedef {import('./action-channels').ActionChannelManager} ActionChannelManager */

/**
 * Manages the application configuration.
 *
 * @class
 */
export class ApplicationConfigManager {
  /**
   * Constructs a new ApplicationConfigManager instance.
   *
   * @class
   * @param {Object} options - The options for the ApplicationConfigManager.
   * @param {ActionChannelManager} options.ActionChannelManager - The ActionChannelManager instance.
   */
  constructor({ ActionChannelManager }) {
    this.ActionChannelManager = ActionChannelManager;
    this.storage = this._getAppConfigStorage();
  }

  /**
   * Returns a new CellsStorage instance for storing the application configuration.
   *
   * @private
   * @returns {CellsStorage} - The CellsStorage instance.
   */
  _getAppConfigStorage() {
    return new CellsStorage({
      prefix: CONFIG_STORAGE_PREFIX,
      persistent: false,
    });
  }

  /**
   * Saves the application configuration.
   *
   * @param {{ [kwy: string]: any }} config - The configuration object to be saved.
   */
  saveAppConfig(config) {
    /** @type {{ [kwy: string]: any }} */
    const store = {};

    for (let prop in config) {
      if (config.hasOwnProperty(prop) && this.ActionChannelManager.isAllowedProperty(prop)) {
        store[prop] = config[prop];
      }
    }

    if (Object.keys(store).length > 0) {
      this.storage.setItem(CONFIG_STORAGE_KEY, store);
    }
  }

  /** Loads the application configuration. */
  loadAppConfig() {
    const config = this.storage.getItem(CONFIG_STORAGE_KEY);

    for (let prop in config) {
      config.hasOwnProperty(prop) && this.ActionChannelManager.updateProperty(prop, config[prop]);
    }
  }
}
