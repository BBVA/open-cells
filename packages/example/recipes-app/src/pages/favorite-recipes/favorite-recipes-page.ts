import { html, LitElement } from 'lit';
import { PageController } from '@open-cells/page-controller';
import { PageTransitionsMixin } from '@open-cells/page-transitions';
import { customElement, state } from 'lit/decorators.js';
import '@material/web/button/outlined-button.js';
import '@material/web/icon/icon.js';
import { MdOutlinedIconButton } from '@material/web/iconbutton/outlined-icon-button.js';
import '@material/web/progress/circular-progress.js';
import '../../components/page-layout.js';
import { PageLayout } from '../../components/page-layout.js';

// @ts-ignore
@customElement('favorite-recipes-page')
export class FavoriteRecipesPage extends PageTransitionsMixin(LitElement) {
  pageController = new PageController(this);

  private _layout: PageLayout | null = null;

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    // @ts-ignore
    return this;
  }

  @state()
  protected _likedRecipes: Set<Recipe> | null = null;

  connectedCallback() {
    super.connectedCallback();

    this.pageController.subscribe('liked-recipes', (data: Set<Recipe>) => {
      this._likedRecipes = data;
      this.requestUpdate();
    });
  }

  disconnectedCallback() {
    this.pageController.unsubscribe('liked-recipes');
    super.disconnectedCallback();
  }

  firstUpdated(props: any) {
    super.firstUpdated?.(props);

    this._layout = this.querySelector('page-layout');
  }

  render() {
    return html`
      <page-layout>
        ${this._headerTpl}
        ${this._likedRecipes && this._likedRecipes.size > 0
          ? this._likedRecipesTpl
          : html` <p class="no-favorites">No favorite recipes yet</p> `}
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
        </ul>

        <h2>Favorite recipes</h2>
      </div>
    `;
  }

  get _likedRecipesTpl() {
    return html`
      <ul class="page-categories categories-list">
        ${this._likedRecipes
          ? [...this._likedRecipes].map(
              recipe => html`
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

                  <div class="banner-text-actions">
                    <md-outlined-button
                      aria-label="${recipe.strCategory} category"
                      href="#!/category/${recipe.strCategory.toLowerCase()}"
                      @click="${(ev: CustomEvent) =>
                        recipe.strCategory &&
                        this._navigateToCategory(ev, recipe.strCategory.toLowerCase())}"
                    >
                      ${recipe.strCategory}
                    </md-outlined-button>

                    <md-outlined-icon-button
                      aria-label="Add receipe to favorite"
                      toggle
                      @click="${(ev: CustomEvent) => this._addLikedRecipes(ev, recipe)}"
                      ?selected="${this._likedRecipes
                        ? Boolean(
                            [...this._likedRecipes].find(item => item.idMeal === recipe.idMeal),
                          )
                        : false}"
                    >
                      <md-icon>favorite</md-icon>
                      <md-icon slot="selected" filled>favorite</md-icon>
                    </md-outlined-icon-button>
                  </div>
                </li>
              `,
            )
          : ''}
      </ul>
    `;
  }

  _navigateToHome(ev: CustomEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this.pageController.navigate('home');
  }

  _navigateToRecipe(ev: CustomEvent, recipeId: string) {
    ev.preventDefault();
    ev.stopPropagation();
    this.pageController.navigate('recipe', { recipeId: recipeId });
  }

  _navigateToCategory(ev: CustomEvent, category: string) {
    ev.preventDefault();
    ev.stopPropagation();
    this.pageController.navigate('category', { category: category });
  }

  _addLikedRecipes(ev: CustomEvent, recipe: Recipe) {
    if (!this._likedRecipes) {
      return;
    }
    (ev.target as MdOutlinedIconButton).selected
      ? this._likedRecipes.add(recipe)
      : this._delete(recipe, this._likedRecipes);

    this.pageController.publish('liked-recipes', this._likedRecipes);
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
