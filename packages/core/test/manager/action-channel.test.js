import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { ActionChannelManager } from '../../src/manager/action-channels.js';
import { Bridge } from '../../src/bridge.js';

describe('ActionChannelManager', () => {
  let bridge;
  let actionChannelManager;

  beforeEach(() => {
    bridge = sinon.createStubInstance(Bridge);
    actionChannelManager = new ActionChannelManager(bridge);
  });

  it('should be created', () => {
    expect(actionChannelManager).to.be.an.instanceOf(ActionChannelManager);
  });

  it('should have a bridge property', () => {
    expect(actionChannelManager).to.have.property('bridge');
  });

  it('should have a ChannelManager property', () => {
    expect(actionChannelManager).to.have.property('ChannelManager');
  });

  it('should have a TemplateManager property', () => {
    expect(actionChannelManager).to.have.property('TemplateManager');
  });

  describe('updateProperty', () => {
    it('should update a property of the bridge object', () => {
      actionChannelManager.updateProperty('testProp', 'testValue');
      expect(bridge.testProp).to.equal('testValue');
    });

    it('should not update a function property of the bridge object', () => {
      bridge.testFunction = () => {};
      actionChannelManager.updateProperty('testFunction', 'testValue');
      expect(bridge.testFunction).to.be.a('function');
    });
  });

  // Continúa con las pruebas para los demás métodos...
});
