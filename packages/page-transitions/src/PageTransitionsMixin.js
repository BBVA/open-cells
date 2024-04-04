import { dedupeMixin } from '@open-wc/dedupe-mixin';
import { transitionPage } from './page-transitions.js';
import defaultPageTransitions from './default-page-transitions.js';

/**
 * This mixin adds page transition functionality to a page element.
 *
 * When a page `state` is set to `active`, it will invoke `transitionPage` with the options set in
 * the page.
 *
 * This function will look for a sibling page with 'inactive' state, then will add attributes to
 * both pages to allow transitioning between them using CSS animations. These attributes are removed
 * when the pages fire the `animationend` or `animationcancel` events.
 *
 * The attributes added to the pages during transition are:
 *
 * - `page-animation`: the name of the animation for the page
 * - `page-animation-direction`: the direction of the animation (forward or backward)
 *
 * The mixin automatically adds `[data-cells-page]` attribute to the page it is applied to. This is
 * the attribute used to style the pages.
 *
 * ## Styles
 *
 * ### Basic page styles
 *
 * In order to animate them, the pages must have some basic styles. The following is a basic example
 * of how to style the pages:
 *
 * ```css
 * [data-cells-page] {
 *   display: none;
 *   position: absolute;
 *   inset: 0;
 *   z-index: 0;
 * }
 * [data-cells-page][state='active'],
 * [data-cells-page][state='inactive'][page-animation] {
 *   display: block;
 * }
 * [data-cells-page][page-animation] {
 *   animation-name: base-cells-page;
 * }
 * \@keyframes base-cells-page {
 * }
 * ```
 *
 * With this, every page is absolutely positioned on their relative container; this allows to
 * overlap them. They are also hidden by default. Only the active page, and inactive page that is
 * transitioning, will be shown. Finally, every page that is animating will have a `base-cells-page`
 * animation applied to it. This ensures that the page will always fire an `animationend` event,
 * even if does not have styles for the animation type applied to it.
 *
 * ### Transition styles
 *
 * The styles for the transitions are simple CSS animations. The following is an example for a fade
 * transition:
 *
 * ```css
 * [data-cells-page][state='inactive'] {
 *   z-index: 2;
 * }
 *
 * [data-cells-page][state='active'] {
 *   z-index: 3;
 * }
 *
 * [data-cells-page][page-animation] {
 *   animation-duration: var(--page-transition-animation-duration, 195ms);
 *   animation-timing-function: var(
 *     --page-transition-animation-timing-function,
 *     cubic-bezier(0.4, 0, 0.2, 1)
 *   );
 *   animation-fill-mode: both;
 * }
 *
 * [data-cells-page][page-animation='fadeIn'] {
 *   animation-name: fadeIn;
 * }
 *
 * [data-cells-page][page-animation='fadeOut'] {
 *   animation-name: fadeOut;
 * }
 *
 * \@keyframes fadeIn {
 *   from {
 *     opacity: 0;
 *   }
 *   to {
 *     opacity: 1;
 *   }
 * }
 *
 * \@keyframes fadeOut {
 *   from {
 *     opacity: 1;
 *   }
 *   to {
 *     opacity: 0;
 *   }
 * }
 * ```
 *
 * The `z-index` ensures that the active page is shown over the inactive one. Then, the pages being
 * animated receive animation parameters such as duration, timing function and fill mode. Finally,
 * the animations are defined using keyframes.
 *
 * ### Adding styles to pages container document
 *
 * These styles must be applied to the document containing the pages. You can define your own CSS
 * containing them.
 *
 * This package exports a `pageTransitionStyles` Lit CSSResult with the styles for the default
 * animations provided. You can add them to your parent component styles (in case your app and pages
 * are inside the shadow root of a component) or to the global styles of your app.
 *
 * Also, importing the `page-transition-head-styles.js` entrypoint to your app will automatically
 * add them to a `style` tag in the `head` of the main document.
 *
 * ## Animation definitions
 *
 * The `transitionPage` function receives an object with options, including `type` and `animations`.
 * The `animations` object contains the definitions for the animations to use. The keys are the
 * names of the animations. The `type` specifies which key from the `animations` object must be
 * used.
 *
 * An example of animations definitions object:
 *
 * ```js
 * {
 *   "fade": {
 *     "forwardsIn": "fadeIn",
 *     "forwardsOut": "fadeOut",
 *     "backwardsIn": "fadeIn",
 *     "backwardsOut": "fadeOut"
 *   },
 *   "horizontal": {
 *     "forwardsIn": "moveFromRight",
 *     "forwardsOut": "moveToLeft",
 *     "backwardsIn": "moveFromLeft",
 *     "backwardsOut": "moveToRight"
 *   }
 * }
 * ```
 *
 * When the `type` is `fade`, it will use the first set of animations.
 *
 * This package provides a set of default animations matching the default CSS. It is exported as
 * `defaultPageTransitions`.
 *
 * In a component using the mixin, the animation definitions can be overrided using the `static
 * pageTransitionDefinitions` property.
 *
 * ```js
 * static pageTransitionDefinitions = { ...defaultPageTransitions, ...myCustomPageTransitions }
 * ```
 *
 * ### Forwards and backwards transitions
 *
 * This package accounts for "navigation direction". When transitioning from one page to another, it
 * is considered that the user is navigating forwards. It will use the `forwardsIn` and
 * `forwardsOut` animations (first for the active page, second for the inactive page).
 *
 * The inactive page will then store a reference to the active page. If the inactive page is set to
 * active again thereafter, this navigation will be considered a backwards navigation. It will then
 * use the `backwardsIn` and `backwardsOut` animations from the new inactive page, and the stored
 * reference will be removed.
 *
 * This allows for different animations when navigating forwards and backwards. If you always want
 * to use the same animations, you can define an animation that uses the same animations for both:
 *
 * ```js
 *   horizontalEverForwards: {
 *     forwardsIn: 'moveFromRight',
 *     forwardsOut: 'moveToLeft',
 *     backwardsIn: 'moveFromRight',
 *     backwardsOut: 'moveToLeft',
 *   },
 * ```
 *
 * The values in each key will be the values for the `page-animation` attribute. The
 * `page-animation-direction` attribute will be set to `forward` or `backward` depending on the
 * direction of the animation.
 *
 * ## Disable animations
 *
 * Setting `disabled` to true in the options object passed to `transitionPage` will disable the
 * animation for the page. The active page will be immediately shown.
 */
const PageTransitionsMixinImpl = BaseClass =>
  class extends BaseClass {
    static properties = {
      /** Current state of the page: active, inactive, cached */
      state: { reflect: true },

      /** Type of transition to use for this page (fade, static, verticalUp...) */
      pageTransitionType: { attribute: 'page-transition-type' },

      /** If true, page won't animate when state is set to active */
      pageTransitionDisabled: {
        type: Boolean,
        attribute: 'page-transition-disabled',
      },
    };

    static pageTransitionDefinitions = { ...defaultPageTransitions };

    get _pageTransitions() {
      return this.constructor.pageTransitionDefinitions;
    }

    constructor() {
      super();
      this.pageTransitionType = 'fade';
      this.pageTransitionDisabled = false;
      /** @internal */
      this.dataset.cellsPage = '';
    }

    /** @internal */
    updated(props) {
      super.updated?.(props);
      if (props.has('state') && this.state === 'active') {
        transitionPage(this, {
          disabled: this.pageTransitionDisabled,
          type: this.pageTransitionType,
          animations: this._pageTransitions,
        });
      }
    }
  };

export const PageTransitionsMixin = dedupeMixin(PageTransitionsMixinImpl);
