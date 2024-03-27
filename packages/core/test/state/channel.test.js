import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { Channel, generateUUID, createChannel } from '../../src/state/channel.js';

describe('Channel', () => {
  let channel;

  beforeEach(() => {
    channel = new Channel('test');
  });

  it('should create a channel with the given name', () => {
    expect(channel.name).to.equal('test');
  });

  it('should generate a UUID when sending a value without a UUID', () => {
    const value = {};
    channel.next(value);
    expect(value.uuid).to.exist;
  });

  it('should set the current time when sending a value without a time', () => {
    const value = {};
    channel.next(value);
    expect(value.time).to.exist;
  });

  it('should throw an error when checking for observers if the channel is closed', () => {
    sinon.stub(channel, 'closed').get(() => true);
    expect(() => channel.hasObservers()).to.throw();
  });

  it('should unsubscribe all observers', () => {
    const unsubscribeStub = sinon.stub(channel, 'unsubscribe');
    channel.unsubscribe();
    expect(unsubscribeStub.called).to.be.true;
  });

  it('should clean the channel', () => {
    channel.clean();
    expect(channel.buffer).to.be.empty;
  });
});

describe('generateUUID', () => {
  it('should generate a UUID', () => {
    const uuid = generateUUID();
    expect(uuid).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});

describe('createChannel', () => {
  it('should create a channel with the given name', () => {
    const channel = createChannel('test');
    expect(channel.name).to.equal('test');
  });
});
