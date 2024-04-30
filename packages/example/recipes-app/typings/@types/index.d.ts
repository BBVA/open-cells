// type CustomElementClass = Omit<typeof HTMLElement, 'new'>;
// type CustomElementClass = Omit<typeof HTMLElement, 'new'>;
// interface LitElement extends CustomElementClass {}
// interface _PageTransitionsMixin extends LitElement {}

// // // Declare mixin assuming it takes a LitElement constructor and returns a PageTransitionsMixin
// declare function PageTransitionsMixin<T extends LitElement>(
//   base: T,
// ): T & (new (...args: any[]) => _PageTransitionsMixin);

type Recipe = {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strMealThumb: string;
  strInstructions: string;
  strYoutube: string;
};

type Category = {
  strCategory: string;
  strCategoryDescription: string;
  strCategoryThumb: string;
};
