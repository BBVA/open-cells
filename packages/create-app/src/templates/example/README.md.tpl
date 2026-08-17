# {{ name }}

An application built with [Open Cells](https://github.com/open-cells-project/open-cells) and [Lit](https://lit.dev).

This example app showcases a recipes browser powered by [The Meal DB](https://www.themealdb.com/api.php) API. It demonstrates multi-page navigation, shared state via channels, persistent pages, dark mode, and the Material Web components library.

## Getting started

```sh
npm install
npm run dev
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |

## Project structure

```
src/
  components/   App shell, page layout, meals service
  config/       App configuration (API endpoint)
  css/          Global styles, colors, fonts, Material theming
  pages/        Page components (home, category, recipe, favorite-recipes, not-found)
  router/       Route definitions
```

## Features

- Browse random daily recipe on the home page
- Explore recipes by category
- View full recipe details with ingredients and instructions
- Save favourite recipes (persisted to localStorage)
- Dark mode toggle
- Smooth page transitions
