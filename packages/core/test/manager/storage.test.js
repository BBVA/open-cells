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
import { CellsStorage } from '../../src/manager/storage.js';

describe('CellsStorage', () => {
  let cellsStorage;

  beforeEach(() => {
    cellsStorage = new CellsStorage({ prefix: 'test_', persistent: false });
  });

  it('should be created', () => {
    expect(cellsStorage).to.be.an.instanceOf(CellsStorage);
  });

  it('should have a prefix property', () => {
    expect(cellsStorage).to.have.property('prefix');
  });

  it('should have a persistent property', () => {
    expect(cellsStorage).to.have.property('persistent');
  });

  it('should have an internalStorage property', () => {
    expect(cellsStorage).to.have.property('internalStorage');
  });

  describe('getItem', () => {
    it('should get an item from the storage', () => {
      cellsStorage.setItem('key', 'value');
      expect(cellsStorage.getItem('key')).to.equal('value');
    });
  });

  describe('setItem', () => {
    it('should set an item in the storage', () => {
      cellsStorage.setItem('key', 'value');
      expect(cellsStorage.getItem('key')).to.equal('value');
    });
  });

  describe('clear', () => {
    it('should clear all items from the storage', () => {
      cellsStorage.setItem('key1', 'value1');
      cellsStorage.setItem('key2', 'value2');
      cellsStorage.clear();
      expect(cellsStorage.getItem('key1')).to.be.null;
      expect(cellsStorage.getItem('key2')).to.be.null;
    });
  });
});
