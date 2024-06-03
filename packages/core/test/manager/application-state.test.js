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
import { ApplicationStateManager } from '../../src/manager/application-state.js';
import { ComponentConnector } from '../../src/component-connector.js';
import { CellsStorage } from '../../src/manager/storage.js';

describe('ApplicationStateManager', () => {
  let applicationStateManager;
  let componentConnectorStub;
  let storageStub;

  beforeEach(() => {
    componentConnectorStub = sinon.createStubInstance(ComponentConnector);
    storageStub = sinon.createStubInstance(CellsStorage);
    sinon.stub(ApplicationStateManager.prototype, '_getAppStateStorage').returns(storageStub);
    applicationStateManager = new ApplicationStateManager({
      ComponentConnector: componentConnectorStub,
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create an instance of ApplicationStateManager', () => {
    expect(applicationStateManager).to.be.instanceOf(ApplicationStateManager);
  });

  it('should save the application state for a specific channel', () => {
    const state = {};
    storageStub.getItem.returns(state);
    applicationStateManager.saveAppState('testChannel', 'testValue');
    expect(state['testChannel']).to.equal('testValue');
    expect(storageStub.setItem.calledWith('state', state)).to.be.true;
  });

  it('should not save the application state if it does not exist', () => {
    storageStub.getItem.returns(null);
    applicationStateManager.saveAppState('testChannel', 'testValue');
    expect(storageStub.setItem.called).to.be.false;
  });

  it('should load the application state and publish it to the corresponding channels', () => {
    const state = { testChannel: 'testValue' };
    storageStub.getItem.returns(state);
    applicationStateManager.loadAppState();
    expect(componentConnectorStub.publish.calledWith('testChannel', 'testValue')).to.be.true;
  });

  it('should not load the application state if it does not exist', () => {
    storageStub.getItem.returns(null);
    applicationStateManager.loadAppState();
    expect(componentConnectorStub.publish.called).to.be.false;
  });
});
