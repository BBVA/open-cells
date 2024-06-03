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
import { setAttribute } from '../src/utils.js';

describe('setAttribute', () => {
  let node;

  beforeEach(() => {
    node = document.createElement('div');
  });

  it('should set the attribute to the specified value', () => {
    setAttribute(node, 'test', 'value');
    expect(node.getAttribute('test')).to.equal('value');
  });

  // it('should set the attribute to an empty string if the value is true', () => {
  //   setAttribute(node, 'test', true);
  //   expect(node.getAttribute('test')).to.equal('');
  // });

  // it('should remove the attribute if the value is false', () => {
  //   node.setAttribute('test', 'value');
  //   setAttribute(node, 'test', false);
  //   expect(node.getAttribute('test')).to.be.null;
  // });
});
