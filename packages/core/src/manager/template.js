import { Template } from '../template';
import { eventManager } from './events';
import { Constants } from '../constants';

/**
 * @typedef {import('../../types').WCNode} WCNode
 *
 * @typedef {import('../../types').TemplateNode} TemplateNode
 *
 * @typedef {import('../../types').TemplateManagerConfig} TemplateManagerConfig
 *
 * @typedef {import('../../types').TemplateConfig} TemplateConfig
 *
 * @typedef {import('../../types').TemplateSpec} TemplateSpec
 */

const { externalEventsCodes } = Constants;

/**
 * @class TemplateManager Represents a template manager for Cells. Manages the creation, storage,
 *   and retrieval of templates.
 */
export class TemplateManager {
  /**
   * The template cache.
   *
   * @type {{ [key: string]: Template }}
   */
  cache = {};

  /**
   * The templates collection.
   *
   * @type {{ [key: string]: TemplateNode }}
   */
  templates = {};

  /**
   * The name of the currently selected template.
   *
   * @type {string}
   */
  selected = '';

  /**
   * The list of template locations.
   *
   * @type {string[]}
   */
  locations = [];

  /**
   * The number of templates stored in the cache.
   *
   * @type {number}
   */
  size = 0;

  /**
   * The list of fixed templates.
   *
   * @type {string[]}
   */
  fixedTemplates = ['__cross'];

  /**
   * Creates a new instance of the TemplateManager class.
   *
   * @param {TemplateManagerConfig} config - The configuration options.
   */
  constructor(config = {}) {
    const persistentPages = config.persistentPages || [];

    this.viewLimit = config.viewLimit && config.viewLimit >= 1 ? config.viewLimit : 3;
    this.fixedTemplates = this.fixedTemplates.concat(persistentPages);
    this.maxSize = this.viewLimit + this.fixedTemplates.length;
  }

  /**
   * Creates a template with the specified name and spec.
   *
   * @param {string} name - The name of the template.
   * @param {TemplateSpec} spec - The template spec. is `false`
   * @returns {Template} The created template.
   */
  createTemplate(name, spec) {
    let template = this.get(name);

    if (!template) {
      template = this._createTemplate(name, spec);
      this._storeTemplate(name, template);
    }

    return template;
  }

  /**
   * Creates a CellsTemplate instance.
   *
   * @private
   * @param {string} name - The name of the template.
   * @param {TemplateSpec} spec - The template spec.
   * @returns {Template} The created CellsTemplate instance.
   */
  _createTemplate(name, spec) {
    const cellsTemplate = new Template(spec);
    const cellsTemplateConfig = this._createTemplateConfig(name);

    cellsTemplate.config(cellsTemplateConfig);
    return cellsTemplate;
  }

  /**
   * Creates a CellsTemplateConfig object.
   *
   * @private
   * @param {string} name - The name of the template.
   * @returns {TemplateConfig} The created CellsTemplateConfig object.
   */
  _createTemplateConfig(name) {
    return {
      name: name,
      template: {
        id: this.computeTemplateId(name),
        name: name,
      },
    };
  }

  /**
   * Stores a template in memory.
   *
   * @private
   * @param {string} name - The name of the template.
   * @param {Template} template - The template object.
   */
  _storeTemplate(name, template) {
    const { node } = template;

    if (this.size >= this.maxSize) {
      const olderTemplateToDeallocate = this._getOlderRemovableTemplate();
      if (olderTemplateToDeallocate) {
        this.removeTemplate(olderTemplateToDeallocate);
      } else {
        console.warn('No space left in template cache for template ', name);
      }
    }

    this.locations.push(name);
    this.cache[name] = template;
    this.templates[name] = node;
    this.size++;
  }

  /**
   * Gets the older removable template.
   *
   * @private
   * @returns {string | undefined} The name of the older removable template.
   */
  _getOlderRemovableTemplate() {
    let found = false;
    let olderRemovableTemplate;

    for (let i = 0; !found && i < this.locations.length; i++) {
      const isNotPersistantPage = this.fixedTemplates.indexOf(this.locations[i]) == -1;

      if (isNotPersistantPage) {
        olderRemovableTemplate = this.locations[i];
        found = true;
      }
    }

    return olderRemovableTemplate;
  }

  /**
   * Gets a template by name.
   *
   * @param {string} name - The name of the template.
   * @returns {Template} The template with the specified name.
   */
  get(name) {
    return this.cache[name];
  }

  /**
   * Gets the node of a template by name.
   *
   * @param {string} name - The name of the template.
   * @returns {TemplateNode} The node of the template with the specified name.
   */
  getNode(name) {
    return this.templates[name];
  }

  /**
   * Parses a template name.
   *
   * @param {string} name - The template name.
   * @returns {string} The parsed template name.
   */
  parseTemplateName(name) {
    return name;
  }

  /**
   * Computes the template ID.
   *
   * @param {string} name - The template name.
   * @returns {string} The computed template ID.
   */
  computeTemplateId(name) {
    return 'cells-template-' + name.replace(/\./g, '-');
  }

  /**
   * Selects a template.
   *
   * @fires template-transition-end
   * @param {string} name - The name of the template.
   */
  select(name) {
    const { TEMPLATE_TRANSITION_END } = externalEventsCodes;
    const template = this.get(name);
    const cache = this.cache;
    let oldPageName;

    for (let tplName in cache) {
      if (cache.hasOwnProperty(tplName)) {
        if (tplName === this.selected) {
          oldPageName = tplName;
          cache[tplName].deactivate();
        } else if (name !== tplName) {
          cache[tplName].cache();
        }
      }
    }

    this.selected = name;
    template.activate();

    eventManager.emit(TEMPLATE_TRANSITION_END, template);
  }

  /**
   * Removes a template by name.
   *
   * @param {string} templateName - The name of the template to remove.
   */
  removeTemplate(templateName) {
    if (this.templates[templateName]) {
      const node = document.querySelector('#' + this.templates[templateName].id);
      if (!node) {
        throw new Error(`Template ${templateName} node not found`);
      }
      const pos = this.locations.indexOf(templateName);
      this.locations.splice(pos, 1);
      if (!node.parentNode) {
        throw new Error(`Template ${templateName} has no parent node`);
      }
      node.parentNode.removeChild(node);
      delete this.templates[templateName];
      delete this.cache[templateName];
      this.size--;
    }
  }

  /**
   * Removes all templates except the initial one and the cross component one.
   *
   * @param {string} initialTemplate - The name of the initial template.
   * @param {string} crossContainerId - The name of the cross component template.
   */
  removeTemplates(initialTemplate, crossContainerId) {
    for (let templateName in this.templates) {
      if (this.templates.hasOwnProperty(templateName)) {
        if (templateName !== initialTemplate && templateName !== crossContainerId) {
          this.removeTemplate(templateName);
        }
      }
    }
  }

  /**
   * Removes all children of a template.
   *
   * @param {string} templateName - The name of the template.
   */
  removeTemplateChildrens(templateName) {
    const template = this.templates[templateName];
    if (template) {
      while (template.firstChild) {
        template.removeChild(template.firstChild);
      }
    }
  }
}
