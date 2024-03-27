import { Observable } from "rxjs";

import { Binding } from './state/subscriptor';

export { ComponentConnector } from "../src/component-connector";

export type Component = {
  spec: {
    render: string;
  };
};

export interface IndexableHTMLElement extends HTMLElement {
  [index: string]: any;
}

export interface VNode extends IndexableHTMLElement {
  is?: string;
  ids?: { [index: string]: string };
  intervals: { [index: string]: number };
  name?: string;
  tagNode?: string;
  render?: Function;
  updateComplete?: Promise<boolean>;
}

// export interface WCNode extends IndexableHTMLElement {
//   is: string;
//   ids: { [index: string]: string };
//   intervals: { [index: string]: number };
//   name?: string;
//   tagNode: string;
//   render: Function;
//   updateComplete: Promise<boolean>;
// }

export interface WCNode extends IndexableHTMLElement {
  is?: string;
  name?: string;
  tagNode?: string;
  render?: Function;
  updateComplete?: Promise<boolean>;
}

export interface Connection {
  analytics?: string;
  backStep?: string;
  link?: { page?: { bind: string}, cleanUntil?: { bind: string}};
  log?: string;
  channel: string;
  bind?: Binding;
  component: WCNode;
  options?: { [index: string]: any },
}

export interface InConnection {
  channel: string;
  component: WCNode;
  bind: Binding;
}

export interface OutConnection {
  channel: string;
  component: WCNode;
  bind: string;
  options: Connection | undefined;
}

export type CCSubscriptions = { 
  inConnections: InConnection[]; 
  outConnections: OutConnection[];
}

// export  interface WCObservable extends Observable<PublishableValue> {
//   node?: WCNode;
//   eventName?: string;
//   channelName?: string;
//   options?: Connection
// }