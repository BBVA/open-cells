import { html, LitElement } from 'lit';
import { PageTransitionsMixin } from '@open-cells/page-transitions';
import { customElement, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { getRandomMeal, getAllCategories } from '../../components/meals.js';
import '@material/web/button/outlined-button.js';
import '@material/web/icon/icon.js';
import { MdOutlinedIconButton } from '@material/web/iconbutton/outlined-icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/list/list-item.js';
import '@material/web/list/list.js';
import '../../components/page-layout.js';
import { PageLayout } from '../../components/page-layout.js';
import { PageMixin } from '@open-cells/page-mixin';

// @ts-ignore
@customElement('home-page')
export class HomePage extends PageTransitionsMixin(PageMixin(LitElement)) {
  protected createRenderRoot(): Element | ShadowRoot {
    // @ts-ignore
    return this;
  }

  @state()
  protected _randomRecipe: Recipe | null = null;

  @state()
  protected _categoriesList: Category[] | null = null;

  @state()
  protected _likedRecipes: Set<Recipe> | null = null;

  @state()
  protected _layout: PageLayout | null = null;

  connectedCallback() {
    ``;
    super.connectedCallback();

    this.subscribe('random-recipe', (data: Recipe) => {
      this._randomRecipe = data;
    });

    this.subscribe(
      'categories',
       (data: Category[]) => {
        this._categoriesList = data;
      },
    );

    this.subscribe(
      'liked-recipes',
      (data: Set<Recipe>)=> {
        this._likedRecipes = data;
        this.requestUpdate();
      },
    );
  }

  disconnectedCallback() {
    this.unsubscribe('random-recipe');
    this.unsubscribe('categories');
    this.unsubscribe('liked-recipes');
    super.disconnectedCallback();
  }

  async firstUpdated(props: any) {
    super.firstUpdated?.(props);

    if (!this._randomRecipe) {
      const recipe = await getRandomMeal();
      this.publish('random-recipe', recipe?.meals?.[0]);
    }

    if (!this._categoriesList) {
      const { categories } = await getAllCategories();
      categories.sort((a: Category, b: Category) => a.strCategory.localeCompare(b.strCategory));
      this.publish('categories', categories);
    }

    this._layout = this.querySelector('page-layout');
  }

  render() {
    return html`
      <page-layout>
        <div class="home-header">
          <h2>Welcome to Cells Recipes. A very tasteful app</h2>

          <md-outlined-button
            aria-label="favorite recipes"
            @click="${() => this.navigate('favorite-recipes')}"
          >
            <md-icon filled slot="icon">favorite</md-icon>
            ${this._likedRecipes?.size}
            <span class="md-outlined-button-text">favorite recipes</span>
          </md-outlined-button>
        </div>

        <div class="banner">
          ${this._randomRecipe
            ? html`${this._bannerTpl}`
            : html`
                <md-circular-progress
                  aria-label="Loading..."
                  value="0.5"
                  indeterminate
                ></md-circular-progress>
              `}
        </div>

        <div class="recipes-categories">
          <h3>Recipes Categories</h3>
          ${this._categoriesList
            ? html`${this._categoriesTpl}`
            : html`
                <md-circular-progress
                  aria-label="Loading..."
                  value="0.5"
                  indeterminate
                ></md-circular-progress>
              `}
        </div>
      </page-layout>
    `;
  }

  get _bannerTpl() {
    return html`
      <div class="img-container">
        <img
          src="${this._randomRecipe?.strMealThumb || ''}"
          alt="${this._randomRecipe?.strMeal || ''}"
        />
      </div>

      <div class="banner-text">
        <div class="banner-text-heading">
          <p class="heading-h3">Daily Special</p>
          <a
            class="recipe-title"
            href="#!/recipe/${this._randomRecipe?.idMeal}"
            @click="${(ev: CustomEvent) =>
              this._randomRecipe && this._navigateToRecipe(ev, this._randomRecipe?.idMeal)}"
            >${this._randomRecipe?.strMeal}</a
          >
        </div>

        <div class="banner-text-actions">
          <md-outlined-button
            aria-label="${this._randomRecipe?.strCategory} category"
            href="#!/category/${this._randomRecipe?.strCategory.toLowerCase()}"
            @click="${(ev: CustomEvent) =>
              this._randomRecipe?.strCategory &&
              this._navigateToCategory(ev, this._randomRecipe?.strCategory.toLowerCase())}"
          >
            ${this._randomRecipe?.strCategory}
          </md-outlined-button>

          <md-outlined-icon-button
            aria-label="Add recipe to favorite"
            toggle
            @click="${(ev: CustomEvent) =>
              this._randomRecipe && this._addLikedRecipes(ev, this._randomRecipe)}"
            ?selected="${Boolean(
              this._likedRecipes
                ? [...this._likedRecipes].find(item => item.idMeal === this._randomRecipe?.idMeal)
                : false,
            )}"
          >
            <md-icon>favorite</md-icon>
            <md-icon slot="selected" filled>favorite</md-icon>
          </md-outlined-icon-button>
        </div>
      </div>
    `;
  }

  get _categoriesTpl() {
    return html`
      <md-list aria-label="Recipes Categories" class="categories-list">
        ${map(
          this._categoriesList || [],
          item => html`
            <md-list-item
              type="link"
              class="category-item"
              href="#!/category/${item.strCategory.toLowerCase()}"
              @click="${(ev: CustomEvent) =>
                this._navigateToCategory(ev, item.strCategory.toLowerCase())}"
            >
              <img class="category-image" slot="start" src="${item.strCategoryThumb}" alt="" />
              <p>${item.strCategory}</p>
            </md-list-item>
          `,
        )}
      </md-list>
    `;
  }

  _navigateToRecipe(ev: CustomEvent, recipeId: string) {
    ev.preventDefault();
    ev.stopPropagation();
    this.navigate('recipe', { recipeId: recipeId });
  }

  _navigateToCategory(ev: CustomEvent, category: string) {
    ev.preventDefault();
    ev.stopPropagation();
    this.navigate('category', { category: category });
  }

  _addLikedRecipes(ev: CustomEvent, recipe: Recipe) {
    if (!this._likedRecipes) {
      return;
    }
    (ev.target as MdOutlinedIconButton).selected
      ? this._likedRecipes?.add(recipe)
      : this._delete(recipe, this._likedRecipes);
    this.publish('liked-recipes', this._likedRecipes);
    this.requestUpdate();
  }

  _delete(recipe: Recipe, set: Set<Recipe>) {
    for (const item of set) {
      if (item.idMeal === recipe.idMeal) {
        set.delete(item);
      }
    }
  }

  onPageLeave() {
    this._layout?.resetScroll();
  }
}
