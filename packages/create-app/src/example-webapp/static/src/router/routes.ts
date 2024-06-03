import { RouteDefinition } from '@open-cells/core/types'; // Import the missing 'RouteDefinition' type

export const routes: RouteDefinition[] = [
  {
    path: '/',
    name: 'home',
    component: 'home-page',
    action: async () => {
      await import('../pages/home/home-page.js');
    },
  },
  {
    path: '/category/:category',
    name: 'category',
    component: 'category-page',
    action: async () => {
      await import('../pages/category/category-page.js');
    },
  },
  {
    path: '/recipe/:recipeId',
    name: 'recipe',
    component: 'recipe-page',
    action: async () => {
      await import('../pages/recipe/recipe-page.js');
    },
  },
  {
    path: '/favorite-recipes',
    name: 'favorite-recipes',
    component: 'favorite-recipes-page',
    action: async () => {
      await import('../pages/favorite-recipes/favorite-recipes-page.js');
    },
  },
  {
    path: '/not-found',
    name: 'not-found',
    notFound: false,
    component: 'not-found-page',
    action: async () => {
      await import('../pages/not-found/not-found-page.js');
    },
  },
];
