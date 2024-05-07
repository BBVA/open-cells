<p align="center">
  <img
    width="120rem"
    src="./assets/logo.svg"
    alt="Open Cells"
  />
</p>
<h1 align="center">Open Cells</h1>

_A framework to build SPA web applications based on web components and web standards_.

Léelo en [Español](./README.es.md)

**Open Cells** is made to be light, easy to use and will help you to create SPAs faster. To do so it will handle the basics of every SPA:
- Routing.
- State management, based on a pub-sub reactive pattern implementing RxJS.
- App Configuration.
- Bootstrapping.

Besides, as it is based on web standards its learning curve is really low: having knowledge about HTML, CSS and Javascript you only need to learn a couple of APIs and conventions.

## Modules

In this mono repo we have the modules that builds up Open Cells:

- **`core`**: implements routing, state handling, app configuration and bootstrapping of the application.
- **`element-controller`**: provides the components the mechanisms to use the core API (navigation, state, configuration)
- **`page-controller`**: extends `element-controller` and provides lifecycle hooks to handle page loading.

<br/>

To create an application with Open Cells run:

```sh
npx @open-cells/create-app
```

You will be asked to enter a name for the application and once you confirm it a folder will be created with the application inside.

This command creates a recipes application as an example, but the folder and files structure may be the same for every Open Cells application.

After this you need to install the dependencies.

```sh
npm install
```

Once everything is installed, you can try the application running:

```sh
npm run start
```

## Application anatomy

Open Cells won't require an specific folder structure but, it needs for these to exists:

- routes configuration
- web components to implement the pages

The app created in the previous step follows this structure as a suggestion:

```
Root Directory/
|── web-dev-server.config.js
|── package.json
|── tsconfig.json
|── index.html
|── src/
    |── config/
        └── app-config.js
    |── components/
    |── pages/
    |   └── home/
    |       └── home-page.ts
    |── css/
    └── routes/
        └── routes.ts
```

In `index.html` file you'll find:

- an element with `id`, in which the pages will be rendered.

```html
<app-index id="app__content"></app-index>
```

- an import with `app-index.ts` file.

```html
<script type="module" src="src/components/app-index.ts"></script>
```

Inside this file the application is loaded calling the function `startApp` imported from `@open-cells/core`.

```js
import { startApp } from '@open-cells/core';

startApp({
  routes,
  mainNode: 'app__content',
});
```

`startApp` is the functions that initialize the application which requires:

- `routes`: the routes that the application will handle. These routes we'll get them from the file `src/router/route.js` which exposes an array of routes.
- `mainNode`: the id of HTML element from `index.html` where every page will be rendered.

## Routing

The router from Open Cells works with the association of a route with a component (page). Every time the url fragment changes, the router look for the component for that route and it will render it inside the element specified in `mainNode`.

A route is defined with an object like this:

```js
{
  path: '/category/:category',
  name: 'category',
  component: 'category-page',
  notFound: false,
  action: async () => {
    await import('../pages/category/category-page.js');
  },
},
```

In this example:

- `path`: is the defined route. It may contain dynamic parameters, like :category, which may be used inside the page component. Query parameters are supported too.
- `name`: is the name assigned to the route. The purpose of this is to ease the programmatic navigation, because pages can use the function `navigate(name, params)` indicating the name of the route and the needed parameters.
- `component`: (optional) is the `tag name` of the web component associated to the route. This component will be rendered when the route matches the path. If component is not specified, the router will assume the `tag name` of the component to be rendered will be `name` concatenated with `-page` suffix.
- `notFound`: allows us to identify the page that we want to use when a requested route doesn't exist.
- `action`: is the asynchronous function to be executed before rendering the page component.

As we explained earlier, `startApp` input is a routes array. This array have objects like the one over this line, each one defining a route.

👉🏻 The application always starts with the path `/` so it's mandatory to have a route defined for it.

### Programmatic navigation

To navigate programmatically, be sure your origin page component has a page controller so you can use function `navigate(name, params)` providing the name of the route and the params if needed.

```js
pageController.navigate('category', { category: 'example' });
```

## State and communication with RxJS

The state of the application is handled in a reactive way using RxJS through the functions _publish_ and _subscribe_ provided by ElementController or PageController.

### Reactive channels with RxJS

Reactive channels are implemented with RxJS, a Javascript library for reactive programming. These channels allow global communication and the handling of the state efficiently.

When a value is published in a channel, this value stays in the channels until another publication is done. This allows the components to read the value when they subscribe to a channel even if it's published before the subscription.

#### Key functions

- `publish`: allows to send a value into a channel, where it will stays until another publication is made.

- `subscribe`: allows the components to create a subscription to a channel to receive and react to the published values.

- `unsubscribe`: allows the components to stop the subscription to a channel so it won't be updated with values anymore.

#### Advantages of RxJS

**Reactivity**: Reactive programming provides event handling and data flow, which allows a dynamic communication among the application components.

**Control centralization**: As `publish` and `subscribe` functions are invoked from a central controller, it makes easier to manage the application state and it promotes a more organized and efficient architecture.

**Efficiency**: RxJS offers tools to manage efficiently the communication and the state of the application, giving a great performance even in big and complex applications.

With RxJS, the application may benefit of a reactive and efficient communication, which makes easy the development of dynamic and responsive user interfaces.

### Page hooks

When a page is initialized OpenCells automatically include in its lifecycle a couple of hooks to allow the component know when the router navigates to and from the page.

- `onPageEnter` page hook that allows the component handle its state when it enters the viewport.
- `onPageLeave` page hook that allows the component handle its state when it exits the viewport.

## Controllers

The functions of state handling and routing in Open Cells are provided through `reactive controllers`. A controllers is an object that can be included in any component to give it some functionality.

Open Cells controllers are:

- `ElementController`: provides the functions to publish on and subscribe to channels and to navigate between pages.
- `PageController`: extends ElementController and on top of that it includes hooks to handle the entry/exit of a page.

### ElementController

- `subscribe(channelName, callback)`: it subscribes to the channel indicated in `channelName`. If the channel doesn't exist, Open Cells will create it at that point. Function `callback` will be called when there is a new state in the channel (a new value is published).

- `unsubscribe(channelName)`: it stops the subscription of the component to the channel `channelName`.

- `publish(channelName, value)`: it publishes `value` in the channel `channelName`.

- `publishOn(channelName, htmlElement, eventName)`: every time the element `htmlElement` dispatches the event `eventName`, the `detail.value` of the event is published on `channelName`.

- `navigate(page, params)`: navigates to `page` passing the parameters `params` (must be a key/value object).

- `backStep()`: navigates to the previous page in the history.

- `getCurrentRoute()` get the information about the current route.

### PageController

As extends the ElementController it gets all its functionality and these two hooks:

- `onPageEnter`: page hook that allows the component handle its state when it enters the viewport.

- `onPageLeave`: page hook that allows the component handle its state when it exits the viewport.
