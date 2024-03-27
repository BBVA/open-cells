import { WCNode } from '../component-connector';

export type TemplateManagerConfig = {  
  persistentPages? : string[],
  viewLimit? : number
};

export type TemplateConfig = {
  name: string,
  template: {
    id: string,
    name: string
  }
};

export type TemplateSpec = {
  node?: TemplateNode,
  tagName?: string
};

export type TemplateNode = WCNode;

export { TemplateManager } from '../../src/manager/template';