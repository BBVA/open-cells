import { html, LitElement, nothing } from 'lit';
import { PageController } from '@open-cells/page-controller';
import { PageTransitionsMixin } from '@open-cells/page-transitions';
import { customElement, state, property } from 'lit/decorators.js';
import {
  getAllCategories,
  getMealsByCategory,
  getMealDetailsById,
} from '../../components/meals.js';
import '@material/web/button/outlined-button.js';
import '@material/web/icon/icon.js';
import { MdOutlinedIconButton } from '@material/web/iconbutton/outlined-icon-button.js';
import '@material/web/progress/circular-progress.js';
import '../../components/page-layout.js';
import { PageLayout } from '../../components/page-layout.js';

// @ts-ignore
@customElement('category-page')
export class CategoryPage extends PageTransitionsMixin(LitElement) {
  pageController = new PageController(this);
  
  private _layout: PageLayout | null = null;

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this.shadowRoot || this;
  }

  static inbounds = {
    _categoriesList: { channel: 'categories' },
    _likedRecipes: { channel: 'liked-recipes' },
  };

  @state()
  protected _currentCategory: Category | null = null;

  @state()
  protected _recipesList: { [key: string]: any } | null = null;

  @property({ type: Object })
  params: { category?: string } = {};

  willUpdate(props: any) {
    super.willUpdate?.(props);
    if (props.has('params') && this._categoriesList) {
      this.setCategory();
    }
  }

  async _getCurrentCategoryRecipes(categoryName: string) {
    if (this._recipesList?.[categoryName] || !categoryName) {
      return;
    }

    this._recipesList = null;
    const recipes = await getMealsByCategory(categoryName);

    this._recipesList = {
      ...(this._recipesList || {}),
      [categoryName]: recipes.meals,
    };
  }

  async firstUpdated(props: any) {
    super.firstUpdated(props);

    if (!this._categoriesList) {
      const { categories } = await getAllCategories();
      this.pageController.publish('categories', categories);
    }

    this.setCategory();

    this._layout = this.querySelector('page-layout');
  }

  async setCategory() {
    this._currentCategory = this._categoriesList?.find(
      (category: { strCategory: string }) =>
        category.strCategory?.toLowerCase() === this.params.category?.toLowerCase(),
    );
    if (this._currentCategory) {
      this._getCurrentCategoryRecipes(this._currentCategory.strCategory);
    }
  }

  render() {
    return html`
      <page-layout>
        ${this._currentCategory
          ? html` ${this._headerTpl} ${this._categoriesTpl} `
          : html`
              <md-circular-progress
                aria-label="Loading..."
                value="0.5"
                indeterminate
              ></md-circular-progress>
            `}
      </page-layout>
    `;
  }

  get _headerTpl() {
    return html`
      <div class="page-header">
        <ul class="page-header-sup">
          <li>
            <md-outlined-button
              aria-label="Back to home"
              href="#!/"
              @click="${() => this._navigateToHome}"
            >
              <md-icon filled slot="icon">arrow_back</md-icon>
              <span class="md-outlined-button-text">Back to</span> home
            </md-outlined-button>
          </li>
          <li>
            <md-outlined-button
              aria-label="favorite recipes"
              href="#!/favorite-recipes"
              @click="${() => this._navigateToFavoriteRecipes}"
            >
              <md-icon filled slot="icon">favorite</md-icon>
              ${this._likedRecipes.size}
              <span class="md-outlined-button-text">favorite recipes</span>
            </md-outlined-button>
          </li>
        </ul>

        <h2>${this._currentCategory?.strCategory}</h2>

        ${this._currentCategory?.strCategoryDescription
          ? html`<p class="categories-description">
              ${this._currentCategory.strCategoryDescription}
            </p>`
          : nothing}
      </div>
    `;
  }

  get _categoriesTpl() {
    return html`
      ${this._currentCategory && this._recipesList?.[this._currentCategory.strCategory]
        ? html`
            <ul class="page-categories categories-list">
              ${this._recipesList &&
              this._currentCategory &&
              this._recipesList[this._currentCategory.strCategory]?.map(
                (recipe: Recipe) => html`
                  <li class="category">
                    <div class="img-container">
                      <img src="${recipe.strMealThumb}" alt="" />
                    </div>

                    <a
                      class="recipe-title"
                      href="#!/recipe/${recipe.idMeal}"
                      @click="${(ev: CustomEvent) => this._navigateToRecipe(ev, recipe.idMeal)}"
                    >
                      ${recipe.strMeal}
                    </a>

                    <md-outlined-icon-button
                      md-outlined-icon-button
                      aria-label="Add receipe to favorite"
                      toggle
                      @click="${(ev: CustomEvent) => this._addLikedRecipes(ev, recipe)}"
                      ?selected="${Boolean(
                        [...this._likedRecipes].find(item => item.idMeal === recipe.idMeal),
                      )}"
                    >
                      <md-icon>favorite</md-icon>
                      <md-icon slot="selected" filled>favorite</md-icon>
                    </md-outlined-icon-button>
                  </li>
                `,
              )}
            </ul>
          `
        : html`
            <md-circular-progress
              aria-label="Loading..."
              value="0.5"
              indeterminate
            ></md-circular-progress>
          `}
    `;
  }

  _navigateToHome(ev: CustomEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this.pageController.navigate('home');
  }

  _navigateToFavoriteRecipes(ev: CustomEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this.pageController.navigate('favorite-recipes');
  }

  _navigateToRecipe(ev: CustomEvent, recipeId: string) {
    ev.preventDefault();
    ev.stopPropagation();
    this.pageController.navigate('recipe', { recipeId: recipeId });
  }

  async _addLikedRecipes(ev: CustomEvent, recipe: Recipe) {
    const favoriteRecipe = (await getMealDetailsById(recipe.idMeal)).meals[0];
    (ev.target as MdOutlinedIconButton).selected
      ? this._likedRecipes.add(favoriteRecipe)
      : this._delete(favoriteRecipe.idMeal, this._likedRecipes);
    this.pageController.publish('liked-recipes', this._likedRecipes);
    this.requestUpdate();
  }

  _delete(id: string, set: Set<{ idMeal: string }>) {
    for (const item of set) {
      if (item.idMeal === id) {
        set.delete(item);
      }
    }
  }

  onPageLeave() {
    this._layout?.resetScroll();
  }
}
