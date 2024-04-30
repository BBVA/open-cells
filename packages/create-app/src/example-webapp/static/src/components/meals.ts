import { getConfig } from '@open-cells/core';

const {
  appConfig: {
    recipesService: { basePath = undefined, userId = undefined, actions = undefined } = {},
  } = {},
} = getConfig();

function getFetchUrl(action: string, param?: string, paramValue?: string): URL {
  const data = new URL(`${basePath}/${userId}/${action}`);
  if (param && paramValue) {
    data.searchParams.set(param, paramValue);
  }
  return data;
}

async function fetchMeal(
  action: keyof typeof actions,
  param?: string,
  paramValue?: string,
): Promise<any> {
  const data = await fetch(getFetchUrl(actions[action], param, paramValue));
  return data.json();
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
