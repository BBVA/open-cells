/*
 * Copyright 2024 Bilbao Vizcaya Argentaria, S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Binding } from './state/subscriptor';

export type Component = {
  spec: {
    render: string;
  };
};

export interface ComponentConnector {
  connect: (component: WCNode, connections: Connection[]) => void;
  disconnect: (component: WCNode) => void;
  update: (component: WCNode, connections: Connection[]) => void;
}

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