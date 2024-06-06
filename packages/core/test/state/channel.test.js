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
