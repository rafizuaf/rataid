"use client";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useGetProductsQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation, type Product } from "@/lib/productsApi";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/catalog/StatsCard";
import { ProductList } from "@/components/catalog/ProductList";
import { SearchCard } from "@/components/catalog/SearchCard";
import { ProductFormModal, type ProductFormValues } from "@/components/catalog/ProductFormModal";
import { ChevronDown, AlertCircle, Plus } from "lucide-react";

export default function Home() {
  const [filters, setFilters] = useState<{ name?: string; category?: string; active?: boolean; slug?: string }>({});
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [after, setAfter] = useState<string | undefined>(undefined);
  const [pageSize] = useState<number>(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { data, isFetching, error, refetch } = useGetProductsQuery({ ...debouncedFilters, first: pageSize, after });
  const [createProduct, createState] = useCreateProductMutation();
  const [updateProduct, updateState] = useUpdateProductMutation();
  const [deleteProduct, deleteState] = useDeleteProductMutation();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedFilters(filters), 300);
    return () => clearTimeout(t);
  }, [filters]);

  const productsPage = useMemo<Product[]>(() => data?.edges?.map((e) => e.node) ?? [], [data]);
  const pageInfo = data?.pageInfo;
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    if (!data) return;
    if (!after) {
      setItems(productsPage);
    } else {
      setItems((prev: Product[]) => {
        const map = new Map<string, Product>(prev.map((p) => [p.id, p]));
        for (const p of productsPage) map.set(p.id, p);
        return Array.from(map.values());
      });
    }
  }, [data, after, productsPage]);

  const handleSearch = (f: typeof filters) => {
    setFilters(f);
    setAfter(undefined);
    refetch();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Stats Section */}
          <StatsCard items={items} isFetching={isFetching} />

          {/* Search Section */}
          <SearchCard
            isFetching={isFetching}
            onSearch={handleSearch}
            filters={filters}
          />

          {/* Products Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Products</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {items.length} {items.length === 1 ? "product" : "products"} found
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedProduct(null);
                      setModalOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Product
                  </Button>
                </div>

                {error && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Error loading products</p>
                      <p className="text-xs text-red-600 mt-1">
                        {error instanceof Error ? error.message : "An unknown error occurred"}
                      </p>
                    </div>
                  </div>
                )}

                {isFetching && items.length === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="h-full">
                        <CardContent className="p-5">
                          <Skeleton className="h-6 w-3/4 mb-3" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-5/6 mb-2" />
                          <Skeleton className="h-4 w-4/6 mb-4" />
                          <Skeleton className="h-9 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <ProductList
                  items={items}
                  setItems={setItems}
                  isDeleting={deleteState.isLoading}
                  isFetching={isFetching}
                  onDelete={async (id: string) => {
                    await deleteProduct({ id }).unwrap();
                  }}
                  onToggleActive={async (id: string, active: boolean) => {
                    await updateProduct({
                      id,
                      input: { active },
                    }).unwrap();
                    refetch();
                  }}
                  onEdit={(product) => {
                    setSelectedProduct(product);
                    setModalOpen(true);
                  }}
                />

                {pageInfo?.hasNextPage && (
                  <div className="flex justify-center mt-6">
                    <Button
                      variant="outline"
                      size="lg"
                      disabled={isFetching || !pageInfo?.hasNextPage}
                      onClick={() => {
                        if (pageInfo?.endCursor) {
                          setAfter(pageInfo.endCursor);
                        }
                      }}
                      className="gap-2"
                    >
                      {isFetching ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Load More
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Product Form Modal */}
          <ProductFormModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            product={selectedProduct}
            isSubmitting={selectedProduct ? updateState.isLoading : createState.isLoading}
            onSubmit={async (values: ProductFormValues) => {
              if (selectedProduct) {
                try {
                  const updateInput: {
                    name?: string;
                    slug?: string;
                    active?: boolean;
                    priceCents?: number;
                    currency?: string;
                    categories?: string[];
                  } = {};

                  if (values.name && values.name.trim()) updateInput.name = values.name;
                  if (values.slug && values.slug.trim()) updateInput.slug = values.slug;
                  if (values.active !== undefined) updateInput.active = values.active;
                  if (values.priceCents !== undefined && values.priceCents >= 0) updateInput.priceCents = values.priceCents;
                  if (values.currency && values.currency.trim()) updateInput.currency = values.currency;
                  if (values.categories !== undefined && values.categories.trim()) {
                    updateInput.categories = values.categories
                      .split(",")
                      .map((s: string) => s.trim())
                      .filter(Boolean);
                  }

                  await updateProduct({
                    id: selectedProduct.id,
                    input: updateInput,
                  }).unwrap();
                  toast.success("Product updated successfully");
                  refetch();
                } catch (e: unknown) {
                  const message = e instanceof Error ? e.message : "Update failed";
                  toast.error(message);
                  throw e;
                }
              } else {
                if (!values.sku || !values.name || values.priceCents === undefined || !values.currency) {
                  throw new Error("SKU, name, price, and currency are required");
                }
                const tempId = `tmp_${Date.now()}`;
                const optimistic: Product = {
                  id: tempId,
                  sku: values.sku,
                  slug: values.slug || values.name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-"),
                  name: values.name,
                  priceCents: values.priceCents,
                  currency: values.currency,
                  active: values.active ?? true,
                  categories: (values.categories || "")
                    .split(",")
                    .map((s: string) => s.trim())
                    .filter(Boolean),
                };
                const snapshot = items;
                setItems((prev) => [optimistic, ...prev]);
                try {
                  const created = await createProduct({
                    input: {
                      sku: values.sku,
                      slug: values.slug || undefined,
                      name: values.name,
                      priceCents: values.priceCents,
                      currency: values.currency,
                      active: values.active ?? true,
                      categories: optimistic.categories,
                    },
                  }).unwrap();
                  setItems((prev) => [created, ...prev.filter((p) => p.id !== tempId)]);
                  toast.success("Product created successfully");
                  setAfter(undefined);
                } catch (e: unknown) {
                  setItems(snapshot);
                  const message = e instanceof Error ? e.message : "Create failed";
                  toast.error(message);
                  throw e;
                }
              }
            }}
          />
        </div>
      </main>
    </div>
  );
}
