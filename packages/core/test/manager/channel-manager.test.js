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
