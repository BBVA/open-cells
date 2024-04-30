import { html, LitElement } from 'lit';
import { PageController } from '@open-cells/page-controller';
import { PageTransitionsMixin } from '@open-cells/page-transitions';
import { customElement, state } from 'lit/decorators.js';
import '@material/web/button/outlined-button.js';
import '@material/web/icon/icon.js';
import '../../components/page-layout.js';
import { PageLayout } from '../../components/page-layout.js';

// @ts-ignore
@customElement('not-found-page')
export class NotFoundPage extends PageTransitionsMixin(LitElement) {
  pageController = new PageController(this);

  @state()
  protected _layout: PageLayout | null = null;

  firstUpdated(props: any) {
    super.firstUpdated?.(props);

    this._layout = this.querySelector('page-layout');
  }

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    // @ts-ignore
    return this;
  }

  render() {
    return html`
      <page-layout>
        <div class="page-header">
          <ul class="page-header-sup">
            <li>
              <md-outlined-button aria-label="Back to home" href="#!/">
                <md-icon filled slot="icon">arrow_back</md-icon>
                <span class="md-outlined-button-text">Back to</span> home
              </md-outlined-button>
            </li>
          </ul>

          <h2>Page not found</h2>
        </div>
      </page-layout>
    `;
  }

  onPageLeave() {
    this._layout?.resetScroll();
  }
}
