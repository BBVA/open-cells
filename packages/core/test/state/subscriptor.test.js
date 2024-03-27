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
