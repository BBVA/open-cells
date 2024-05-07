import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ElementController } from '@open-cells/element-controller';
import { styles } from './page-layout.css';

@customElement('page-layout')
export class PageLayout extends LitElement {
  elementController = new ElementController(this);

  static styles = styles;

  @state()
  protected _scroller: HTMLElement | undefined | null = null;

  firstUpdated(props: any) {
    super.firstUpdated(props);

    this._scroller = this.shadowRoot?.querySelector('.scroller');
    this._scroller?.addEventListener('scroll', ev => {
      this.elementController.publish('scroll', {
        scrollTop: (ev.target as HTMLElement)?.scrollTop,
      });
    });
  }

  disconnectedCallback() {
    this._scroller?.removeEventListener('scroll', ev => {
      this.elementController.publish('scroll', {
        scrollTop: (ev.target as HTMLElement)?.scrollTop,
      });
    });
    this.elementController.unsubscribe('scroll');
    super.disconnectedCallback();
  }

  render() {
    return html`
      <div class="scroller">
        <div class="content">
          <div class="region">
            <div class="zone">
              <slot></slot>
            </div>
          </div>
        </div>

        <div class="footer">
          <div class="region">
            <div class="zone">${this._footerTpl}</div>
          </div>
        </div>
      </div>
    `;
  }

  get _footerTpl() {
    return html`
      <div class="footer-content">
        <p>
          Data from
          <a href="https://www.themealdb.com/api.php" target="_blank">The Meal DB</a>
        </p>
        <p>Made with <a href="https://www.opencells.dev">Open Cells</a></p>
      </div>
    `;
  }

  resetScroll() {
    this._scroller?.scrollTo(0, 0);
  }
}
