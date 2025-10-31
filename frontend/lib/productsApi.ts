import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  ProductsQuery,
  ProductsQueryVariables,
  CreateProductMutation,
  CreateProductMutationVariables,
  UpdateProductMutation,
  UpdateProductMutationVariables,
  DeleteProductMutation,
  DeleteProductMutationVariables,
} from '@/graphql/generated';
import type { GraphQLResponse, FetchBaseQueryResult } from '@/lib/types/graphql';

export type { Product, ProductEdge, PageInfo, ProductConnection } from '@/lib/types/products';

const graphqlBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3001/graphql',
});

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: async (args, api, extraOptions) => {
    const result = await graphqlBaseQuery(args, api, extraOptions);

    if ('error' in result) {
      return result;
    }

    if ('data' in result && result.data && typeof result.data === 'object' && result.data !== null) {
      const graphqlResponse = result.data as GraphQLResponse<unknown>;

      const hasErrors = graphqlResponse.errors && Array.isArray(graphqlResponse.errors) && graphqlResponse.errors.length > 0;

      const hasNullData = graphqlResponse.data === null;

      if (hasErrors || hasNullData) {
        const errors = graphqlResponse.errors || [];
        const errorMessage = errors[0]?.message || 'GraphQL error';
        return {
          error: {
            status: 'CUSTOM_ERROR' as const,
            error: errorMessage,
            data: errors[0] || { message: errorMessage },
          },
        };
      }
    }

    return result;
  },
  tagTypes: ['Product'],
  endpoints: (build) => ({
    getProducts: build.query<
      ProductsQuery['products'],
      ProductsQueryVariables
    >({
      query: (vars) => ({
        url: '',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          query: `query Products($name: String, $category: String, $active: Boolean, $slug: String, $first: Int, $after: String) { products(name: $name, category: $category, active: $active, slug: $slug, first: $first, after: $after) { edges { cursor node { id sku slug name priceCents currency active categories } } pageInfo { endCursor hasNextPage } } }`,
          variables: vars,
        },
      }),
      transformResponse: (resp: GraphQLResponse<Pick<ProductsQuery, 'products'>>): ProductsQuery['products'] => {
        if (resp.errors && Array.isArray(resp.errors) && resp.errors.length > 0) {
          throw new Error(resp.errors[0]?.message || 'GraphQL error');
        }

        if (!resp.data?.products) {
          throw new Error('No data received');
        }

        return resp.data.products;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.edges.map((e) => ({ type: 'Product' as const, id: e.node.id })),
            { type: 'Product' as const, id: 'LIST' },
          ]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),

    createProduct: build.mutation<
      CreateProductMutation['createProduct'],
      CreateProductMutationVariables
    >({
      query: ({ input }) => ({
        url: '',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          query: `mutation CreateProduct($input: CreateProductInput!) { createProduct(input: $input) { id sku slug name priceCents currency active categories } }`,
          variables: { input } as CreateProductMutationVariables,
        },
      }),
      transformResponse: (resp: GraphQLResponse<Pick<CreateProductMutation, 'createProduct'>>): CreateProductMutation['createProduct'] => {
        if (resp.errors && Array.isArray(resp.errors) && resp.errors.length > 0) {
          throw new Error(resp.errors[0]?.message || 'Failed to create product');
        }

        if (!resp.data?.createProduct) {
          throw new Error('Failed to create product');
        }

        return resp.data.createProduct;
      },
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProduct: build.mutation<
      UpdateProductMutation['updateProduct'],
      UpdateProductMutationVariables
    >({
      query: ({ id, input }) => ({
        url: '',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          query: `mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) { updateProduct(id: $id, input: $input) { id sku slug name priceCents currency active categories } }`,
          variables: { id, input } as UpdateProductMutationVariables,
        },
      }),
      transformResponse: (resp: GraphQLResponse<Pick<UpdateProductMutation, 'updateProduct'>>): UpdateProductMutation['updateProduct'] => {
        if (resp.errors && Array.isArray(resp.errors) && resp.errors.length > 0) {
          throw new Error(resp.errors[0]?.message || 'Product not found');
        }

        if (!resp.data?.updateProduct) {
          throw new Error('Product not found');
        }

        return resp.data.updateProduct;
      },
      invalidatesTags: (result) => (result ? [{ type: 'Product', id: result.id }] : []),
    }),

    deleteProduct: build.mutation<DeleteProductMutation['deleteProduct'], DeleteProductMutationVariables>({
      query: ({ id }) => ({
        url: '',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          query: `mutation DeleteProduct($id: ID!) { deleteProduct(id: $id) }`,
          variables: { id } as DeleteProductMutationVariables,
        },
      }),
      transformResponse: (resp: GraphQLResponse<Pick<DeleteProductMutation, 'deleteProduct'>>): DeleteProductMutation['deleteProduct'] => {
        if (resp.errors && Array.isArray(resp.errors) && resp.errors.length > 0) {
          throw new Error(resp.errors[0]?.message || 'Failed to delete product');
        }

        if (resp.data?.deleteProduct === undefined) {
          throw new Error('Failed to delete product');
        }

        return resp.data.deleteProduct;
      },
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
  }),
});

export const { useGetProductsQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation } = productsApi;


