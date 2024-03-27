import { attributeWhiteList, setAttribute } from '../utils.js';

/**
 * @typedef {import('../../types/index.js').IndexableHTMLElement} IndexableHTMLElement
 *
 * @typedef {import('../../types/index.js').WCEvent} WCEvent
 *
 * @typedef {import('../component-connector.js').ComponentConnector} ComponentConnector
 */

/**
 * Converts a dash-separated string to camel case.
 *
 * @param {string} input - The input string to convert.
 * @returns {string} The converted camel case string.
 */
const _dashToCamelCase = input => {
  return input.toLowerCase().replace(/-(.)/g, function (match, group1) {
    return group1.toUpperCase();
  });
};

/** Represents a adapter for LitElement components. */
export class ElementAdapter {
  /**
   * Creates a new instance of LitElementAdapter.
   *
   * @param {ComponentConnector} componentConnector - The component connector.
   */
  constructor(componentConnector) {
    this.componentConnector = componentConnector;
  }

  /**
   * Checks if the given node is unresolved.
   *
   * @param {HTMLElement} node - The node to check.
   * @returns {boolean} - True if the node is unresolved, false otherwise.
   */
  isUnresolved(node) {
    const isCustomElement = node.tagName.includes('-');
    const resolved = !!window.customElements.get(node.tagName.toLowerCase());

    return isCustomElement && !resolved;
  }

  /**
   * Checks if the given node is an instance of a web component.
   *
   * @param {HTMLElement} node - The node to check.
   * @returns {boolean} - True if the node is an instance, false otherwise.
   */
  isInstance(node) {
    const isCustomElement = node.tagName.includes('-');
    return isCustomElement && !this.isUnresolved(node);
  }

  /**
   * Returns true if the event has reached the node that is listening the event.
   *
   * @param {WCEvent} event - The event to check.
   * @returns {boolean} - True if the event is at the target, false otherwise.
   */
  isEventAtTarget(event) {
    const AT_TARGET_VALUE = Event.AT_TARGET || Event.prototype.AT_TARGET;
    return event.eventPhase === AT_TARGET_VALUE;
  }

  /**
   * Dispatches an action function.
   *
   * @param {WCEvent} evt - The event.
   * @param {IndexableHTMLElement} target - The target object.
   * @param {Function | string} method - The method to call.
   */
  dispatchActionFunction(evt, target, method) {
    const payload = evt.detail;

    if (typeof method === 'function') {
      method(payload);
    } else {
      if (target[method] && typeof target[method] === 'function') {
        target[method](payload);
      }
    }
  }

  /**
   * Dispatches an action property.
   *
   * @param {WCEvent} evt - The event.
   * @param {IndexableHTMLElement} target - The target object.
   * @param {string} property - The property to set.
   */
  dispatchActionProperty(evt, target, property) {
    const data = this._parseActionInEvent(evt, property, target);

    if (!attributeWhiteList.includes(property) && target[property]) {
      target[property] = data.value;
    } else {
      setAttribute(target, property, data.value);
    }
  }

  /**
   * Gets the property changed name.
   *
   * @private
   * @param {string} name - The name.
   * @returns {string | undefined} - The property changed name.
   */
  _getPropertyChangedName(name) {
    let propertyName;
    const EVENT_CHANGED = '-changed';

    if (name.indexOf(EVENT_CHANGED, name.length - EVENT_CHANGED.length) !== -1) {
      propertyName = name.slice(0, -EVENT_CHANGED.length);
      propertyName = _dashToCamelCase(propertyName);
    }

    return propertyName;
  }

  /**
   * @typedef {Object} ActionDetail
   * @property {string} path - The path of the action.
   * @property {any} value - The value of the action.
   * @property {string} property - The property of the action.
   */

  /**
   * Parses the action in the event.
   *
   * @private
   * @param {WCEvent} evt - The event.
   * @param {string} targetPath - The target path.
   * @param {HTMLElement} target - The target object.
   * @returns {ActionDetail} - The parsed action.
   */
  _parseActionInEvent = (evt, targetPath, target) => {
    // Check if event is because of property changed.
    let propertyName = this._getPropertyChangedName(evt.type);
    let value;
    let path;

    if (propertyName && evt.detail && Object.prototype.hasOwnProperty.call(evt.detail, 'value')) {
      value = evt.detail.value;
      targetPath = targetPath || propertyName;

      if (evt.detail.path) {
        path = evt.detail.path.replace(propertyName, targetPath);
      } else {
        path = targetPath;
      }
    } else {
      path = targetPath;
      value = evt.detail;
    }

    return {
      path: path,
      value: value,
      property: targetPath,
    };
  };
}
