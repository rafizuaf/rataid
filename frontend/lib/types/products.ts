/**
 * Product domain types
 * These types represent the product domain model used throughout the application
 */

/**
 * Product entity
 */
export type Product = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  priceCents: number;
  currency: string;
  active: boolean;
  categories: string[];
};

/**
 * Pagination metadata
 */
export type PageInfo = {
  endCursor?: string;
  hasNextPage: boolean;
};

/**
 * Edge in a paginated connection
 */
export type ProductEdge = {
  cursor: string;
  node: Product;
};

/**
 * Paginated product connection
 */
export type ProductConnection = {
  edges: ProductEdge[];
  pageInfo: PageInfo;
};

