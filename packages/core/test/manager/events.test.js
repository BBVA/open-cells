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
