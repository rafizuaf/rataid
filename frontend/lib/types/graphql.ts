/**
 * Reusable GraphQL infrastructure types
 * These types are used across all GraphQL API implementations
 */

/**
 * Standard GraphQL error structure as defined by the GraphQL specification
 */
export type GraphQLError = {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
};

/**
 * Standard GraphQL response structure
 * @template T The type of the data payload
 */
export type GraphQLResponse<T> = {
  data: T | null;
  errors?: GraphQLError[];
};

/**
 * RTK Query's fetchBaseQuery result structure
 * @template T The type of the GraphQL data payload
 */
export type FetchBaseQueryResult<T> =
  | { data: GraphQLResponse<T> }
  | { error: { status: number | string; error?: string; data?: unknown } };

