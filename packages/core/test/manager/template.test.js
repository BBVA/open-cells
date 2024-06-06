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
