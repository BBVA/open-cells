import defaultPageTransitions from './default-page-transitions.js';

function findSiblingPageByState(state, currentPage) {
  return (
    // get all sibling nodes
    [...currentPage.parentElement.children]
      // filter out the current page and not-page siblings
      .filter(page => page !== currentPage)
      // find the sibling page with the given state
      .find(page => page.getAttribute('state') === state || page.state === state)
  );
}

function clearAnimations(page) {
  page.removeAttribute('page-animation');
  page.removeAttribute('page-animation-direction');
  page.removeEventListener('animationend', page._animCb);
  page.removeEventListener('animationcancel', page._animCb);
}

function cleanPreviousNavigation(page) {
  const pageOut = page._isPreviousNavigationFor?.page;
  page._isPreviousNavigationFor = null;
  if (pageOut) {
    cleanPreviousNavigation(pageOut);
  }
}

function dispatchActivePageEvent(page) {
  page.dispatchEvent(
    new CustomEvent('page-active', {
      bubbles: true,
      composed: true,
    }),
  );
}

function resetPage(page, evt, siblingPage) {
  /* If this is not the target of the event (for example, it's an animation from an inner node), return */
  // eventPhase is different to AT_TARGET
  if (evt.eventPhase !== 2) {
    return;
  }

  clearAnimations(page);

  /* If both pages have finished animation, fire event */
  if (!page.hasAttribute('page-animation') && !siblingPage.hasAttribute('page-animation')) {
    requestAnimationFrame(() => {
      const eventPage = page.state === 'active' ? page : siblingPage;
      dispatchActivePageEvent(eventPage);
    });
  }
}

function prepareAnimationEnds(pageIn, pageOut) {
  pageIn._animCb = ev => resetPage(pageIn, ev, pageOut);
  pageIn.addEventListener('animationend', pageIn._animCb);
  pageIn.addEventListener('animationcancel', pageIn._animCb);

  pageOut._animCb = ev => resetPage(pageOut, ev, pageIn);
  pageOut.addEventListener('animationend', pageOut._animCb);
  pageOut.addEventListener('animationcancel', pageOut._animCb);
}

function getAnimationType(page, type, animations) {
  return animations?.[type] || defaultPageTransitions['static'];
}

function initAnimation(page, animationAttr, direction, fireEvent) {
  page.setAttribute('page-animation', animationAttr);
  page.setAttribute('page-animation-direction', direction);

  if (fireEvent) {
    page.dispatchEvent(
      new CustomEvent(`animation-${direction}`, {
        bubbles: true,
        composed: true,
      }),
    );
  }
}

function animatePage(pageIn, pageOut, type, animations) {
  let reverse = false;

  let pageAnimationType = type;
  let pageAnimations = animations;

  if (pageOut && pageIn._isPreviousNavigationFor) {
    pageAnimationType = pageIn._isPreviousNavigationFor.type;
    pageAnimations = pageIn._isPreviousNavigationFor.animations;
    cleanPreviousNavigation(pageIn);
    reverse = true;
  } else {
    pageOut._isPreviousNavigationFor = {
      page: pageIn,
      type,
      animations,
    };
  }

  prepareAnimationEnds(pageIn, pageOut);

  const animationType = getAnimationType(pageIn, pageAnimationType, pageAnimations);

  requestAnimationFrame(() => {
    if (!reverse) {
      initAnimation(pageIn, animationType.forwardsIn, 'forward');
      initAnimation(pageOut, animationType.forwardsOut, 'forward', true);
    } else {
      initAnimation(pageIn, animationType.backwardsIn, 'backward');
      initAnimation(pageOut, animationType.backwardsOut, 'backward', true);
    }
  });
}

/**
 * Looks for an 'inactive' sibling page of the given one and animates the transition between them
 * using the provided options.
 *
 * The animations object contains a key for each animation type, with the value being an object with
 * the following properties:
 *
 * - ForwardsIn: The name of the animation to use when transitioning the incoming page in the forwards
 *   direction
 * - ForwardsOut: The name of the animation to use when transitioning the outgoing page in the
 *   forwards direction
 * - BackwardsIn: The name of the animation to use when transitioning the incoming page in the
 *   backwards direction
 * - BackwardsOut: The name of the animation to use when transitioning the outgoing page in the
 *   backwards direction
 *
 * @param {HTMLElement} page - The new active page to transition to
 * @param {Object} options - The options to use for the transition
 * @param {boolean} options.disabled - If true, transition is disabled and active page will be
 *   immediately shown
 * @param {string} options.type - The type of transition to use from the animations object
 * @param {Object} options.animations - The object containing the animation definitions
 * @returns {void}
 */
export function transitionPage(page, { disabled, type, animations } = {}) {
  clearAnimations(page);

  // Get sibling page that has been set as 'inactive' (exiting)
  const inactivePage = findSiblingPageByState('inactive', page);

  if (inactivePage && !disabled) {
    clearAnimations(inactivePage);
    animatePage(page, inactivePage, type, animations);
  } else {
    dispatchActivePageEvent(page);
  }
}
