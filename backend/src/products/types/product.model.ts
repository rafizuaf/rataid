import { Field, ID, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class Product {
  @Field(() => ID)
  id!: string;

  @Field()
  sku!: string;

  @Field()
  slug!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field()
  priceCents!: number;

  @Field()
  currency!: string;

  @Field()
  active!: boolean;

  @Field(() => [String])
  categories!: string[];

  @Field(() => GraphQLISODateTime, { nullable: true })
  deletedAt?: Date | null;
}

@ObjectType()
export class PageInfo {
  @Field({ nullable: true })
  endCursor?: string;

  @Field()
  hasNextPage!: boolean;
}

@ObjectType()
export class ProductEdge {
  @Field()
  cursor!: string;

  @Field(() => Product)
  node!: Product;
}

@ObjectType()
export class ProductConnection {
  @Field(() => [ProductEdge])
  edges!: ProductEdge[];

  @Field(() => PageInfo)
  pageInfo!: PageInfo;
}


