import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { ChannelManager } from '../../src/manager/channel-manager.js';

describe('ChannelManager', () => {
  let channelManager;
  let channelStub;

  beforeEach(() => {
    channelManager = new ChannelManager();
  });

  it('should create a new channel if it does not exist', () => {
    const existsBefore = channelManager.has('testChannel');
    const channel = channelManager.get('testChannel');
    const existsAfter = channelManager.has('testChannel');

    expect(channel.name).to.equal('testChannel');
    expect(existsBefore).to.be.false;
    expect(existsAfter).to.be.true;
  });

  it('should get an existing channel', () => {
    const createSpy = sinon.spy(channelManager, 'create');
    const channel1 = channelManager.get('testChannel');
    const channel2 = channelManager.get('testChannel');
    expect(channel1.name).to.equal('testChannel');
    expect(channel1).to.equal(channel2);
    expect(createSpy.calledOnce).to.be.true;
  });

  it('should remove a channel', () => {
    channelManager.get('testChannel');
    channelManager.remove('testChannel');
    const channel = channelManager.getUnsafe('testChannel');
    expect(channel).to.be.undefined;
  });

  it('should clean all channels', () => {
    let ch = channelManager.get('testChannel');
    let clean = sinon.stub(ch, 'clean');
    channelManager.cleanAllChannels();
    expect(clean.calledOnce).to.be.true;
  });

  it('should remove all channels', () => {
    channelManager.removeAllChannels();
    const channel = channelManager.getUnsafe('testChannel');
    expect(channel).to.be.undefined;
  });

  it('should check if a channel exists', () => {
    channelManager.get('testChannel');
    const exists = channelManager.has('testChannel');
    expect(exists).to.be.true;
  });

  it('should check if a channel does not exist', () => {
    const exists = channelManager.has('testChannel');
    expect(exists).to.be.false;
  });
});
