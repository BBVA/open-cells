const externalEventsCodes = {
  PARSE_ROUTE: 'parse-route',
  AFTER_PUBLISH: 'after-publish',
  NAV_REQUEST: 'nav-request',
  TEMPLATE_TRANSITION_END: 'template-transition-end',
  TRACK_EVENT: 'track-event',
  TEMPLATE_REGISTERED: 'template-registered',
  ROUTER_BACKSTEP: 'router-backstep',
  LOG_EVENT: 'log-event',
};

const externalEvents = Object.values(externalEventsCodes);

// initialTemplate

const initialTemplate = 'login';

// pagesPath

const pagesPath = './pages/';

// render engines

const renderEngines = {
  LIT_ELEMENT: 'litElement',
};

export const BRIDGE_CHANNEL_PREFIX = '__oc';

export const Constants = {
  bridgeChannelPrefix: BRIDGE_CHANNEL_PREFIX,
  externalEvents,
  externalEventsCodes,
  initialTemplate,
  pagesPath,
  renderEngines,
};
