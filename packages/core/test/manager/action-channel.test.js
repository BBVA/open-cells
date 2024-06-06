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
import { ActionChannelManager } from '../../src/manager/action-channels.js';
import { Bridge } from '../../src/bridge.js';

describe('ActionChannelManager', () => {
  let bridge;
  let actionChannelManager;

  beforeEach(() => {
    bridge = sinon.createStubInstance(Bridge);
    actionChannelManager = new ActionChannelManager(bridge);
  });

  it('should be created', () => {
    expect(actionChannelManager).to.be.an.instanceOf(ActionChannelManager);
  });

  it('should have a bridge property', () => {
    expect(actionChannelManager).to.have.property('bridge');
  });

  it('should have a ChannelManager property', () => {
    expect(actionChannelManager).to.have.property('ChannelManager');
  });

  it('should have a TemplateManager property', () => {
    expect(actionChannelManager).to.have.property('TemplateManager');
  });

  describe('updateProperty', () => {
    it('should update a property of the bridge object', () => {
      actionChannelManager.updateProperty('testProp', 'testValue');
      expect(bridge.testProp).to.equal('testValue');
    });

    it('should not update a function property of the bridge object', () => {
      bridge.testFunction = () => {};
      actionChannelManager.updateProperty('testFunction', 'testValue');
      expect(bridge.testFunction).to.be.a('function');
    });
  });

  // Continúa con las pruebas para los demás métodos...
});
