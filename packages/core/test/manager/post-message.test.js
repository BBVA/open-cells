import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { PostMessageManager } from '../../src/manager/post-message.js';

describe('PostMessageManager', () => {
  let postMessageManager;
  let bridgeStub;

  beforeEach(() => {
    bridgeStub = {
      postMessageTargetOrigin: 'http://example.com',
      ComponentConnector: { createEvent: sinon.stub() },
      BridgeChannelManager: {
        getPostMessageChannel: sinon.stub(),
        getBridgeChannel: sinon.stub().returns({ subscribe: sinon.stub() }),
      },
    };
    postMessageManager = new PostMessageManager(bridgeStub);
  });

  it('should create an instance of PostMessageManager', () => {
    expect(postMessageManager).to.be.instanceOf(PostMessageManager);
  });

  it('should setup post messages if enabled', () => {
    const addEventListenerStub = sinon.stub(window, 'addEventListener');
    postMessageManager.setupPostMessages();
    expect(addEventListenerStub.calledOnce).to.be.true;
    addEventListenerStub.restore();
  });

  it('should send a post message to the parent window', () => {
    const postMessageStub = sinon.stub(window.parent, 'postMessage');
    postMessageManager._sendPostMessage({ event: 'testEvent', detail: 'testDetail' });
    expect(postMessageStub.calledOnce).to.be.true;
    postMessageStub.restore();
  });
});
