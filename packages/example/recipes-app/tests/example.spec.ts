import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('navegar a la raíz de la app', async ({ page }) => {
  expect(page.url()).toBe('http://localhost:4173/');
});

test('has title', async ({ page }) => {
  await expect(page).toHaveTitle(/Example App/);
});

test('has dark mode', async ({ page }) => {
    const button = await page.getByRole('button', { name: 'Dark Mode' });
    await button.click();
    const htmlElement = await page.locator('html[lang="en"][color-scheme-dark="true"]');
    const colorSchemeDarkAttribute = await htmlElement.getAttribute('color-scheme-dark');
    expect(colorSchemeDarkAttribute).toBe('true');
});

test.describe('test app and its features', () => {

  test('has a categorylist', async ({ page }) => {
    const category= await page.locator('.categories-list');
    const childCount = await category.evaluate(list => list.children.length);
    await expect(childCount).toBeGreaterThan(0);
  });

  test('has a categorydetail', async ({ page }) => {
    const category= await page.locator('.categories-list');
    await category.locator('.category-item').nth(0).click();
    const regexPattern = /http:\/\/localhost:4173\/#!\/category\/\w+/;
    await expect(page.url()).toMatch(regexPattern);
  });

  test('has a categorydetail and back home button works', async ({ page }) => {
    const category= await page.locator('.categories-list');
    await category.locator('.category-item').nth(0).click();
    const regexPattern = /http:\/\/localhost:4173\/#!\/category\/\w+/;
    await expect(page.url()).toMatch(regexPattern);
    await page.getByText('arrow_back Back to home').click(); 
    await expect(page.url()).toBe('http://localhost:4173/#!/');
  });

  test('has a categorydetail and a recipe detail', async ({ page }) => {
    const category= await page.locator('.categories-list');
    await category.locator('.category-item').nth(0).click();
    await page.waitForSelector('category-page', { state: 'visible' });
    const element = await page.locator('category-page');
    const recipe = await element.locator('.recipe-title').nth(0);
    await recipe.click();
    const regexPattern = /http:\/\/localhost:4173\/#!\/recipe\/\d+/;
    await expect(page.url()).toMatch(regexPattern);
  });

  test('has a categorydetail and a recipe detail and back to home', async ({ page }) => {
    const category= await page.locator('.categories-list');
    await category.locator('.category-item').nth(0).click();
    await page.waitForSelector('category-page', { state: 'visible' });
    const element = await page.locator('category-page');
    const recipe = await element.locator('.recipe-title').nth(0);
    await recipe.click();
    const regexPattern = /http:\/\/localhost:4173\/#!\/recipe\/\d+/;
    await expect(page.url()).toMatch(regexPattern);
    await page.waitForSelector('recipe-page', { state: 'visible' });
    const recipePage = await page.locator('recipe-page');
    await recipePage.getByText('arrow_back Back to home').click();
    await expect(page.url()).toBe('http://localhost:4173/#!/');
  });

  test('has a categorydetail and a recipe detail and back to Categories', async ({ page }) => {
    const category= await page.locator('.categories-list');
    await category.locator('.category-item').nth(0).click();
    await page.waitForSelector('category-page', { state: 'visible' });
    const element = await page.locator('category-page');
    const recipe = await element.locator('.recipe-title').nth(0);
    await recipe.click();
    await page.waitForSelector('recipe-page', { state: 'visible' });
    const recipePage = await page.locator('recipe-page');
    await recipePage.locator('.page-header-actions md-outlined-button').click();
    const regexPattern = /http:\/\/localhost:4173\/#!\/category\/\w+/;
    await expect(page.url()).toMatch(regexPattern);
  });



});




