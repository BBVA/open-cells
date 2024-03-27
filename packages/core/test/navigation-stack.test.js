import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { NavigationStack } from '../src/navigation-stack';

describe('NavigationStack', () => {
  let navigationStack;

  beforeEach(() => {
    navigationStack = new NavigationStack();
  });

  describe('#constructor', () => {
    it('should construct a new NavigationStack object', () => {
      expect(navigationStack).to.be.instanceOf(NavigationStack);
      expect(navigationStack.navStack).to.deep.equal([]);
      expect(navigationStack.skipNav).to.deep.equal({});
    });
  });

  describe('#length', () => {
    it('should return the length of the navigation stack', () => {
      navigationStack.navStack.push({});
      expect(navigationStack.length).to.equal(1);
    });
  });

  describe('#addSkipNavigation', () => {
    it('should add a skip navigation entry to the navigation stack', () => {
      const nav = { from: 'page1', to: 'page2', skipHistory: true };
      navigationStack.addSkipNavigation(nav);
      expect(navigationStack.skipNav['page1:page2']).to.be.true;
    });
  });

  describe('#_reverseNavigation', () => {
    it('should reverse a navigation object', () => {
      const nav = { from: 'page1', to: 'page2' };
      const reversedNav = navigationStack._reverseNavigation(nav);
      expect(reversedNav).to.deep.equal({ from: 'page2', to: 'page1' });
    });
  });

  // Add more tests for the remaining functions...
});
