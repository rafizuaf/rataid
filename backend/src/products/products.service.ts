import { Injectable } from '@nestjs/common';
import { CreateProductInput, UpdateProductInput } from './types/product.input';
import { Product } from './types/product.model';
import { randomUUID } from 'crypto';

interface SearchFilter {
  name?: string;
  category?: string;
  active?: boolean;
  slug?: string;
}

@Injectable()
export class ProductsService {
  private readonly products: Product[] = [];
  private static skipMockDataForTesting = false;

  constructor() {
    if (!ProductsService.skipMockDataForTesting) {
      this.initializeMockData();
    }
    ProductsService.skipMockDataForTesting = false; // Reset after use
  }

  static skipMockData(): void {
    ProductsService.skipMockDataForTesting = true;
  }

  private initializeMockData(): void {
    const mockProducts: Array<Omit<Product, 'id'> & { id: string }> = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        sku: 'LAPTOP-001',
        slug: 'macbook-pro-16-inch',
        name: 'MacBook Pro 16-inch',
        description: 'Powerful 16-inch laptop with M3 Pro chip, perfect for professionals and creators.',
        priceCents: 249900,
        currency: 'USD',
        active: true,
        categories: ['electronics', 'laptop', 'computers'],
        deletedAt: null,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        sku: 'PHONE-002',
        slug: 'iphone-15-pro',
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system.',
        priceCents: 99900,
        currency: 'USD',
        active: true,
        categories: ['electronics', 'smartphone', 'mobile'],
        deletedAt: null,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        sku: 'HEADPHONE-003',
        slug: 'sony-wh-1000xm5',
        name: 'Sony WH-1000XM5 Wireless Headphones',
        description: 'Premium noise-cancelling headphones with exceptional sound quality and 30-hour battery life.',
        priceCents: 39900,
        currency: 'USD',
        active: true,
        categories: ['electronics', 'audio', 'headphones'],
        deletedAt: null,
      },
    ];

    mockProducts.forEach((product) => {
      const existingProduct = this.products.find((p) => p.id === product.id);
      if (!existingProduct) {
        this.products.push(product);
      }
    });
  }
  
  private slugify(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  
  private ensureUniqueSlug(base: string, ignoreId?: string): string {
    let candidate = base;
    let suffix = 2;
    while (this.products.some((p) => p.slug === candidate && p.id !== ignoreId)) {
      candidate = `${base}-${suffix++}`;
    }
    return candidate;
  }

  create(input: CreateProductInput): Product {
    if (this.products.some((p) => !p.deletedAt && p.sku === input.sku)) {
      throw new Error('SKU must be unique');
    }
    const baseSlug = input.slug ? this.slugify(input.slug) : this.slugify(input.name);
    const uniqueSlug = this.ensureUniqueSlug(baseSlug);
    const product: Product = {
      id: randomUUID(),
      sku: input.sku,
      slug: uniqueSlug,
      name: input.name,
      description: input.description ?? null,
      priceCents: input.priceCents,
      currency: input.currency,
      active: input.active,
      categories: input.categories ?? [],
      deletedAt: null,
    };
    this.products.push(product);
    return product;
  }

  update(id: string, input: UpdateProductInput): Product {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx < 0) {
      throw new Error('Product not found');
    }
    if (input.sku && this.products.some((p) => !p.deletedAt && p.sku === input.sku && p.id !== id)) {
      throw new Error('SKU must be unique');
    }
    const current = this.products[idx];
    let slug = current.slug;
    if (typeof input.slug === 'string' && input.slug.length > 0) {
      slug = this.ensureUniqueSlug(this.slugify(input.slug), id);
    }
    const updated: Product = {
      ...current,
      ...input,
      slug,
      description: input.description ?? current.description,
      categories: input.categories ?? current.categories,
    } as Product;
    this.products[idx] = updated;
    return updated;
  }

  delete(id: string): boolean {
    const product = this.products.find((p) => p.id === id);
    if (!product) return false;
    if (product.deletedAt) return false;
    product.deletedAt = new Date();
    return true;
  }

  findById(id: string): Product | undefined {
    const product = this.products.find((p) => p.id === id);
    if (!product) return undefined;
    if (product.deletedAt) return undefined;
    return product;
  }

  search(filter: SearchFilter): Product[] {
    return this.products.filter((p) => {
      if (p.deletedAt) return false;
      if (filter.slug && p.slug !== filter.slug) return false;
      if (filter.name && !p.name.toLowerCase().includes(filter.name.toLowerCase())) return false;
      if (filter.category && !p.categories.includes(filter.category)) return false;
      if (typeof filter.active === 'boolean' && p.active !== filter.active) return false;
      return true;
    });
  }

  paginate(filter: SearchFilter, first = 10, after?: string) {
    const all = this.search(filter);
    let startIndex = 0;
    if (after) {
      const idx = all.findIndex((p) => p.id === after);
      if (idx >= 0) startIndex = idx + 1;
    }
    const slice = all.slice(startIndex, startIndex + first);
    const last = slice[slice.length - 1];
    const endCursor = last ? last.id : undefined;
    const hasNextPage = startIndex + first < all.length;
    return {
      edges: slice.map((node) => ({ cursor: node.id, node })),
      pageInfo: { endCursor, hasNextPage },
    };
  }
}


