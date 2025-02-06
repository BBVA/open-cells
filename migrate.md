# migración de aplicaciones

1. construir locales (van en app/locales/locales.json) y sass
1. reconstruir rutas
1. mv app/tpl/index.tpl ./index.html y reemplazar placeholders
1. Modificar package.json:
  Agregar scripts al package.json
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "npm run build && vite preview",
    "test": "playwright test"
  }
 quitar:
    "@cells/cells-bridge": "^3.19.2"
    "@webcomponents/webcomponentsjs": "^2.7.0",
    "cells-app-template": "^6.0.0",
 agregar
    "@bbva-cells/bridge": "^4.0.0"


app/scripts/app-modules.js
```js
//import './app-bootstrap.js';
import './app.js';
```

app/scripts/app.js old
```js
import { ROUTES } from './app-routes';

(function() {
  'use strict';
  window.CellsPolymer.start({ routes: ROUTES });
}());
```

app/scripts/app.js new
```js
import { startCore } from '@bbva-cells/bridge';
import { ROUTES } from './app-routes';
import { appConfig } from '../config/dev.js';

startCore({
  routes: ROUTES,
  mainNode: 'app__content',
  viewLimit: 2,
  persistentPages: ['dashboard'],
  appConfig,
  commonPages: ['dashboard', 'help']
});
```

1. Cambiar las rutas
```js
  routes: [{
    path: '/',
    page: 'login',
  }],
```

  por: 
```js
  routes: [{
    path: '/',
    name: 'login',
    component: 'login-page',
    action: async () => {
      await import('../pages/login/login-page.js');
    },
  }]
```

1. Migrar los ficheros de configuración como módulos ES
```js
const appConfig = {
  cells_properties: {},

  app_properties: {},
};

module.exports = appConfig;
```
cambiar por:
```js
export const appConfig = {} // contenido de app_properties
```

1. Eliminar scripts/lit-initial-components.js y scripts/lit-components.js. Los imports de 
scripts/lit-initial-components.js ponerlos en app-modules.js

1. Los ficheros de locales van en app/locales/locales.json

1. Actualizar las páginas cambiando 
import { CellsPageMixin as cellsPage } from '@cells/cells-page-mixin' y 
CellsElement por import { PageMixin } from '@open-cells/page-mixin';