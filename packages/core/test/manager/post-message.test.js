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
import { PostMessageManager } from '../../src/manager/post-message.js';

describe('PostMessageManager', () => {
  let postMessageManager;
  let bridgeStub;

  beforeEach(() => {
    bridgeStub = {
      postMessageTargetOrigin: 'http://example.com',
      channelPrefix: 'open-cells',
      ComponentConnector: { createEvent: sinon.stub() },
      BridgeChannelManager: {
        getPostMessageChannel: sinon.stub(),
        getBridgeChannel: sinon.stub().returns({ subscribe: sinon.stub() }),
      },
    };
    postMessageManager = new PostMessageManager(bridgeStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create an instance of PostMessageManager', () => {
    expect(postMessageManager).to.be.instanceOf(PostMessageManager);
  });

  it('should setup post messages if enabled', () => {
    const addEventListenerStub = sinon.stub(window, 'addEventListener');
    postMessageManager.setupPostMessages();
    expect(addEventListenerStub.calledOnce).to.be.true;
  });

  it('should send a post message to the parent window', () => {
    const postMessageStub = sinon.stub(window.parent, 'postMessage');
    postMessageManager._sendPostMessage({ event: 'testEvent', detail: 'testDetail' });
    expect(
      postMessageStub.calledOnceWithExactly(
        {
          event: 'testEvent',
          detail: 'testDetail',
          eventName: 'testEvent',
          eventDetail: 'testDetail',
        },
        'http://example.com',
      ),
    ).to.be.true;
  });

  it('should send the ready event using the compatible payload', () => {
    const addEventListenerStub = sinon.stub(window, 'addEventListener');
    const postMessageStub = sinon.stub(window.parent, 'postMessage');
    postMessageManager.setupPostMessages();
    expect(
      postMessageStub.calledOnceWithExactly(
        {
          event: 'open-cells-ready',
          detail: undefined,
          eventName: 'open-cells-ready',
          eventDetail: undefined,
        },
        'http://example.com',
      ),
    ).to.be.true;
  });
});
