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
