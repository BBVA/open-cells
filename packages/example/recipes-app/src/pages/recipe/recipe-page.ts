import { html, LitElement, nothing } from 'lit';
import { PageController } from '@open-cells/page-controller';
import { customElement, state, property } from 'lit/decorators.js';
import { getMealDetailsById } from '../../components/meals.js';
import '@material/web/button/outlined-button.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import '@material/web/progress/circular-progress.js';
import '../../components/page-layout.js';

@customElement('recipe-page')
export class RecipePage extends LitElement {
  pageController = new PageController(this);

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  @state()
  protected _recipe = null;

  @state()
  protected _likedRecipes = new Set();

  @state()
  protected _layout;

  @property({ type: Object })
  params = {};

  connectedCallback() {
    super.connectedCallback();

    this.pageController.subscribe('liked-recipes', data => {
      this._likedRecipes = data;
    });
  }

  disconnectedCallback() {
    this.pageController.unsubscribe('liked-recipes');
    super.disconnectedCallback();
  }

  willUpdate(props) {
    super.willUpdate?.(props);

    if (props.has('_recipe') && this._recipe) {
      this._recipeInstructions = this._recipe.strInstructions.split('\n');
    }
  }

  firstUpdated(props) {
    super.firstUpdated?.(props);

    this._layout = this.querySelector('page-layout');
  }

  async updated(props) {
    super.updated?.(props);

    if (props.has('params') && this.params.recipeId) {
      if (this.params.recipeId === props.get('params').recipeId) {
        return;
      }

      this._recipe = null;
      const recipe = await getMealDetailsById(this.params.recipeId);
      this._recipe = recipe.meals[0];
    }
  }

  render() {
    return html`
      <page-layout>
        ${this._recipe
          ? html` ${this._headerTpl} ${this._recipeTpl} `
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

        <h2>${this._recipe.strMeal}</h2>

        <div class="page-header-actions">
          <md-outlined-button
            aria-label="${this._recipe.strCategory} category"
            href="#!/category/${this._recipe.strCategory.toLowerCase()}"
            @click="${ev => this._navigateToCategory(ev, this._recipe.strCategory.toLowerCase())}"
          >
            ${this._recipe.strCategory}
          </md-outlined-button>

          <md-outlined-icon-button
            aria-label="Add receipe to favorite"
            toggle
            @click="${ev => this._addLikedRecipes(ev, this._recipe)}"
            ?selected="${[...this._likedRecipes].find(item => item.idMeal === this._recipe.idMeal)}"
          >
            <md-icon>favorite</md-icon>
            <md-icon slot="selected" filled>favorite</md-icon>
          </md-outlined-icon-button>
        </div>
      </div>
    `;
  }

  get _recipeTpl() {
    return html`
      <div class="recipe-ingredients">
        <div class="recipe-img">
          <img src="${this._recipe.strMealThumb}" alt="" />
        </div>

        <div class="ingredients-list">
          <h3>Ingredients</h3>
          <ul>
            ${Object.keys(this._recipe)
              .filter(key => key.includes('strIngredient') && this._recipe[key])
              .map(
                key => html`
                  <li>
                    <p>${this._recipe[key]}</p>
                    <p>${this._recipe[`strMeasure${key.split('strIngredient')[1]}`]}</p>
                  </li>
                `,
              )}
          </ul>

          ${this._recipe.strYoutube
            ? html`
                <a class="youtube" href="${this._recipe.strYoutube}" target="_blank">
                  <md-icon filled>smart_display</md-icon>
                  See recipe in Youtube
                </a>
              `
            : nothing}
        </div>

        <div class="recipe-instructions">
          <h3>Instructions</h3>
          ${this._recipeInstructions.map(instruction => html` <p>${instruction}</p> `)}
        </div>
      </div>
    `;
  }

  _navigateToHome(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.pageController.navigate('home');
  }

  _navigateToFavoriteRecipes(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.pageController.navigate('favorite-recipes');
  }

  _navigateToCategory(ev, category) {
    ev.preventDefault();
    ev.stopPropagation();
    this.pageController.navigate('category', { category: category });
  }

  _addLikedRecipes(ev, recipe) {
    ev.target.selected
      ? this._likedRecipes.add(recipe)
      : this._delete(recipe, this._likedRecipes);

    this.pageController.publish('liked-recipes', this._likedRecipes);
    this.requestUpdate();
  }

  _delete(recipe, set) {
    for (const item of set) {
      if (item.idMeal === recipe.idMeal) {
        set.delete(item);
      }
    }
  }

  onPageLeave() {
    this._layout.resetScroll()
  }
}
