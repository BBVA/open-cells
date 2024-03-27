import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { BridgeChannelManager } from '../../src/manager/bridge-channels.js';
import { Channel } from '../../src/state/channel.js';
import { Observable } from 'rxjs';

describe('BridgeChannelManager', () => {
  let bridge;
  let bridgeChannelManager;
  let channelStub;
  let observableStub;

  beforeEach(() => {
    bridge = { ComponentConnector: { getChannel: sinon.stub() } };
    channelStub = sinon.createStubInstance(Channel);
    observableStub = sinon.createStubInstance(Observable);
    bridge.ComponentConnector.getChannel.returns(channelStub);
    bridgeChannelManager = new BridgeChannelManager(bridge);
  });

  it('should get a bridge channel', () => {
    const channel = bridgeChannelManager.getBridgeChannel('testChannel');
    expect(channel).to.equal(channelStub);
    expect(bridge.ComponentConnector.getChannel.calledWith('__bridge_ch_testChannel')).to.be.true;
  });

  // it('should get the idle callback channel', () => {
  //   const idleChannel$ = bridgeChannelManager.getIdleCallbackChannel();
  //   expect(idleChannel$).to.equal(observableStub.pipe.first());
  // });

  it('should get the application context channel', () => {
    const channel = bridgeChannelManager.getAppContextChannel();
    expect(channel).to.equal(channelStub);
    expect(bridge.ComponentConnector.getChannel.calledWith('__bridge_app')).to.be.true;
  });

  it('should get the cancelled back navigations channel', () => {
    const channel = bridgeChannelManager.getCancelledBackNavigationChannel();
    expect(channel).to.equal(channelStub);
    expect(bridge.ComponentConnector.getChannel.calledWith('__bridge_cancelled_back_navigation')).to
      .be.true;
  });

  it('should get the intercepted navigations channel', () => {
    const channel = bridgeChannelManager.getInterceptedNavigationChannel();
    expect(channel).to.equal(channelStub);
    expect(bridge.ComponentConnector.getChannel.calledWith('__bridge_intercepted_navigation')).to.be
      .true;
  });

  it('should get the private channel that corresponds to a page', () => {
    const channel = bridgeChannelManager.getPrivate('testPage');
    expect(channel).to.equal(channelStub);
    expect(bridge.ComponentConnector.getChannel.calledWith('__bridge_page_testPage')).to.be.true;
  });

  it('should get the post message channel for the given event name', () => {
    const channel = bridgeChannelManager.getPostMessageChannel('testEvent');
    expect(channel).to.equal(channelStub);
    expect(bridge.ComponentConnector.getChannel.calledWith('__bridge_post_message_testEvent')).to.be
      .true;
  });

  it('should initialize the application context channel', () => {
    bridgeChannelManager.initAppContextChannel();
    expect(bridge.ComponentConnector.getChannel.calledWith('__bridge_app')).to.be.true;
  });

  it('should initialize the cancelled back navigation channel', () => {
    bridgeChannelManager.initCancelledBackNavigationChannel();
    expect(bridge.ComponentConnector.getChannel.calledWith('__bridge_cancelled_back_navigation')).to
      .be.true;
  });

  it('should initialize the private channel for the given page', () => {
    const publishPrivatePageStatus = sinon.stub(bridgeChannelManager, 'publishPrivatePageStatus');
    const channel = bridgeChannelManager.initPrivateChannel('oldPage', 'newPage');
    expect(publishPrivatePageStatus.calledWith('newPage', true)).to.be.true;
    expect(publishPrivatePageStatus.calledWith('oldPage', false)).to.be.true;
  });

  it('should initialize the private channel for the given page without previous navigation', () => {
    const publishPrivatePageStatus = sinon.stub(bridgeChannelManager, 'publishPrivatePageStatus');
    const channel = bridgeChannelManager.initPrivateChannel(undefined, 'newPage');
    expect(publishPrivatePageStatus.calledWith('newPage', true)).to.be.true;
    expect(publishPrivatePageStatus.calledWith(undefined, false)).to.be.false;
  });
});
