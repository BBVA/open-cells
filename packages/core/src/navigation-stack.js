/**
 * @typedef {import('../types').Navigation} Navigation
 *
 * @typedef {import('../types').QueryParams} QueryParams
 *
 * @typedef {import('../types').RoutePage} RoutePage
 */

/** Represents a navigation stack that manages the history of routes/pages. */
export class NavigationStack {
  /** Constructs a new NavigationStack object. */
  constructor() {
    /** @type {RoutePage[]} */
    this.navStack = [];
    /** @type {{ [key: string]: boolean }} */
    this.skipNav = {};
  }

  /**
   * Gets the length of the navigation stack.
   *
   * @returns {number} The length of the navigation stack.
   */
  get length() {
    return this.navStack.length;
  }

  /**
   * Adds a skip navigation entry to the navigation stack.
   *
   * @param {Navigation} nav - The navigation object.
   */
  addSkipNavigation(nav) {
    if (nav.skipHistory === true || nav.skipHistory === false) {
      this.skipNav[`${nav.from}:${nav.to}`] = nav.skipHistory;
    }
  }

  /**
   * Reverses a navigation object.
   *
   * @param {Navigation} nav - The navigation object to reverse.
   * @returns {Navigation} The reversed navigation object.
   */
  _reverseNavigation(nav) {
    return {
      from: nav.to,
      to: nav.from,
    };
  }

  /**
   * Checks if a navigation is marked as skip navigation.
   *
   * @param {Navigation} nav - The navigation object to check.
   * @returns {boolean} True if the navigation is marked as skip navigation, false otherwise.
   */
  isSkipNavigation(nav) {
    return this.skipNav[`${nav.from}:${nav.to}`] === true;
  }

  /**
   * Gets the last navigation object in the navigation stack.
   *
   * @returns {Navigation} The last navigation object.
   */
  lastNavigation() {
    const navCount = this.navStack.length;
    let from;
    let to;
    if (navCount === 1) {
      to = this.navStack[0];
    } else if (navCount > 1) {
      to = this.navStack[navCount - 1];
      from = this.navStack[navCount - 2];
    }
    return this.createNavigation(from, to);
  }

  /**
   * Creates a route object.
   *
   * @param {string} page - The page name.
   * @param {QueryParams} params - The route parameters.
   * @returns {RoutePage} The created route object.
   */
  createRoute(page, params = {}) {
    return {
      page,
      params,
    };
  }

  /**
   * Creates a navigation object.
   *
   * @param {RoutePage | undefined} routeFrom - The route object representing the starting page.
   * @param {RoutePage | undefined} routeTo - The route object representing the destination page.
   * @returns {Navigation} The created navigation object.
   */
  createNavigation(routeFrom, routeTo) {
    return {
      from: routeFrom ? routeFrom.page : undefined,
      to: routeTo ? routeTo.page : undefined,
    };
  }

  /**
   * Pushes a route object to the navigation stack.
   *
   * @param {RoutePage} route - The route object to push.
   */
  push(route) {
    if (!this.top() || this.top()?.page !== route.page) {
      this.navStack.push(route);
    }
  }

  /**
   * Replaces the top route object in the navigation stack with a new route object.
   *
   * @param {RoutePage} route - The new route object.
   */
  replace(route) {
    if (!this.top() || this.top()?.page !== route.page) {
      this.navStack[this.navStack.length - 1] = route;
    }
  }

  /**
   * Removes and returns the top route object from the navigation stack.
   *
   * @returns {RoutePage | undefined} The top route object, or undefined if the navigation stack is
   *   empty.
   */
  pop() {
    return this.navStack.pop();
  }

  /**
   * Returns the top route object from the navigation stack without removing it.
   *
   * @returns {RoutePage | undefined} The top route object, or undefined if the navigation stack is
   *   empty.
   */
  top() {
    return this.navStack.length > 0 ? this.navStack[this.navStack.length - 1] : undefined;
  }

  /**
   * Checks if a navigation is a backward navigation.
   *
   * @param {Navigation} newNav - The new navigation object.
   * @returns {boolean} True if the navigation is a backward navigation, false otherwise.
   */
  isBackwardNavigation(newNav) {
    const lastNav = this.lastNavigation();
    return lastNav && newNav.from === lastNav.to && newNav.to === lastNav.from;
  }

  /**
   * Updates the navigation stack based on the given route objects.
   *
   * @param {RoutePage} routeFrom - The route object representing the starting page.
   * @param {RoutePage} routeTo - The route object representing the destination page.
   * @returns {RoutePage | undefined} The top route object after the update.
   */
  update(routeFrom, routeTo) {
    const nav = this.createNavigation(routeFrom, routeTo);
    if (this.isBackwardNavigation(nav)) {
      while (this.isSkipNavigation(this._reverseNavigation(this.lastNavigation()))) {
        this.pop();
      }
      this.pop();
    } else {
      this.push(routeTo);
    }
    return this.top();
  }

  /** Clears the navigation stack. */
  clear() {
    this.navStack = [];
  }

  /**
   * Replaces the top route object in the navigation stack with a new route object, or pushes the
   * new route object if the navigation stack is empty.
   *
   * @param {RoutePage} route - The new route object.
   */
  replaceRoute(route) {
    if (this.navStack.length > 0) {
      this.navStack[this.navStack.length - 1] = route;
    } else {
      this.push(route);
    }
  }

  /**
   * Clears the navigation stack until the specified page is found.
   *
   * @param {string} targetPage - The page name to clear until.
   */
  clearUntil(targetPage) {
    if (this.navStack.find(route => route.page === targetPage)) {
      let currentRoute = null;
      do {
        currentRoute = this.navStack.pop();
      } while (currentRoute && currentRoute.page != targetPage);
    }
  }
}
