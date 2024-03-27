const basePath = `https://www.themealdb.com/api/json/v1`;
const userId = `1`;

const actions = {
  search: 'search.php',
  random: 'random.php',
  lookup: 'lookup.php',
  categories: 'categories.php',
  list: 'list.php',
  filter: 'filter.php',
};

function getFetchUrl(action, param, paramValue) {
  const data = new URL(`${basePath}/${userId}/${action}`);
  if (param) {
    data.searchParams.set(param, paramValue);
  }
  return data;
}

async function fetchMeal(action, param, paramValue) {
  const data = await fetch(getFetchUrl(actions[action], param, paramValue));
  return data.json();
}

/* HOME */ export const getRandomMeal = async () => fetchMeal('random');
export const getMealByName = async mealName => fetchMeal('search', 's', mealName);
export const getMealsByInitial = async mealInitial => fetchMeal('search', 'f', mealInitial);

/* RECIPE */ export const getMealDetailsById = async id => fetchMeal('lookup', 'i', id);

/* HOME, CATEGORY */ export const getAllCategories = async () => fetchMeal('categories');
export const getCategoriesList = async () => fetchMeal('list', 'c', 'list');
export const getAreasList = async () => fetchMeal('list', 'a', 'list');

/* INGREDIENTS */ export const getIngredientsList = async () => fetchMeal('list', 'i', 'list');
export const getMealsByMainIngredient = async ingredient => fetchMeal('filter', 'i', ingredient);
export const getMealsByCategory = async category => fetchMeal('filter', 'c', category);
export const getMealsByArea = async area => fetchMeal('filter', 'a', area);

/*
Meal Thumbnail Images
Add /preview to the end of the meal image URL
/images/media/meals/llcbn01574260722.jpg/preview

Ingredient Thumbnail Images
www.themealdb.com/images/ingredients/Lime.png
www.themealdb.com/images/ingredients/Lime-Small.png
*/
