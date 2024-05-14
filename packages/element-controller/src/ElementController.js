import { $bridge, enqueueCommand } from '@open-cells/core';

function __callBridge(...args) {
  const [command, ...parameters] = args;
  let result;

  // cells is ready
  if ($bridge) {
    if (!$bridge[command]) {
      throw new Error(`WARNING: Invalid cells bridge command execution: ${command}.`);
    }

    result = $bridge[command](...parameters);
    return result;
  }

  enqueueCommand(command, parameters);
  return result;
}

export class ElementController {
  constructor(host) {
    (this.host = host).addController(this);
  }

  subscribe(channelName, callback) {
    __callBridge('registerInConnection', channelName, this.host, callback);
  }

  unsubscribe(channels) {
    __callBridge('unsubscribe', channels, this.host);
  }

  publish(channelName, value, options = {}) {
    __callBridge('publish', channelName, value, options);
  }

  publishOn(channelName, htmlElement, eventName) {
    __callBridge('registerOutConnection', channelName, htmlElement, eventName);
  }

  navigate(page, params) {
    __callBridge('navigate', page, params);
  }

  updateInterceptorContext(ctx) {
    __callBridge('updateInterceptorContext', ctx);
  }

  resetInterceptorContext() {
    __callBridge('resetInterceptorContext');
  }

  getInterceptorContext() {
    return __callBridge('getInterceptorContext');
  }

  setInterceptorContext(ctx) {
    __callBridge('setInterceptorContext', ctx);
  }

  getCurrentRoute() {
    __callBridge('getCurrentRoute');
  }

  updateSubroute(subroute) {
    __callBridge('updateSubroute', subroute);
  }

  backStep() {
    __callBridge('backStep');
  }
}
