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

export interface TemplateManager {

  cache: { [key: string]: Template };

  templates: { [key: string]: TemplateNode };

  selected: string;

  locations: string[];

  size: number;

  constructor(config?: TemplateManagerConfig): TemplateManager;

  createTemplate(name: string, spec: TemplateSpec): Template;

  get(name: string): Template | undefined;

  getNode(name: string): TemplateNode | undefined;

  select(name: string): void;

  removeTemplate(templateName: string): void;

  removeTemplates(initialTemplate: string, crossContainerId: string): void;

  removeTemplateChildrens(templateName: string): void;

}

export interface Template {

  type: string;

  constructor(spec: TemplateSpec): Template;

  getZone(zoneId: string): TemplateNode;

  cache(): void;

  activate(): void;

  deactivate(): void;

  config(config: TemplateConfig): void;
}



