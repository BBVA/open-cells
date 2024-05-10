<div align="center">
  <img width="120rem" src="./assets/logo.svg" alt="Open Cells"/>
  <h1>Open Cells</h1>
</div>

_Un framework para construir aplicaciones web SPA basadas en web components y los estándares web_.

Read this in [English](./README.md)

**Open Cells** está hecho para ser ligero, fácil de usar y que a la vez permita crear SPAs de forma rápida. Para ello se encarga de los siguientes aspectos básicos de toda SPA:

- Routing.
- Manejo de estado, basado en el patrón pub-sub reactivo implementado sobre RxJs.
- Configuración.
- Bootstrapping.

Además, al estar basado en estándares web tiene una curva de aprendizaje muy baja: ya sabiendo HTML, CSS y Javascript sólo hay aprender un par de APIs y convenciones.

## Módulos

En este mono repo están los módulos que forman Open Cells:

- **`core`**: implementa routing, manejo de estado, configuración de app y el bootstrapping de la aplicación.
- **`element-controller`**: dota a los componentes de un mecanismo para usar el api de core (navegación, estado, configuración).
- **`page-controller`**: extensión de `element-controller` y provee hooks de ciclo de vida para manejar la carga de páginas.
- **`transitions`**: implementa animaciones de transición entre páginas.

Para crear una aplicación con Open Cells ejecuta:

```bash
npx @open-cells/create-app
```

Te pedirá que le des un nombre para la aplicación y te pedirá confirmar.

Al confirmar, creará un directorio con el nombre de la aplicación y dentro estarán los ficheros que la componen.

Este comando genera una aplicación de recetas de cocina como ejemplo, pero la estructura de directorios y ficheros es la misma para cualquier aplicación Open Cells.

Ahora entra en el directorio donde está la aplicación e instala sus dependencias.

```sh
npm install
```

Una vez instaladas las dependencias puedes probar la aplicación ejecutando:

```sh
npm run start
```

## Anatomía de una aplicación Open Cells

Open Cells no requiere una estructura de directorios específica, pero necesita que exista:

- una configuración de rutas
- componentes web que actúen como páginas

La aplicación que se crea con `npm init @open-cells/app` da como sugerencia la siguiente estructura:

```treeview
Root Directory/
|── package.json
|── tsconfig.json
|── index.html
|── images/
|   └── favicon.svg
└── src/
    |── components/
    |   |── app-index.ts
    |   └── app-index.css.js
    |── pages/
    |   └── home/
    |   |   └── home-page.ts
    |   └── second/
    |       └── second-page.ts
    |── css/
    |   |── home.css
    |   |── main.css
    |   └── second.css
    └── router/
        └── routes.ts
```

### Initialización de la APP

El documento en el que se montará la app es `index.html`. En su body, contiene el componente `<app-index id="app-content">` que contendrá las páginas de la app y la etiqueta `<script>` que invoca toda la lógica de Open Cells.

El fichero `src/components/app-index.ts` incluye los imports del core de Open Cells y la inicialización de la aplicación.

```js
import { startApp } from '@open-cells/core';
import { routes } from '../router/routes.js';

startApp({
  routes,
  mainNode: 'app-content',
});
```

`startApp` es la función que inicia la aplicación la cual requiere:

- `routes`: las rutas que maneja la aplicación. Las rutas las obtenemos del fichero `src/router/route.js` que expone un array de rutas.
- `mainNode`: el id del elemento HTML en el `index.html` donde se va a renderizar cada página.

## Routing

El enrutador de Open Cells opera mediante la asociación de una ruta con un componente (página). Cada vez que el fragmento de la URL cambia, el enrutador busca el componente asociado a esa ruta y lo renderiza dentro del elemento especificado con `mainNode`.

Una ruta se define con un objeto como este:

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

En este ejemplo:

- `path`: es la ruta definida. Puede contener parámetros dinámicos, como :category, que se pueden capturar y usar dentro del componente, asi mismo también soporta query params.
- `name`: es el nombre de la página asociada a la ruta. Esto facilita la navegación programática, ya que las páginas pueden llamar al método `navigate(name, params)` proporcionando el nombre de la página y los parámetros necesarios.
- `component`: (opcional) es el `tag name` del componente asociado a la ruta. Este componente se renderizará cuando el path de la ruta coincida. Si no se especifica el componente, se asume que el `tag name` del componente a renderizar es el `name` con el sufijo `-page`.
- `notFound`: nos permite identificar la pagina a la que redirigiremos en caso de no existir la ruta.
- `action`: es una función asíncrona que se ejecuta antes de renderizar el componente.

Como hemos visto antes, `startApp` recibe un array de rutas. Este array tiene objetos como el que hemos analizado arriba, cada uno definiendo una ruta.

👉🏻 La aplicación siempre arranca en la ruta `/` por lo que es necesario tener definida la ruta para el path `/`.

### Navegación programática:

Para navegar programáticamente entre páginas, asegúrate de que el componente página en el que te encuentras tenga un controlador de página (pageController) y llama al método `navigate(name, params)` proporcionando el nombre de la página y los parámetros necesarios.

```js
pageController.navigate('category', { category: 'example' });
```

## Estado y comunicación con RxJS

El estado de la aplicación se gestiona de forma reactiva mediante RxJS, utilizando las funciones publish y subscribe provistos por ElementController o PageController.

### Canales reactivos con RxJS

Los canales reactivos son implementados con RxJS, una biblioteca de JavaScript para programación reactiva. Estos canales permiten la comunicación global y la manipulación del estado de manera eficiente.

En un canal, cuando se publica un valor, este valor permanece en el canal hasta que se produzca otra publicación. Gracias a esto, los componentes que se suscriben a un canal pueden leer un valor que se ha publicado antes de su suscripción.

Esto permite implementar un patrón de publicador/suscriptor.

#### Funciones clave

- `publish`: la función publish permite enviar un valor a un canal, donde permanecerá hasta que se realice otra publicación.
- `subscribe`: la función subscribe permite que los componentes se suscriban a un canal para recibir y reaccionar a los valores publicados.
- `unsubscribe`: la función unsubscribe permite que los componentes dejen de actualizar su estado ya sea por que han sido desconectados, o por que necesitan dejar de recibir estos eventos por algún motivo.

#### Ventajas de RxJS

**Reactividad**: La programación reactiva facilita la gestión de eventos y el flujo de datos, lo que permite una comunicación dinámica entre los diferentes componentes de la aplicación.

**Centralización del control**: Al invocar las funciones `publish` y `subscribe` desde un controlador central, se facilita la gestión del estado de la aplicación y se promueve una arquitectura más organizada y mantenible.

**Eficiencia**: RxJS ofrece herramientas para gestionar eficientemente la comunicación y el estado de la aplicación, lo que resulta en un rendimiento óptimo incluso en aplicaciones complejas.

Con RxJS, la aplicación puede beneficiarse de una comunicación reactiva y eficiente, lo que facilita el desarrollo de interfaces de usuario dinámicas y responsivas.

### Canales Privados de Página

Cuando una página se inicializa, Cells automáticamente crea un canal privado asociado a ella, siguiendo este formato: `__bridge_page_` + _nombreDeLaPágina_.

```js
pageController.subscribe('__bridge_page_miPagina', () => {});
```

Estos canales son privados, lo que significa que son solo de lectura

- `onPageEnter` hook de página que permite gestionar los eventos al entrar una página en el viewport.
- `onPageLeave` hook de página que nos permite gestionar los eventos al salir una página del viewport.

### Canal de Contexto de Aplicación

Cuando una aplicación se inicia, se crea un canal privado(solo lectura)con el nombre \_\_bridge_app. Este es un canal dedicado para mantener un seguimiento del estado de la aplicación. El estado es un objeto que contiene la siguiente información:

- `currentPage`: el nombre de la página que está activa actualmente.
- `fromPage`: el nombre de la página activa anterior.

El canal de contexto de la aplicación permanece activo durante todo el ciclo de vida de la aplicación.

```js
pageController.subscribe('__bridge_app', appContext => {});
```

## Controllers

Las funciones de manejo de estado y routing de Open Cells son provistas mediante `reactive controllers`. Un controller es un objeto que puede agregarse a un componente para dotarle de una determinada funcionalidad.

Los controllers brindados por Open Cells son:

- `ElementController`: otorga la funcionalidad necesaria para la suscripción/publicación en canales y la navegación entre páginas.
- `PageController`: este controller extiende ElementController, agregando hooks para controlar la entrada y salida de una página.

### ElementController

- `subscribe(channelName, callback)`: se suscribe a un canal determinado `channelName`. Si el canal no existe, Open Cells lo crea en ese momento. La función `callback` se ejecuta cuando reacciona al cambio de estado (hay un nuevo valor en el canal).
- `unsubscribe(channelName)`: desuscribe el componente del canal `channelName`.
- `publish(channelName, value)`: publica el valor `value` en el canal `channelName`.
- `publishOn(channelName, htmlElement, eventName)`: cada vez que el elemento `htmlElement` dispare un evento `eventName`, el `detail.value` se publica en el canal `channelName`.
- `navigate(page, params)`: navega a la página `page` pasando los parámetros `params` (un objeto con pares clave/valor).
- `backStep()`: va a la última página visitada anteriormente.
- `getCurrentRoute()` devuelve información sobre la ruta actual.

### PageController

- `onPageEnter`: hook que se ejecuta cuando la página entra (se hace visible en el viewport y está activa).
- `onPageLeave`: hook que se ejecuta cuando la página sale (se oculta en el viewport y deja de estar activa).
