export type Navigation = {
  from?: string;
  to?: string;
  skipHistory?: boolean;
};

export type QueryParams = { [key: string]: string | number };

export type RoutePage = {
  page: string;
  params: QueryParams;
};

export type NavigationWithParams = {
  from?: RoutePage;
  to?: RoutePage;
};

