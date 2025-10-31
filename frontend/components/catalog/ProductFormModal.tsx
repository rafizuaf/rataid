"use client";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Hash, Tag, DollarSign, Package, CheckCircle2, XCircle } from "lucide-react";
import type { Product } from "@/lib/productsApi";

const baseProductSchema = z.object({
  sku: z.string().optional(),
  slug: z.string().optional(),
  name: z.string().optional(),
  priceCents: z.number().optional(),
  currency: z.string().optional(),
  active: z.boolean().optional(),
  categories: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof baseProductSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  isSubmitting: boolean;
  onSubmit: (values: ProductFormValues) => Promise<void>;
};

export function ProductFormModal({ open, onOpenChange, product, isSubmitting, onSubmit }: Props) {
  const isUpdateMode = !!product;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(baseProductSchema),
    defaultValues: {
      sku: "",
      slug: "",
      name: "",
      priceCents: 0,
      currency: "USD",
      active: true,
      categories: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (isUpdateMode && product) {
        form.reset({
          sku: product.sku,
          slug: product.slug,
          name: product.name,
          priceCents: product.priceCents,
          currency: product.currency,
          active: product.active,
          categories: product.categories.join(", "),
        });
      } else {
        form.reset({
          sku: "",
          slug: "",
          name: "",
          priceCents: 0,
          currency: "USD",
          active: true,
          categories: "",
        });
      }
    }
  }, [open, isUpdateMode, product, form]);

  const handleSubmit = async (values: ProductFormValues) => {
    if (!isUpdateMode) {
      if (!values.sku || !values.sku.trim()) {
        form.setError("sku", { message: "SKU is required" });
        return;
      }
      if (!values.name || !values.name.trim()) {
        form.setError("name", { message: "Name is required" });
        return;
      }
      if (values.priceCents === undefined || values.priceCents < 0) {
        form.setError("priceCents", { message: "Price must be at least 0" });
        return;
      }
      if (!values.currency || !values.currency.trim()) {
        form.setError("currency", { message: "Currency is required" });
        return;
      }
    }

    try {
      await onSubmit(values);
      form.reset();
      onOpenChange(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      if (isUpdateMode) {
        if (msg.toLowerCase().includes("sku")) form.setError("sku", { message: msg });
        else if (msg.toLowerCase().includes("name")) form.setError("name", { message: msg });
      } else {
        if (msg.toLowerCase().includes("sku")) form.setError("sku", { message: msg });
        else form.setError("name", { message: msg });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl lg:max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isUpdateMode ? "bg-blue-500/10" : "bg-green-500/10"}`}>
              {isUpdateMode ? (
                <Edit className="h-5 w-5 text-blue-600" />
              ) : (
                <Plus className="h-5 w-5 text-green-600" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl">
                {isUpdateMode ? "Update Product" : "Create New Product"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {isUpdateMode
                  ? "Update product information. Leave fields empty to keep current values."
                  : "Add a new product to the catalog. All fields marked with * are required."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {isUpdateMode && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Updating:</strong> {product?.name} ({product?.sku})
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!isUpdateMode && (
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5" />
                        SKU *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="PROD-001" {...field} />
                      </FormControl>
                      <FormDescription>Unique product identifier</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Package className="h-3.5 w-3.5" />
                      Product Name {!isUpdateMode && "*"}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Product Name" {...field} />
                    </FormControl>
                    <FormDescription>
                      {isUpdateMode ? "Leave empty to keep current name" : "Display name for the product"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5" />
                    Slug {isUpdateMode && "(Optional)"}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="product-name" {...field} />
                  </FormControl>
                  <FormDescription>
                    {isUpdateMode
                      ? "Leave empty to keep current slug"
                      : "URL-friendly identifier (auto-generated if empty)"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priceCents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-3.5 w-3.5" />
                      Price (cents) {!isUpdateMode && "*"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="9999"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      {isUpdateMode
                        ? "Leave empty to keep current price"
                        : "Price in smallest currency unit"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-3.5 w-3.5" />
                      Currency {!isUpdateMode && "*"}
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder={isUpdateMode ? "Keep current currency" : "Select currency"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="IDR">IDR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      {isUpdateMode ? "Leave empty to keep current currency" : "Product currency"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        {isUpdateMode ? "Toggle the product active status" : "Product active status"}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={field.value !== undefined ? field.value : false}
                          onCheckedChange={(checked) => field.onChange(checked)}
                        />
                        {field.value !== undefined && (
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            {field.value ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-gray-500" />
                                Inactive
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <FormControl>
                      <Input placeholder="electronics, laptop" {...field} />
                    </FormControl>
                    <FormDescription>
                      {isUpdateMode
                        ? "Leave empty to keep current categories (comma-separated)"
                        : "Comma-separated categories"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[120px]">
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {isUpdateMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {isUpdateMode ? (
                      <>
                        <Edit className="h-4 w-4" />
                        Update Product
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Create Product
                      </>
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
