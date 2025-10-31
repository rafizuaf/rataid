import { ProductsService } from './products.service';
import { CreateProductInput } from './types/product.input';

describe('ProductsService (unit)', () => {
  let service: ProductsService;

  const makeInput = (overrides: Partial<CreateProductInput> = {}): CreateProductInput => ({
    sku: 'SKU-1',
    name: 'Test Product',
    description: 'desc',
    priceCents: 1234,
    currency: 'USD',
    active: true,
    categories: ['cat-1'],
    ...overrides,
  });

  beforeEach(() => {
    ProductsService.skipMockData();
    service = new ProductsService();
  });

  it('creates product with deletedAt=null', () => {
    const p = service.create(makeInput());
    expect(p.deletedAt).toBeNull();
  });

  it('creates slug from name when slug missing and enforces uniqueness', () => {
    const p1 = service.create(makeInput({ name: 'My Product', sku: 'SKU-1' }));
    const p2 = service.create(makeInput({ name: 'My Product', sku: 'SKU-2' }));
    expect(p1.slug).toBe('my-product');
    expect(p2.slug).toBe('my-product-2');
  });

  it('normalizes provided slug and ensures uniqueness', () => {
    const p1 = service.create(makeInput({ slug: '  Bad SLUG!!  ', sku: 'SKU-1' }));
    const p2 = service.create(makeInput({ slug: 'Bad   slug', sku: 'SKU-2' }));
    expect(p1.slug).toBe('bad-slug');
    expect(p2.slug).toBe('bad-slug-2');
  });

  it('soft deletes a product and returns true', () => {
    const p = service.create(makeInput());
    const result = service.delete(p.id);
    expect(result).toBe(true);
    const byId = (service as any).products.find((x: any) => x.id === p.id);
    expect(byId.deletedAt).toBeInstanceOf(Date);
  });

  it('delete returns false for non-existent id', () => {
    expect(service.delete('missing')).toBe(false);
  });

  it('delete returns false for already deleted product', () => {
    const p = service.create(makeInput());
    expect(service.delete(p.id)).toBe(true);
    expect(service.delete(p.id)).toBe(false);
  });

  it('findById excludes soft-deleted products', () => {
    const p = service.create(makeInput());
    expect(service.findById(p.id)).toBeDefined();
    service.delete(p.id);
    expect(service.findById(p.id)).toBeUndefined();
  });

  it('findById returns undefined for missing product', () => {
    expect(service.findById('nope')).toBeUndefined();
  });

  it('search excludes soft-deleted products', () => {
    const a = service.create(makeInput({ name: 'Alpha', sku: 'A', categories: ['x'] }));
    const b = service.create(makeInput({ name: 'Beta', sku: 'B', categories: ['y'] }));
    const c = service.create(makeInput({ name: 'Gamma', sku: 'C', categories: ['x'] }));
    service.delete(b.id);

    const all = service.search({});
    expect(all.map(p => p.id)).toEqual([a.id, c.id]);

    const byName = service.search({ name: 'a' });
    expect(byName.map(p => p.id).sort()).toEqual([a.id, c.id].sort());

    const byCategory = service.search({ category: 'y' });
    expect(byCategory.length).toBe(0);
  });

  it('search can filter by slug, category, and active', () => {
    const a = service.create(makeInput({ name: 'Alpha', sku: 'A', categories: ['c1'], active: true }));
    const b = service.create(makeInput({ name: 'Beta', sku: 'B', categories: ['c2'], active: false }));
    const bySlug = service.search({ slug: a.slug });
    expect(bySlug.map(p => p.id)).toEqual([a.id]);
    const byActiveTrue = service.search({ active: true });
    expect(byActiveTrue.map(p => p.id)).toEqual([a.id]);
    const byActiveFalse = service.search({ active: false });
    expect(byActiveFalse.map(p => p.id)).toEqual([b.id]);
    const byCategory = service.search({ category: 'c2' });
    expect(byCategory.map(p => p.id)).toEqual([b.id]);
  });

  it('update throws when product not found', () => {
    expect(() => service.update('missing', { name: 'X' })).toThrow('Product not found');
  });

  it('update preserves unspecified fields and recomputes slug when provided', () => {
    const p = service.create(makeInput({ name: 'Prod One', description: 'd1', categories: ['a'] }));
    const updated = service.update(p.id, { name: 'Prod One Updated', slug: 'New Slug' });
    expect(updated.name).toBe('Prod One Updated');
    expect(updated.slug).toBe('new-slug');
    expect(updated.description).toBe('d1');
    expect(updated.categories).toEqual(['a']);
  });

  it('update keeps slug if not provided and maintains uniqueness across others', () => {
    const p1 = service.create(makeInput({ name: 'First', sku: 'SKU-1' }));
    const p2 = service.create(makeInput({ name: 'First', sku: 'SKU-2' }));
    expect(p1.slug).toBe('first');
    expect(p2.slug).toBe('first-2');
    const updatedP1 = service.update(p1.id, { name: 'FirstX' });
    expect(updatedP1.slug).toBe('first');
    const updatedP2 = service.update(p2.id, { slug: 'First' });
    expect(updatedP2.slug).toBe('first-2');
  });
});


