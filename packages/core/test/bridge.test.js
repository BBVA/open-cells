import { expect } from '@esm-bundle/chai';
import { Bridge } from '../../src/bridge.js';
import { eventManager } from '../../src/manager/events.js';
import { BRIDGE_CHANNEL_PREFIX } from '../../src/constants.js';

class MockWebComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.updateComplete = Promise.resolve(true);
    this.params = {};
  }

  render() {
    this.shadowRoot.innerHTML = '<h1>Test</h1>';
  }
}

function ceatePromise() {
  let resolve;
  const promise = new Promise((res, rej) => {
    resolve = res;
  });
  return { promise, resolve };
}

function navigationComplete() {
  const promise = new Promise((resolve, reject) => {
    eventManager.once('template-registered', evt => {
      console.log('template-registered', evt);
      resolve(true);
    });
  });
  return promise;
}

class HomePage extends MockWebComponent {}
class CategoryPage extends MockWebComponent {}
class NotFoundPage extends MockWebComponent {}
class SomeElement extends MockWebComponent {}

customElements.define('home-page', HomePage);

describe('Bridge', () => {
  let bridge;
  let config;
  let pageLoaded;
  let resolvePromise;

  before(() => {
    customElements.define('some-element', SomeElement);
    const routes = [
      {
        path: '/',
        name: 'home',
        action: () => {},
      },
      {
        path: '/categories/:name',
        name: 'category',
        action: async () => {
          customElements.define('category-page', CategoryPage);
        },
      },
      {
        path: '/not-found',
        name: 'not-found',
        action: async () => {
          customElements.define('not-found-page', NotFoundPage);
        },
      },
      {
        path: '/not-found',
        name: '404',
        action: () => {},
      },
    ];

    const container = document.createElement('div');
    container.setAttribute('id', 'container');
    document.body.appendChild(container);
    const mainNode = document.createElement('div');
    mainNode.setAttribute('id', '__main_node__');
    container.appendChild(mainNode);

    config = {
      debug: true,
      routes,
      mainNode: '__main_node__',
    };

    bridge = new Bridge(config);
  });

  beforeEach(() => {
    // bridge = new Bridge(config);
    // pageLoaded = new Promise((resolve, reject) => {
    //   resolvePromise = resolve;
    // });
  });

  afterEach(async () => {
    // if (bridge.getCurrentRoute().name !== 'home') {
    //   const p = navigationComplete();
    //   window.location.hash = '';
    //   bridge.navigate('home');
    //   await p;
    // } else {
    //   await Promise.resolve(true);
    // }
    document.getElementById('__main_node__').innerHTML = '';
  });

  describe('#constructor', () => {
    it('should create a new Bridge instance', () => {
      expect(bridge).to.be.an.instanceof(Bridge);
      const currentRoute = bridge.getCurrentRoute();
      expect(currentRoute.name).to.equal('home');
    });
  });

  describe('#navigate', () => {
    it('should start at the home page', async () => {
      const currentRoute = bridge.getCurrentRoute();
      expect(currentRoute.name).to.equal('home');
      expect(location.hash).to.equal('');
    });

    it('should load the page', async () => {
      const p = navigationComplete();
      bridge.navigate('category', { name: 'service' });
      await p;
      const currentRoute = bridge.getCurrentRoute();
      expect(currentRoute.name).to.equal('category');
      expect(location.hash).to.equal('#!/categories/service');
      const params = document.body.querySelector('category-page').params;
      expect(params).to.deep.equal({ name: 'service' });
    });

    // it('should go to 404 page when the page does not exist', async () => {
    //   window.location.hash = '#!/whatever';
    //   await pageLoaded;
    //   const currentRoute = bridge.getCurrentRoute();
    //   expect(currentRoute.name).to.equal('not-found');
    // });
  });

  describe('#private context app channel', () => {
    it('should update the app channel', async () => {
      const p = navigationComplete();
      bridge.navigate('home');
      await p;
      const elemStub = document.createElement('some-element');
      const expectedAppState = {
        currentPage: 'home',
        fromPage: 'category',
        // fromPage: undefined,
        interceptorContext: {},
        currentRoute: { name: 'home', params: {}, query: {}, hashPath: '/', subroute: undefined },
      };
      bridge.registerInConnection(`${BRIDGE_CHANNEL_PREFIX}_app`, elemStub, evt => {
        elemStub.app = evt.value;
      });

      expect(elemStub.app).to.deep.equal(expectedAppState);
    });
  });

  describe('#private page`s channels', () => {
    it('should update the app channel', async () => {
      const p = navigationComplete();
      bridge.navigate('category', { name: 'food' });
      await p;

      const elemStub = document.createElement('some-element');

      bridge.registerInConnection(`${BRIDGE_CHANNEL_PREFIX}_page_home`, elemStub, evt => {
        elemStub.home = evt.value;
      });
      bridge.registerInConnection(`${BRIDGE_CHANNEL_PREFIX}_page_category`, elemStub, evt => {
        elemStub.category = evt.value;
      });

      expect(elemStub.home).to.equal(false);
      expect(elemStub.category).to.equal(true);
    });
  });
});
