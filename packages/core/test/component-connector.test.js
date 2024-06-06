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
import { ComponentConnector } from '../../src/component-connector.js';
import { Subscriptor } from '../../src/state/subscriptor.js';
import { Channel } from '../../src/state/channel.js';
import sinon from 'sinon';

describe('ComponentConnector', () => {
  let componentConnector;
  let node;
  let bind;
  let channelName;

  beforeEach(() => {
    componentConnector = new ComponentConnector();
    node = {}; // Initialize the node as needed
    bind = {}; // Initialize the bind as needed
    channelName = 'testChannel';
  });

  describe('#getSubscriptor', () => {
    it('should get an existing subscriptor', () => {
      const subscriptor = new Subscriptor(node);
      componentConnector.subscriptors.set(node, subscriptor);
      expect(componentConnector.getSubscriptor(node)).to.equal(subscriptor);
    });

    it('should create a new subscriptor if one does not exist', () => {
      expect(componentConnector.getSubscriptor(node)).to.be.instanceOf(Subscriptor);
    });
  });

  // describe('#addSubscription', () => {
  //   it('should add a subscription to a node with a channel', () => {
  //     const callback = sinon.stub();
  //     componentConnector._wrapCallbackWithNode = sinon.stub().returns(callback);
  //     const channel = new Channel(channelName);
  //     componentConnector.manager.get = sinon.stub().returns(channel);
  //     componentConnector.addSubscription(channelName, node, bind);
  //     const subscriptor = componentConnector.getSubscriptor(node);
  //     expect(subscriptor.subscriptions.has(channelName)).to.be.true;
  //   });
  // });

  describe('#getChannel', () => {
    it('should get a channel by its name', () => {
      const channel = new Channel(channelName);
      componentConnector.manager.get = sinon.stub().returns(channel);
      expect(componentConnector.getChannel(channelName)).to.equal(channel);
    });
  });

  describe('#getChannels', () => {
    it('should get all channels', () => {
      const channels = {
        channel1: new Channel('channel1'),
        channel2: new Channel('channel2'),
      };
      componentConnector.manager.getChannels = sinon.stub().returns(channels);
      expect(componentConnector.getChannels()).to.equal(channels);
    });
  });

  describe('#setChannels', () => {
    it('should set the channels', () => {
      const channels = {
        channel1: new Channel('channel1'),
        channel2: new Channel('channel2'),
      };
      componentConnector.setChannels(channels);
      expect(componentConnector.getChannels()).to.equal(channels);
    });
  });

  // describe('#cleanAllChannels', () => {
  //   it('should clean all channels', () => {
  //     const channels = {
  //       channel1: new Channel('channel1'),
  //       channel2: new Channel('channel2'),
  //     };
  //     componentConnector.setChannels(channels);
  //     componentConnector.cleanAllChannels();
  //     expect(Object.keys(componentConnector.getChannels()).length).to.equal(0);
  //   });
  // });

  describe('#updateSubscription', () => {
    // Add tests for the updateSubscription function
  });

  describe('#_wrapCallbackWithNode', () => {
    // Add tests for the _wrapCallbackWithNode function
  });

  describe('#wrapCallback', () => {
    // Add tests for the wrapCallback function
  });
});
