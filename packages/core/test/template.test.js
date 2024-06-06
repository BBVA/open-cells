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

import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { Template } from '../src/template.js';

describe('Template', () => {
  let template;
  let spec;

  beforeEach(() => {
    spec = { tagName: 'div' };
    template = new Template(spec);
  });

  it('should create a new Template instance', () => {
    expect(template).to.exist;
    expect(template.node.tagName).to.equal('DIV');
  });

  it('should throw an error if no node or tagName is provided', () => {
    expect(() => new Template({})).to.throw('Template must have a node or a tagName');
  });

  it('should get the zone node in the template', () => {
    const zone = document.createElement('div');
    zone.id = 'test';
    template.node.appendChild(zone);
    expect(template.getZone('test')).to.equal(zone);
  });

  it('should set the attribute cache in the template node to cached', () => {
    template.cache();
    expect(template.node.getAttribute('state')).to.equal('cached');
  });

  it('should set the attribute cache in the template node to active', () => {
    template.activate();
    expect(template.node.getAttribute('state')).to.equal('active');
  });

  it('should set the attribute cache in the template node to inactive', () => {
    template.deactivate();
    expect(template.node.getAttribute('state')).to.equal('inactive');
  });

  it('should set given value to corresponding attribute name of current template', () => {
    template._setAttribute('test', 'value');
    expect(template.node.getAttribute('test')).to.equal('value');
  });

  it('should get given attribute value from the current template', () => {
    template.node.setAttribute('test', 'value');
    expect(template._getAttribute('test')).to.equal('value');
  });

  it('should return current template based on node type', () => {
    const node = template._getTemplate(template.node);
    expect(node).to.equal(template.node);
  });

  it('should configure the Template with the provided configuration', () => {
    const config = {
      name: 'test',
      template: { id: 'templateId', name: 'templateName' },
    };
    template.config(config);
    expect(template.name).to.equal('test');
    expect(template.node.id).to.equal('templateId');
    expect(template.node.name).to.equal('templateName');
  });
});
