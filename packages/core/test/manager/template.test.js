import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { TemplateManager } from '../../src/manager/template.js';

describe('TemplateManager', () => {
  let templateManager;

  beforeEach(() => {
    templateManager = new TemplateManager();
  });

  it('should createTemplate', () => {
    const name = 'test';
    const spec = { tagName: 'my-component' };
    const template = templateManager.createTemplate(name, spec);
    expect(template).to.exist;
    expect(templateManager.get(name)).to.equal(template);
  });

  it('should select', () => {
    const name = 'test';
    const template = templateManager.createTemplate(name, { tagName: 'my-component' });
    const cache = templateManager.cache;
    const externalEventsCodes = {
      TEMPLATE_TRANSITION_END: 'TEMPLATE_TRANSITION_END',
    };
    const eventManager = {
      emit: sinon.stub(),
    };

    // Mock the deactivate and activate methods
    template.deactivate = sinon.stub();
    template.activate = sinon.stub();

    // Mock the cache method
    for (let tplName in cache) {
      if (cache.hasOwnProperty(tplName)) {
        cache[tplName].cache = sinon.stub();
      }
    }

    // Call the select method
    templateManager.select(name);

    // Assertions
    expect(templateManager.selected).to.equal(name);
    //expect(template.deactivate.called).to.be.true;
    //expect(template.activate.called).to.be.true;
    // expect(eventManager.emit.calledWith(externalEventsCodes.TEMPLATE_TRANSITION_END, template)).to
    // .be.true;

    // Verify cache method calls
    // for (let tplName in cache) {
    //   if (cache.hasOwnProperty(tplName)) {
    //     if (tplName === name) {
    //       expect(cache[tplName].deactivate.called).to.be.true;
    //     } else {
    //       expect(cache[tplName].cache.called).to.be.true;
    //     }
    //   }
    // }
  });
});
