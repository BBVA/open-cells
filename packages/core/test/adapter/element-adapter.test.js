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
import { ElementAdapter } from '../../src/adapter/element-adapter.js';

describe('ElementAdapter', () => {
  let elementAdapter;
  let mockComponentConnector;
  let mockNode;
  let mockEvent;

  beforeEach(() => {
    mockComponentConnector = sinon.stub();
    mockNode = sinon.stub();
    mockEvent = sinon.stub();
    elementAdapter = new ElementAdapter(mockComponentConnector);
  });

  describe('#isEventAtTarget', () => {
    it('should check if the event has reached the node that is listening the event', () => {
      const result = elementAdapter.isEventAtTarget(mockEvent);
      expect(result).to.exist;
    });
  });

  describe('#dispatchActionFunction', () => {
    it('should dispatch an action function', () => {
      const mockMethod = sinon.stub();
      elementAdapter.dispatchActionFunction(mockEvent, mockNode, mockMethod);
      expect(mockMethod.called).to.be.true;
    });
  });
});
