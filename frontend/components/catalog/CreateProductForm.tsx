"use client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Plus, Hash, Tag, DollarSign, Package, CheckCircle2, XCircle } from "lucide-react";

export const createSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  slug: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  priceCents: z.number().min(0, "Price must be at least 0"),
  currency: z.string().min(1, "Currency is required"),
  active: z.boolean(),
  categories: z.string(),
});
export type CreateForm = z.infer<typeof createSchema>;

type Props = {
  isSubmitting: boolean;
  onSubmit: (values: CreateForm) => Promise<void>;
};

export function CreateProductForm({ isSubmitting, onSubmit }: Props) {
  const form = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { sku: "", slug: "", name: "", priceCents: 0, currency: "USD", active: true, categories: "" },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Plus className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Create New Product</CardTitle>
              <CardDescription className="text-sm">Add a new product to the catalog</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                try {
                  await onSubmit(values);
                  form.reset();
                } catch (e) {
                  const msg = e instanceof Error ? e.message : "Error";
                  if (msg.toLowerCase().includes("sku")) form.setError("sku", { message: msg });
                  else form.setError("name", { message: msg });
                }
              })}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Package className="h-3.5 w-3.5" />
                        Product Name *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Product Name" {...field} />
                      </FormControl>
                      <FormDescription>Display name for the product</FormDescription>
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
                      Slug (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="product-name" {...field} />
                    </FormControl>
                    <FormDescription>URL-friendly identifier (auto-generated if empty)</FormDescription>
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
                        Price (cents) *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="9999"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Price in smallest currency unit</FormDescription>
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
                        Currency *
                      </FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="IDR">IDR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
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
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value ? "true" : "false"}
                        onValueChange={(v) => field.onChange(v === "true")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              Active
                            </div>
                          </SelectItem>
                          <SelectItem value="false">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-gray-500" />
                              Inactive
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
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
                      <FormDescription>Comma-separated categories</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[120px]">
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Product
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}