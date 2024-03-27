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
