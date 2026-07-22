import { getConfig } from '@open-cells/core';

type RecipesActions = {
  search: string;
  random: string;
  lookup: string;
  categories: string;
  list: string;
  filter: string;
};

const defaultActions: RecipesActions = {
  search: 'search.php',
  random: 'random.php',
  lookup: 'lookup.php',
  categories: 'categories.php',
  list: 'list.php',
  filter: 'filter.php',
};

const recipesService = getConfig()?.appConfig?.recipesService as
  | { basePath?: string; userId?: string; actions?: Partial<RecipesActions> }
  | undefined;

const { basePath, userId, actions = defaultActions } = recipesService ?? {};

function getFetchUrl(action: string, param?: string, paramValue?: string): URL {
  const pathParts = [basePath, userId, action].filter(Boolean);
  const pathname = pathParts.join('/');
  const data = new URL(pathname);
  if (param && paramValue) {
    data.searchParams.set(param, paramValue);
  }
  return data;
}

async function fetchMeal(
  action: keyof RecipesActions,
  param?: string,
  paramValue?: string,
): Promise<any> {
  try {
    const endpoint = actions[action];
    if (!endpoint) {
      return null;
    }
    const url = getFetchUrl(endpoint, param, paramValue);
    console.log('Fetching:', url.toString());
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Fetch failed:', response.status, response.statusText);
      return null;
    }
    const data = await response.json();
    console.log('Fetch successful:', action, data);
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

/* HOME */ export const getRandomMeal = async () => fetchMeal('random');
export const getMealByName = async (mealName: string) => fetchMeal('search', 's', mealName);
export const getMealsByInitial = async (mealInitial: string) =>
  fetchMeal('search', 'f', mealInitial);

/* RECIPE */ export const getMealDetailsById = async (id: string) => fetchMeal('lookup', 'i', id);

/* HOME, CATEGORY */ export const getAllCategories = async () => fetchMeal('categories');
export const getCategoriesList = async () => fetchMeal('list', 'c', 'list');
export const getAreasList = async () => fetchMeal('list', 'a', 'list');

/* INGREDIENTS */ export const getIngredientsList = async () => fetchMeal('list', 'i', 'list');
export const getMealsByMainIngredient = async (ingredient: string) =>
  fetchMeal('filter', 'i', ingredient);
export const getMealsByCategory = async (category: string) => fetchMeal('filter', 'c', category);
export const getMealsByArea = async (area: string) => fetchMeal('filter', 'a', area);
