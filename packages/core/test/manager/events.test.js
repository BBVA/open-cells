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
import { eventManager } from '../../src/manager/events.js';

describe('CustomEventEmitter', () => {
  let nodeStub;

  beforeEach(() => {
    nodeStub = { addEventListener: sinon.stub(), removeEventListener: sinon.stub() };
  });

  it('should listen to an event on a given node and execute the callback function once', () => {
    const callback = sinon.stub();
    eventManager.listenToOnce(nodeStub, 'testEvent', callback);
    const cb = nodeStub.addEventListener.firstCall.args[1];
    cb({ currentTarget: nodeStub, type: 'testEvent' });
    expect(callback.calledOnce).to.be.true;
    expect(nodeStub.removeEventListener.calledWith('testEvent', cb)).to.be.true;
  });

  it('should create an event', () => {
    const event = eventManager.createEvent('testEvent', 'testValue');
    expect(event).to.be.instanceOf(Event);
    expect(event.detail).to.deep.equal({ value: 'testValue' });
  });
});
