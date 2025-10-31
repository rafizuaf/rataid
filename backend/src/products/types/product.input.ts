import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class CreateProductInput {
  @Field()
  @IsString()
  sku!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  slug?: string;

  @Field()
  @IsString()
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsInt()
  @Min(0)
  priceCents!: number;

  @Field()
  @IsString()
  currency!: string;

  @Field()
  @IsBoolean()
  active!: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  categories?: string[];
}

@InputType()
export class UpdateProductInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sku?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  priceCents?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  currency?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  categories?: string[];
}


