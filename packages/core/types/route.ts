import { QueryParams } from './navigation-stack';

export { Route } from '../src/route';

export type RouteData = {
  name: string;
  params: QueryParams;
  query: any
  subroute: string|undefined;
  hashPath: string;
}