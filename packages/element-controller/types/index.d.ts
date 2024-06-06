import { CoreAPI } from '@open-cells/core-plugin/types';

export declare class ElementController implements CoreAPI {
  constructor(host: any);
  subscribe: (channelName: string, callback: Function) => void;
  unsubscribe: (channels: string | string[]) => void;
  publish: (channelName: string, value: any, options?: Object) => void;
  publishOn: (channelName: string, htmlElement: HTMLElement, eventName: string) => void;
  navigate: (page: string, params?: Object) => void;
  updateInterceptorContext: (ctx: Object) => void;
  resetInterceptorContext: () => void;
  getInterceptorContext: () => Object;
  setInterceptorContext: (ctx: Object) => void;
  getCurrentRoute: () => RouteData;
  updateSubroute: (subroute: string) => void;
  backStep: () => void;
}
