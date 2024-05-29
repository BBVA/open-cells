// eslint-disable-next-line no-unused-vars../types
import { ComponentConnector } from './component-connector';
import { Router } from './router';
/** @type {EventEmitter} */
import { eventManager } from './manager/events';
import { TemplateManager } from './manager/template';
import { BridgeChannelManager } from './manager/bridge-channels';
import { ActionChannelManager } from './manager/action-channels';
import { Utils } from './utils';
import { Constants } from './constants';
import { PostMessageManager } from './manager/post-message';
import { ApplicationConfigManager } from './manager/application-config';
import { ApplicationStateManager } from './manager/application-state';
import { Template } from './template';
import { BRIDGE_CHANNEL_PREFIX } from './constants';

/**
 * @typedef {import('../types').CellsConfig} CellsConfig
 *
 * @typedef {import('../types').EventEmitter} EventEmitter
 *
 * @typedef {import('../types').BridgeAPI} BridgeAPI
 *
 * @typedef {import('../types').WCEvent} WCEvent
 *
 * @typedef {import('../types').WCNode} WCNode
 *
 * @typedef {import('../types').Binding} Binding
 *
 * @typedef {import('../types').CallBackFunction} CallBackFunction
 *
 * @typedef {import('../types').IndexableHTMLElement} IndexableHTMLElement
 *
 * @typedef {import('../types').TemplateNode} TemplateNode
 *
 * @typedef {import('../types').AugmentedFunction} AugmentedFunction
 *
 * @typedef {import('../types').Route} Route
 *
 * @typedef {import('../types').RouteData} RouteData
 *
 * @typedef {import('../types').ParsedRoute} ParsedRoute
 *
 * @typedef {import('../types').NavigationWithParams} NavigationWithParams
 *
 * @typedef {import('../types').Connection} Connection
 *
 * @typedef {import('../types').InConnection} InConnection
 *
 * @typedef {import('../types').OutConnection} OutConnection
 *
 * @typedef {import('../types').QueryParams} QueryParams
 *
 * @typedef {import('../types').RouteMap} RouteMap
 *
 * @typedef {import('../types').Channel} Channel
 *
 * @typedef {import('../types').RouteDefinition} RouteDefinition
 */
const { dasherize } = Utils;

/**
 * The bridge instance.
 *
 * @type {BridgeAPI | null}
 */
export let $bridge = null;
/**
 * Queue of bridge commands due to delayed instance of bridge and premature execution of commands.
 *
 * @type {{ command: string; parameters: any }[]}
 */
let $queueCommands = [];

/**
 * Application´s Configuration object.
 *
 * @type {CellsConfig}
 */
let $config = {};

/**
 * Starts the bridge.
 *
 * @param {CellsConfig} config - The configuration object.
 */
export const startApp = function (config) {
  if (!$bridge) {
    $config = config;
    new Bridge(config);
  }
  return $bridge;
};

export const getConfig = function () {
  return $config;
};


/**
 * Enqueues a bridge command due to delayed instance of bridge and premature execution of commands.
 *
 * @param {string} command - The command to be enqueued.
 * @param {any[]} parameters - The parameters to be enqueued.
 */
export const enqueueCommand = function (command, parameters) {
  $queueCommands.push({ command, parameters });
};

/**
 * @deprecated Use {@link enqueueCommand} instead
 */
export const enqueCommand = enqueueCommand;

/**
 * Constants object containing various constant values.
 *
 * @typedef {Object} Constants
 * @property {string} externalEvents - The external events.
 * @property {string} externalEventsCodes - The external event codes.
 * @property {string} initialTemplate - The default initial template.
 * @property {string} pagesPath - The path to the pages.
 * @property {string} renderEngines - The render engines.
 */
const {
  externalEvents,
  externalEventsCodes,
  initialTemplate: DEFAULT_INITIAL_TEMPLATE,
  pagesPath: DEFAULT_PAGES_PATH,
  renderEngines,
} = Constants;

/** @type {Object<string, Channel>} */
const globalChannel = {};

/** Class representing the CellsBridge. */
export class Bridge {
  /**
   * Pages Cache
   *
   * Saves page definitions into localstorage.
   *
   * @type {Boolean}
   */
  cache = true;
  /**
   * PubSub Context
   *
   * 'global' => Notifies all components of all bridge instances. 'local' => Notifies components
   * created by the current bridge instance.
   *
   * @type {String}
   */
  channel = 'global';

  /**
   * Cross container node Id
   *
   * @type {String}
   */
  crossContainerId = '__cross';
  /**
   * Prints debug info
   *
   * @type {Boolean}
   */
  debug = true;
  /**
   * Proactive Cache. Loads future pages definition.
   *
   * @type {Boolean}
   */
  preCache = false;

  /**
   * Prefix for LocalStorage keys
   *
   * @type {String}
   */
  storagePrefix = `${BRIDGE_CHANNEL_PREFIX}-`;

  /**
   * Lib version.
   *
   * @type {string}
   */
  version = '__VERSION__';
  /**
   * Max number of views
   *
   * Keeps this number of template alive.
   *
   * @type {Number}
   */
  viewLimit = 1000;
  /**
   * The name of the initial template that gets rendered
   *
   * @type {String}
   */
  initialTemplate = DEFAULT_INITIAL_TEMPLATE;
  /**
   * The node where the template will be rendered
   *
   * @type {WCNode | null}
   */
  __mainNodeElement = null;

  /**
   * Events to expose
   *
   * @type {string[]}
   */
  externalEvents = externalEvents;

  /**
   * The path to the folder that contains the components that renders a route.
   *
   * @type {String}
   */
  pagesPath = DEFAULT_PAGES_PATH;

  /**
   * Listener for navigation requests.
   *
   * @type {(info: any) => void}
   */
  navRequestListener;

  /** @param {CellsConfig} config */
  constructor(config) {
    const { NAV_REQUEST, ROUTER_BACKSTEP } = externalEventsCodes;

    if (!config || typeof config !== 'object') {
      config = {};
    }

    Object.assign(this, config);

    /** @type {ComponentConnector} */
    this.ComponentConnector = new ComponentConnector();

    /** @type {TemplateManager} */
    this.TemplateManager = new TemplateManager(this);

    /** @type {Router} */
    this.Router = new Router();

    /** @type {BridgeChannelManager} */
    this.BridgeChannelManager = new BridgeChannelManager(this);

    /** @type {ActionChannelManager} */
    this.ActionChannelManager = new ActionChannelManager(this);

    /** @type {PostMessageManager} */
    this.PostMessageManager = new PostMessageManager(this);

    /** @type {ApplicationConfigManager} */
    this.ApplicationConfigManager = new ApplicationConfigManager(this);

    /** @type {ApplicationStateManager} */
    this.ApplicationStateManager = new ApplicationStateManager(this);

    if (this.channel === 'global') {
      // this.ComponentConnector.manager.channels = globalChannel;
      this.ComponentConnector.setChannels(globalChannel);
    }

    this.eventSubscriptions = config.eventSubscriptions;
    this.skipNavigations = config.skipNavigations;
    this.postMessageTargetOrigin = config.postMessageTargetOrigin;
    this.interceptor = config.interceptor;
    this.mainNode = config.mainNode;
    this.routes = config.routes;

    if (!this.mainNode) {
      console.warn('You should indicate the main node of your app');
    } else {
      this._plugExternalEvents();
    }

    this._initCrossComponents();

    if (this.interceptor && typeof this.interceptor === 'function') {
      this.Router.channelManager = this.BridgeChannelManager;
      this.Router.interceptor = this.interceptor;
    }

    if (this.debug) {
      $bridge = this;
      // @ts-ignore
      window.$bridge = $bridge;
    } else {
      $bridge = {
        // bridge
        logout: () => this.logout(),
        subscribeToEvent: (/** @type {string} */ eventName, /** @type {Function} */ callback) =>
          this.subscribeToEvent(eventName, callback),
        registerInConnection: (
          /** @type {string} */ channel,
          /** @type {WCNode} */ node,
          /** @type {Function} */ callback,
        ) => this.registerInConnection(channel, node, callback),
        unsubscribe: (/** @type {string | string[]} */ channels, /** @type {WCNode} */ node) =>
          this.unsubscribe(channels, node),
        registerOutConnection: (
          /** @type {string} */ channel,
          /** @type {WCNode} */ node,
          /** @type {string} */ bindName,
          /** @type {Connection} */ options,
        ) => this.registerOutConnection(channel, node, bindName, options),
        publish: (
          /** @type {string} */ channel,
          /** @type {any} */ value,
          /** @type {{ sessionStorage: boolean } | undefined} */ options,
        ) => this.publish(channel, value, options),
        updateSubroute: (/** @type {string} */ subroute) => this.updateSubroute(subroute),
        getCurrentRoute: () => this.getCurrentRoute(),
        navigate: (/** @type {string} */ page, /** @type {QueryParams} */ params) =>
          this.navigate(page, params),
        updateApplicationConfig: (
          /** @type {any} */ config,
          /** @type {{ sessionStorage: boolean }} */ options,
        ) => this.updateApplicationConfig(config, options),

        // router interceptor
        updateInterceptorContext: (/** @type {Object} */ ctx) => this.updateInterceptorContext(ctx),
        resetInterceptorContext: () => this.resetInterceptorContext(),
        getInterceptorContext: () => this.getInterceptorContext(),
        setInterceptorContext: (/** @type {Object} */ ctx) => this.setInterceptorContext(ctx),
      };
    }

    this.BridgeChannelManager.initAppContextChannel();
    this.BridgeChannelManager.getCancelledBackNavigationChannel();
    this.BridgeChannelManager.getInterceptedNavigationChannel();
    this.ActionChannelManager.subscribeAll();

    // Bridge is ready - execute queued bridge commands & load app config & state.
    this._executePendingBridgeQueue();
    this.ApplicationConfigManager.loadAppConfig();
    this.ApplicationStateManager.loadAppState();

    // 1. Listen for route changes
    // @TODO: Revisar este binding de un método de otro objeto a otro objeto
    this.Router.handler = () => this.routeHandler();
    if (Array.isArray(this.routes)) {
      this.routes = this._parseRoutes(this.routes);
    }
    this.Router.addRoutes(this.routes);
    this._initSkipNavigations();
    this.Router.start();

    this.navRequestListener = (/*@type {WCEvent }*/ info) => {
      if (this.Router.hashIsDirty) {
        window.location.hash = '#!';
      }
      let event = info.event;
      let navigationDetail = info.detail;
      let page = navigationDetail.page;
      let params = navigationDetail.params;
      let skipHistory = navigationDetail.skipHistory;
      let cleanUntil = navigationDetail.cleanUntil;
      let replace = navigationDetail.replace || false;
      /** @type {{ [key: string]: any }} */
      let p = {};

      if (!page && navigationDetail.paramPage && event.detail) {
        page = event.detail[navigationDetail.paramPage];
      }
      if (event.detail && params) {
        for (let param in params) {
          if (event.detail.hasOwnProperty(param)) {
            p[params[param]] = event.detail[param];
          }
        }
      }

      if (cleanUntil) {
        this.Router.clearStackUntil(cleanUntil);
      }

      this.Router.go(page, p, replace, skipHistory);
      Object.assign(this, config);
    };

    eventManager.on(NAV_REQUEST, this.navRequestListener);

    eventManager.on(ROUTER_BACKSTEP, this.handleBack);

    this.PostMessageManager.setupPostMessages();
  }

  /**
   * Updates the interceptor context.
   *
   * @param {Object} ctx - The interceptor context.
   */
  updateInterceptorContext(ctx) {
    this.Router.updateInterceptorContext(ctx);
  }

  /** Resets the interceptor context by setting it to an empty object. */
  resetInterceptorContext() {
    this.Router.setInterceptorContext({});
  }

  /**
   * Returns the interceptor context.
   *
   * @returns {Object} The interceptor context.
   */
  getInterceptorContext() {
    return this.Router.getInterceptorContext();
  }

  /**
   * Sets the interceptor context.
   *
   * @param {Object} ctx - The interceptor context.
   */
  setInterceptorContext(ctx) {
    this.Router.setInterceptorContext(ctx);
  }

  /**
   * Performs the go back action. This method is overriden by the CellsNativeBridge
   *
   * @returns {NavigationWithParams} The executed navigation, an object with properties:
   */
  goBack() {
    return this.Router.back();
  }

  /**
   * This method is executed when the event router-backstep is fired. It calls the hook method for
   * handling backward navigations and if that method allows the continuation, it does the
   * navegation. Otherwise it will cancel the navigation and publish the response in the channel
   * [BRIDGE_CHANNEL_PREFIX]_cancelled_back_navigation.
   */
  handleBack() {
    this.goBack();
  }

  /**
   * Execute queued bridge commands due to delayed instance of bridge and premature execution of
   * commands.
   */
  _executePendingBridgeQueue() {
    /** @type {{ command: string; parameters: any }[]} */
    let cellsBridgeQueue;
    cellsBridgeQueue = $queueCommands;
    if (Array.isArray(cellsBridgeQueue)) {
      cellsBridgeQueue.forEach(({ command, parameters }) => {
        const queuedCommand = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), command);

        if (!queuedCommand) {
          console.log(`WARNING: Invalid cells bridge command execution: ${command} (QUEUE).`);
          return;
        }
        /** @type {Function} */
        const queuedCommandFunction = queuedCommand.value;

        console.log(`Executing queued command ${command}.`);
        queuedCommandFunction.apply(this, parameters);
      });
      $queueCommands = [];
    }
  }

  /**
   * Initializes the skip navigations feature. If there are skip navigations defined, it sets the
   * skipHistory property to true for each skip navigation and adds them to the Router's skip
   * navigations list.
   */
  _initSkipNavigations() {
    if (this.skipNavigations && this.skipNavigations.length > 0) {
      for (let i = 0; i < this.skipNavigations.length; i++) {
        this.skipNavigations[i].skipHistory = true;
      }
      this.Router.addSkipNavigations(this.skipNavigations);
    }
  }

  /**
   * Dispatches a custom event with the given name and payload.
   *
   * @param {string} name - The name of the event.
   * @param {any} payload - The payload to be attached to the event.
   * @throws {Error} If the defined main node does not exist.
   */
  _dispatchEvent(name, payload) {
    const mainNode = this.getMainNode();
    if (!mainNode) {
      throw new Error('The defined main node does not exist');
    }
    const event = payload ? new CustomEvent(name, { detail: payload }) : new CustomEvent(name);

    mainNode.dispatchEvent(event);
  }

  /** Plugs external events to the main node. */
  _plugExternalEvents() {
    let len = this.externalEvents.length;
    let mainNode = this.getMainNode();

    if (mainNode) {
      for (let i = 0; i < len; i++) {
        const eventName = this.externalEvents[i];

        eventManager.on(eventName, (/** @type {Function} */ data) => {
          this._dispatchEvent(eventName, data);
        });
      }
      this._initEventChannels();
    } else {
      console.warn('The defined main node does not exist');
    }
  }

  /** Initializes the event channels for the bridge. */
  _initEventChannels() {
    let mainNode = this.getMainNode();
    this.BridgeChannelManager.initEventChannels(mainNode, this.externalEvents);
    this._addInitialSubscribersToEvents();
  }

  /** Adds initial subscribers to events. If there are event subscriptions, it subscribes to them. */
  _addInitialSubscribersToEvents() {
    if (this.eventSubscriptions && this.eventSubscriptions.length > 0) {
      this._subscribeToEvents(this.eventSubscriptions);
    }
  }

  /**
   * Subscribes to multiple events.
   *
   * @param {Object[]} eventSubscriptions - An array of event subscriptions.
   * @param {string} eventSubscriptions[].event - The event to subscribe to.
   * @param {Function} eventSubscriptions[].callback - The callback function to be executed when the
   *   event is triggered.
   */
  _subscribeToEvents(eventSubscriptions) {
    eventSubscriptions.forEach(subscription => {
      const { event, callback } = subscription;

      this.subscribeToEvent(event, callback);
    });
  }

  /**
   * Initialization of cross components container. Check if cross component container exists.
   * Otherwise, it will be created.
   */
  _initCrossComponents() {
    const crossContainerTemplateId = this.TemplateManager.computeTemplateId(this.crossContainerId);
    let crossContainer = this.TemplateManager.get(crossContainerTemplateId);
    const crossContainerElement = document.getElementById(crossContainerTemplateId);

    // no cross container registered on memory
    if (!crossContainer) {
      if (!crossContainerElement) {
        // no html element for cross container, we build it from scratch
        crossContainer = this.TemplateManager.createTemplate(this.crossContainerId, {
          tagName: 'div',
        });
        document.body.appendChild(crossContainer.node);
      } else {
        // html element found. we register it
        this.usingDeclarativeCrossContainer = true;
        this.TemplateManager.createTemplate(this.crossContainerId, {
          node: crossContainerElement,
        });
      }
    }
  }

  /**
   * Determines if the given zone is inside a layout.
   *
   * @param {string} zone - The zone to check.
   * @returns {boolean} - True if the zone is inside a layout, false otherwise.
   */
  _insideLayout(zone) {
    return zone != undefined && zone.split('.').length === 2;
  }

  /**
   * Creates a page from a web component.
   *
   * @param {string} name - The name of the route.
   * @param {string | undefined} componentRoute - The name of the web component.
   * @returns {Promise<void>} A promise that resolves when the page is created.
   */
  createPageFromWebComponent(name, componentRoute) {
    const componentName = componentRoute || `${name}-page`;
    const component = this.TemplateManager.getNode(componentName);

    this.BridgeChannelManager.getPrivate(name);

    const isUnresolved = (/** @type {TemplateNode} */ node) => {
      const isCustomElement = node.tagName.includes('-');
      const resolved = !!window.customElements.get(node.tagName.toLowerCase());
      // const resolved = node.updateComplete instanceof Promise && typeof node.render === 'function';

      return isCustomElement && !resolved;
    };

    if (!component) {
      const template = this.TemplateManager.createTemplate(name, {
        tagName: componentName,
      });

      if (isUnresolved(template.node)) {
        if (this.loadCellsPage) {
          // (loadCellsPage) Guard for compatibilty with Cells CLI<3.2
          return this.loadCellsPage(name);
        }
      }
    }
    return Promise.resolve();
  }

  /**
   * Id for template node
   *
   * @param {String} name Template name
   * @returns {String}
   */
  computeTemplateId(name) {
    return 'cells-template-' + name.replace(/\./g, '-');
  }

  /** Prints debug information about the bridge. */
  printDebugInfo() {
    const getColor = function (/** @type {any} */ option, /** @type {string} */ color) {
      const hexColor = option ? color : '#b0bec5';
      return `background:${hexColor}; color:#fff; padding:2px 4px; margin-right: 5px;`;
    };
    console.log(
      `%cbridge version: ${this.version} %ccache: ${this.cache}`,
      getColor(this.version, '#003f8d'),
      getColor(this.cache, '#0093e2'),
    );
  }

  /** Handles the routing logic and updates the page accordingly. */
  routeHandler() {
    const { PARSE_ROUTE } = externalEventsCodes;
    const route = this.Router.currentRoute;

    eventManager.emit(PARSE_ROUTE, route);

    // 2. Load a new page when route changes
    this._handleRouteLoading(route);

    // 3. Publish URL params to global params.
    for (let param in route.params) {
      // let eventData = {
      //   detail: {
      //     value: route.params[param],
      //   },
      //   type: dasherize(param) + '-changed',
      // };

      // this.ComponentConnector.manager.get(param).next(eventData);
      const evt = eventManager.createEvent(dasherize(param) + '-changed', route.params[param]);
      this.ComponentConnector.getChannel(param).next(evt);
    }
  }

  /**
   * Handles the loading of a route.
   *
   * @param {Route} route - The route object.
   */
  _handleRouteLoading(route) {
    this.createPageFromWebComponent(route.name, route.component).then(() =>
      this.selectPage(route.name, route.params),
    );
  }

  // this function MAY BE OVERRIDDEN by native bridge - not required due to internal router updating the context
  /**
   * Updates the bridge channels based on the previous and current templates.
   *
   * @param {Template} previousTemplate - The previous template object.
   * @param {Template} currentTemplate - The current template object.
   */
  _updateChannels(previousTemplate, currentTemplate) {
    if (this.BridgeChannelManager) {
      const oldName = previousTemplate ? previousTemplate.name : undefined;
      const ctx = this.getInterceptorContext();
      const currentRoute = this.getCurrentRoute();
      this.BridgeChannelManager.updateBridgeChannels(
        oldName,
        currentTemplate.name,
        ctx,
        currentRoute,
      );
    }
  }

  /**
   * Registers a connection in the bridge.
   *
   * @param {string} channelName - The name of the channel.
   * @param {WCNode} node - The node to be connected.
   * @param {Binding} callback - The callback function to be executed when a message is received on
   *   the channel.
   */
  registerInConnection(channelName, node, callback) {
    this.ComponentConnector.addSubscription(channelName, node, callback);
  }

  /**
   * Registers an outgoing connection.
   *
   * @param {string} channelName - The name of the channel.
   * @param {WCNode} htmlElement - The HTML element to bind the connection to.
   * @param {string} bindName - The name of the binding.
   * @param {Connection | undefined} extraParameters - Any extra parameters to pass to the
   *   connection.
   */
  registerOutConnection(channelName, htmlElement, bindName, extraParameters) {
    this.ComponentConnector.addPublication(channelName, htmlElement, bindName, extraParameters);
  }

  /**
   * Unsubscribes a node from the specified channels.
   *
   * @param {string | string[]} channels - The channels to unsubscribe from.
   * @param {WCNode} node - The node to unsubscribe.
   */
  unsubscribe(channels, node) {
    this.ComponentConnector.unsubscribe(channels, node);
  }

  /**
   * Publishes a value to a channel.
   *
   * @param {string} channelName - The name of the channel.
   * @param {any} value - The value to be published.
   * @param {Object} options - Optional parameters.
   * @param {boolean} options.sessionStorage - Indicates whether to save the app state in session
   *   storage.
   */
  publish(channelName, value, { sessionStorage } = { sessionStorage: false }) {
    this.ComponentConnector.publish(channelName, value);

    if (sessionStorage === true) {
      this.ApplicationStateManager.saveAppState(channelName, value);
    }
  }

  /**
   * Updates the application configuration and optionally saves it to session storage.
   *
   * @param {object} config - The new application configuration.
   * @param {object} [options] - Optional parameters.
   * @param {boolean} [options.sessionStorage] - Indicates whether to save the configuration to
   *   session storage.
   */
  updateApplicationConfig(config, { sessionStorage } = {}) {
    const CONFIG_CHANNEL_NAME = `${BRIDGE_CHANNEL_PREFIX}_ch_config`;

    this.publish(CONFIG_CHANNEL_NAME, config);

    if (sessionStorage === true) {
      this.ApplicationConfigManager.saveAppConfig(config);
    }
  }

  /**
   * Updates the subroute in the browser.
   *
   * @param {string} subroute - The new subroute to update.
   */
  updateSubroute(subroute) {
    this.Router.updateSubrouteInBrowser(subroute);
  }

  /**
   * Returns the current route information.
   *
   * @returns {RouteData} The current route object containing the name, params, query, subroute, and
   *   hashPath.
   */
  getCurrentRoute() {
    const { name, params, query, subroute } = this.Router.currentRoute;
    return {
      name,
      params,
      query,
      subroute,
      hashPath: this.Router._getHashPath(),
    };
  }

  /**
   * Navega a una página específica.
   *
   * @param {string} page - La página a la que se desea navegar.
   * @param {QueryParams} params - Los parámetros opcionales para la página.
   */
  navigate(page, params) {
    this.Router.go(page, params);
  }

  /** Performs a back step in the router. */
  backStep() {
    const { ROUTER_BACKSTEP } = externalEventsCodes;

    eventManager.emit(ROUTER_BACKSTEP, {
      event: {},
      detail: {},
    });
  }

  /**
   * Waits for the rendering of the template to complete.
   *
   * @param {Template} template - The template to wait for rendering completion.
   * @returns {Promise<boolean>} - A promise that resolves when the rendering is complete.
   */
  _waitRenderComplete(template) {
    return template.node.updateComplete || Promise.resolve(true);
  }

  /**
   * Selects a page and performs necessary operations.
   *
   * @param {string} name - The name of the page to select.
   * @param {QueryParams} params - The parameters to pass to the selected page.
   * @returns {void}
   */
  selectPage(name, params) {
    const { TEMPLATE_REGISTERED } = externalEventsCodes;
    const template = this.TemplateManager.get(name);
    const currentTemplate = this.TemplateManager.get(this.TemplateManager.selected);
    const oldTemplateName = currentTemplate ? currentTemplate.name : undefined;

    if (this.onRender) {
      this.onRender(template.node);
    }

    (async () => {
      await this._waitRenderComplete(template);
      this._handleParams(template.node, params);
      const ctx = this.getInterceptorContext();
      const currentRoute = this.getCurrentRoute();
      this.TemplateManager.select(name);

      if (this.BridgeChannelManager) {
        this.BridgeChannelManager.updateBridgeChannels(oldTemplateName, name, ctx, currentRoute);
      }

      eventManager.emit(TEMPLATE_REGISTERED, { template: name });
    })();
  }

  /**
   * Handles the parameters for a given node.
   *
   * @param {IndexableHTMLElement} node - The node to handle the parameters for.
   * @param {QueryParams} params - The parameters to bind to the node.
   */
  _handleParams(node, params) {
    const shouldBindParams = node['params'] && Object.keys(params).length > 0;

    if (shouldBindParams) {
      node['params'] = params;
    }
  }

  /**
   * It subscribe the main node to an event channel.
   *
   * @param {string} eventName Is the name of the event to subscribe
   * @param {Function} callback Is the function to call when the event channel is activated with a
   *   new value
   */
  subscribeToEvent(eventName, callback) {
    if (this.externalEvents.indexOf(eventName) < 0) {
      console.warn('Trying to subscribe to a non existing event: ', eventName);
      return;
    }
    if (typeof callback !== 'function') {
      console.warn('You must provide a function callback to subscribe to the event: ', eventName);
      return;
    }
    let mainNode = this.getMainNode();
    this.BridgeChannelManager.subscribeToEvent(mainNode, eventName, callback);
  }

  /**
   * Retrieves the main node element.
   *
   * @returns {WCNode} The main node element.
   */
  getMainNode() {
    if (!this.__mainNodeElement) {
      this.__mainNodeElement = document.querySelector('#' + this.mainNode);
    }
    if (!this.__mainNodeElement) {
      throw new Error('The defined main node does not exist');
    }
    return this.__mainNodeElement;
  }

  /**
   * Disconnects cross components by unregistering the components from the ComponentConnector.
   *
   * @param {{ inConnections: InConnection[]; outConnections: OutConnection[] }} connections - The
   *   connections object containing inConnections and outConnections.
   * @param {boolean} cleanPrivateChannels - Indicates whether to clean private channels during
   *   unregistering.
   */
  _disconnectCrossComponents({ inConnections, outConnections }, cleanPrivateChannels) {
    inConnections?.forEach((/** @type {InConnection} */ cnx) => {
      this.ComponentConnector.unregisterComponent(cnx.component, cleanPrivateChannels);
    });
    outConnections?.forEach((/** @type {OutConnection} */ cnx) => {
      this.ComponentConnector.unregisterComponent(cnx.component, cleanPrivateChannels);
    });
  }

  /**
   * Reconnects the cross components by registering the input and output connections.
   *
   * @param {{ inConnections: InConnection[]; outConnections: OutConnection[] }} connections - The
   *   connections object containing the input and output connections.
   */
  _reconnectCrossComponents({ inConnections, outConnections }) {
    inConnections?.forEach((/** @type {InConnection} */ cnx) => {
      this.registerInConnection(cnx.channel, cnx.component, cnx.bind);
    });
    outConnections?.forEach((/** @type {OutConnection} */ cnx) => {
      this.registerOutConnection(cnx.channel, cnx.component, cnx.bind, cnx.options);
    });
  }

  /** Cleans up the dynamic cross components by removing them from the DOM and clearing the register. */
  _cleanDynamicCrossComponents() {}

  /** Resets the bridge channels and performs necessary cleanup operations. */
  _resetBridgeChannels() {
    const cleanPrivateChannels = true;
    const crossContainerTemplateId = this.TemplateManager.computeTemplateId(this.crossContainerId);
    const crossComponentsConnections =
      this.BridgeChannelManager.getCCSubscriptions(
        crossContainerTemplateId,
        this.getMainNode().id,
      ) || {};

    this._disconnectCrossComponents(crossComponentsConnections, cleanPrivateChannels);
    this.BridgeChannelManager.resetBridgeChannels(this.getMainNode(), cleanPrivateChannels);
    this._cleanDynamicCrossComponents();
    this._reconnectCrossComponents(crossComponentsConnections);
  }

  /**
   * Performs a logout action. It resets all channels, removes templates from DOM and redirects to
   * the initial page
   */
  logout() {
    if (this.TemplateManager.selected === this.initialTemplate) {
      return;
    }

    // clean up current page
    this.BridgeChannelManager.publishPrivatePageStatus(this.TemplateManager.selected, false);

    this._resetBridgeChannels();

    if (!this.usingDeclarativeCrossContainer) {
      this.TemplateManager.removeTemplateChildrens(this.crossContainerId);
    }
    this.TemplateManager.removeTemplates('', this.crossContainerId);

    this.ActionChannelManager.subscribeAll();
    this._addInitialSubscribersToEvents();

    this.resetInterceptorContext();

    this.Router.init();
    this.Router.go(this.initialTemplate);
  }

  /**
   * Renders the template and appends it to the main node. If fixed is provided, it appends the
   * fixed components to their respective zones.
   *
   * @param {WCNode} template - The template to be rendered.
   */
  onRender(template) {
    if (!template.parentNode && this.mainNode) {
      document.getElementById(this.mainNode)?.appendChild(template);
      const componentsInTemplateLoaded = new CustomEvent('componentsInTemplateLoaded');
      document.body.dispatchEvent(componentsInTemplateLoaded);
    }
  }

  /**
   * Loads the specified cells page.
   *
   * @param {string} page - The page to load.
   * @returns {any} - The result of the page action.
   */
  loadCellsPage(page) {
    const route = this.Router.routes[page];
    return route.action();
  }

  /**
   * Parses an array of routes and returns an object with route names as keys and corresponding path
   * and action as values.
   *
   * @param {RouteDefinition[]} routesArray - The array of routes to be parsed.
   * @returns {ParsedRoute} - The parsed routes object.
   */
  _parseRoutes(routesArray) {
    /** @type {ParsedRoute} */
    const routesObject = {};
    routesArray.forEach((/** @type {RouteDefinition} */ route) => {
      const { name, path, action, notFound, component } = route;
      routesObject[name] = { path, action, notFound: Boolean(notFound), component };
    });
    return routesObject;
  }
}
