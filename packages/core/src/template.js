/**
 * @typedef {import('../types').TemplateSpec} TemplateSpec
 *
 * @typedef {import('../types').TemplateConfig} TemplateConfig
 *
 * @typedef {import('../types').WCNode} WCNode
 *
 * @typedef {import('../types').TemplateNode} TemplateNode
 */

/**
 * @class Template
 *
 *   Represents a template component. A template is a reusable component that can contain other
 *   components.
 */
export class Template {
  /**
   * Type
   *
   * Indicates the type of this component
   *
   * @type {String}
   */
  type = 'TEMPLATE';

  /**
   * Creates a new Template instance.
   *
   * @param {TemplateSpec} spec - The specification object for the Template.
   */
  constructor(spec) {
    if (spec.node) {
      /** @type {TemplateNode} */
      this.node = spec.node;
    } else if (spec.tagName) {
      /** @type {TemplateNode} */
      this.node = document.createElement(spec.tagName);
    } else {
      throw new Error('Template must have a node or a tagName');
    }
    this.name = '';
    // /** @type {TemplateNode} */
    // this.node = spec.node ? spec.node : document.createElement(spec.tagName);
  }

  /**
   * Returns the zone node in the template identified by the id.
   *
   * @param {String} zoneId - The ID of the zone.
   * @returns {TemplateNode} - The zone node.
   */
  getZone(zoneId) {
    const curTemplateNode = this.node;
    /** @type {TemplateNode | null} */
    let node;
    if (!zoneId) {
      node = curTemplateNode;
    } else {
      node = curTemplateNode.querySelector('#' + zoneId);
    }
    return node || curTemplateNode;
  }

  /**
   * Sets the attribute cache in the template node to 'cached' for not loading the template again
   * the next time the template is used.
   */
  cache() {
    this._setAttribute('state', 'cached');
  }

  /**
   * Sets the attribute cache in the template node to 'active' so you can know which of the
   * templates in html is the actual one.
   */
  activate() {
    this._setAttribute('state', 'active');
  }

  /**
   * Sets the attribute cache in the template node to 'inactive' so you can know which of the
   * templates in html are not the actual one.
   */
  deactivate() {
    this._setAttribute('state', 'inactive');
  }

  /**
   * Set given value to corresponding attribute name of current template.
   *
   * @private
   * @param {String} name - Attribute name.
   * @param {String} value - Attribute value.
   */
  _setAttribute(name, value) {
    const template = this._getTemplate(this.node);

    try {
      template.setAttribute(name, value);
    } catch (err) {
      throw new Error(
        `${this.node.tagName.toLowerCase()} has no valid template. Template was ${template}`,
      );
    }
  }

  /**
   * Get given attribute value from the current template.
   *
   * @private
   * @param {String} name - Attribute name.
   * @returns {String} - Attribute value.
   */
  _getAttribute(name) {
    const template = this._getTemplate(this.node);
    let attribute = '';

    try {
      attribute = template.getAttribute(name) || '';
    } catch (err) {
      throw new Error(
        `${this.node.tagName.toLowerCase()} has no valid template. Template was ${template}`,
      );
    }

    return attribute;
  }

  /**
   * Returns current template based on node type. If it's a routable component (page), we retrieve
   * the first child element that matches with cells-template. Otherwise, we return directly the
   * node (cells-template).
   *
   * @private
   * @param {TemplateNode} node - Node for template retrieval.
   * @returns {TemplateNode} - Associated template from given node.
   * @r eturns {WCNode} - Associated template from given node.
   */
  _getTemplate(node) {
    const { tagName } = node;
    const isPage = tagName.toLowerCase().endsWith('-page');

    return isPage ? this._getTemplateFromPage(node) || node : node;
  }

  /**
   * Returns the first element from shadowRoot child nodes that matches 'cells-template'.
   *
   * @private
   * @param {TemplateNode} node - First level component that contains cells-template inside
   *   shadowRoot childNodes.
   * @returns {TemplateNode | undefined} - Cells template.
   * @r eturns {WCNode | undefined} - Cells template.
   */
  _getTemplateFromPage(node) {
    const list =
      node.shadowRoot && node.shadowRoot.childNodes ? node.shadowRoot.childNodes : node.children;

    /** @t ype {WCNode[]} */
    /** @type {TemplateNode[]} */
    // @ts-ignore
    const listOfTemplates = Array.from(list).filter(el => el instanceof HTMLElement);
    return listOfTemplates.find(
      el =>
        el.tagName &&
        (el.tagName.toLowerCase().indexOf('cells-template') !== -1 ||
          el.getAttribute('data-cells-type') === 'template'),
    );
  }

  /**
   * Configures the Template with the provided configuration.
   *
   * @param {TemplateConfig} config - The configuration object for the Template.
   */
  config(config) {
    const {
      name,
      template: { id: templateId, name: templateName },
    } = config;

    this.name = name;
    this.node.id = templateId;
    this.node.name = templateName;
  }
}
