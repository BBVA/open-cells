import { NavigationWithParams } from './navigation-stack';
import { Navigation } from './navigation-stack';

export { Bridge } from '../src/bridge';

export type BridgeAPI = {
  logout: Function;
  subscribeToEvent: Function;
  registerInConnection: Function;
  unsubscribe: Function;
  registerOutConnection: Function;
  publish: Function;
  updateSubroute: Function;
  getCurrentRoute: Function;
  navigate: Function;
  updateApplicationConfig: Function;
  updateInterceptorContext: Function;
  resetInterceptorContext: Function;
  getInterceptorContext: Function;
  setInterceptorContext: Function;
};

export type EventSubscription = { event: string; callback: Function };

export type CellsConfig = {
  mainNode: string;
  postMessageTargetOrigin?: string;
  eventSubscriptions?: EventSubscription[];
  interceptor?: InterceptorFunction;
  skipNavigations?: Navigation[];
  routes?: RouteDefinition[];
  viewLimit?: number;
  persistentPages?: string[];
  initialTemplate?: string;
  appConfig?: Record<string, any>;
  commonPages?: string[];
};

export type RouteDefinition = {
  name: string;
  path: string;
  action: Function;
  notFound?: boolean;
  component: string;
};

export type ParsedRoute = {
  [name: string]: {
    path: string;
    action: Function;
    notFound: boolean;
    component: string;
  };
};

export type RouteMap = {
  [name: string]:
    | {
        path: string;
        action: Function;
      }
    | { path: string; action: Function }[];
};

export type InterceptorFunction = (
  navigation: NavigationWithParams,
  ctx: object,
) => { intercept: boolean; redirect: string };
