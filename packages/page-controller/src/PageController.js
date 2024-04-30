import { ElementController } from '@open-cells/element-controller';

export class PageController extends ElementController {
  static get BRIDGE_PAGE_PRIVATE_CHANNEL_PREFIX() {
    return '__oc_page_';
  }

  static getPagePrivateChannel(tagName) {
    return `${PageController.BRIDGE_PAGE_PRIVATE_CHANNEL_PREFIX}${tagName.toLowerCase().replace('-page', '')}`;
  }

  // Declare properties
  static get properties() {
    return {
      params: { type: Object },
    };
  }

  // Initialize properties
  constructor(host) {
    super(host);
    this.params = {};
  }

  hostConnected() {
    this.__handleConnections();
  }

  __handleConnections() {
    if (this.__hasPageHandlers()) {
      this.__handlePagePrivateChannel();
    }
  }

  __hasPageHandlers() {
    return !!this.host.onPageEnter || !!this.host.onPageLeave;
  }

  __handlePagePrivateChannel() {
    const channelName = PageController.getPagePrivateChannel(this.host.tagName);
    const wrappedPrivateChannelCallback = this.__wrapPrivateChannelCallback();

    this.subscribe(channelName, wrappedPrivateChannelCallback);
  }

  __wrapPrivateChannelCallback() {
    return ({ value: pageStatusValue }) => {
      const callback = () => {
        if (pageStatusValue) {
          this.host.onPageEnter && this.host.onPageEnter();
        } else {
          this.host.onPageLeave && this.host.onPageLeave();
        }
      };

      if (callback) {
        callback();
      }
    };
  }
}
