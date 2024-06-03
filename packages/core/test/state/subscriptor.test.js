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
import { Subscriptor } from '../../src/state/subscriptor.js';
import { Subscription } from 'rxjs';

describe('Subscriptor', () => {
  let subscriptor;
  let node;
  let channel;

  beforeEach(() => {
    node = {};
    channel = {};
    subscriptor = new Subscriptor(node);
  });

  describe('#constructor', () => {
    it('debería inicializar correctamente las propiedades', () => {
      expect(subscriptor.node).to.equal(node);
      expect(subscriptor.subscriptions).to.be.an('array').that.is.empty;
      expect(subscriptor.publications).to.be.an.instanceof(Subscription);
      expect(subscriptor.nodeChannelData).to.be.an('object').that.is.empty;
    });
  });

  describe('#hasSubscription', () => {
    it('debería devolver false si el nodo no tiene una suscripción al canal', () => {
      expect(subscriptor.hasSubscription(channel)).to.be.false;
    });
  });

  describe('#publish', () => {
    it('debería agregar un evento a las publicaciones', () => {
      const event = {};
      subscriptor.publish(event);
    });
  });

  describe('#unsubscribe', () => {
    it('debería eliminar todas las suscripciones activas', () => {
      subscriptor.unsubscribe(true);
    });
  });

  describe('#_firstInstanceOfObserver', () => {
    it('debería devolver la posición de la primera ocurrencia del nodo del observador en el canal', () => {
      const index = subscriptor._firstInstanceOfObserver(node, channel);
    });
  });
});
