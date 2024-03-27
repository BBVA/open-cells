import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { ApplicationConfigManager } from '../../src/manager/application-config.js';
import { ActionChannelManager } from '../../src/manager/action-channels.js';
import { CellsStorage } from '../../src/manager/storage.js';
import { Bridge } from '../../src/bridge.js';

describe('ApplicationConfigManager', () => {
  let actionChannelManager;
  let applicationConfigManager;
  let storageMock;
  let bridge;

  beforeEach(() => {
    bridge = sinon.createStubInstance(Bridge);
    actionChannelManager = new ActionChannelManager(bridge);

    actionChannelManager.isAllowedProperty = sinon.stub().returns(true);
    sinon.stub(actionChannelManager, 'bridge').value({});

    storageMock = sinon.createStubInstance(CellsStorage);

    applicationConfigManager = new ApplicationConfigManager({
      ActionChannelManager: actionChannelManager,
    });
    applicationConfigManager.storage = storageMock;
  });

  it('should be created', () => {
    expect(applicationConfigManager).to.be.an.instanceOf(ApplicationConfigManager);
  });

  describe('saveAppConfig', () => {
    it('should save the application configuration', () => {
      const config = { key1: 'value1', key2: 'value2' };

      applicationConfigManager.saveAppConfig(config);
      expect(storageMock.setItem.calledOnce).to.be.true;
    });
  });

  describe('loadAppConfig', () => {
    it('should load the application configuration', () => {
      const config = { key1: 'value1', key2: 'value2' };
      applicationConfigManager.storage.getItem.returns(config);
      applicationConfigManager.loadAppConfig();
      expect(actionChannelManager.bridge).to.to.deep.equal({ key1: 'value1', key2: 'value2' });
    });
  });
});
