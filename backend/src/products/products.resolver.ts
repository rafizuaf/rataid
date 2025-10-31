import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductsService } from './products.service';
import { Product, ProductConnection } from './types/product.model';
import { CreateProductInput, UpdateProductInput } from './types/product.input';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Query(() => Product, { nullable: true })
  product(@Args('id', { type: () => ID }) id: string) {
    return this.productsService.findById(id);
  }

  @Query(() => ProductConnection)
  products(
    @Args('name', { type: () => String, nullable: true }) name?: string,
    @Args('category', { type: () => String, nullable: true }) category?: string,
    @Args('active', { type: () => Boolean, nullable: true }) active?: boolean,
    @Args('slug', { type: () => String, nullable: true }) slug?: string,
    @Args('first', { type: () => Int, nullable: true }) first?: number,
    @Args('after', { type: () => String, nullable: true }) after?: string,
  ) {
    return this.productsService.paginate({ name, category, active, slug }, first ?? 10, after);
  }

  @Mutation(() => Product)
  createProduct(@Args('input') input: CreateProductInput) {
    return this.productsService.create(input);
  }

  @Mutation(() => Product)
  updateProduct(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateProductInput,
  ) {
    return this.productsService.update(id, input);
  }

  @Mutation(() => Boolean)
  deleteProduct(@Args('id', { type: () => ID }) id: string) {
    return this.productsService.delete(id);
  }
}