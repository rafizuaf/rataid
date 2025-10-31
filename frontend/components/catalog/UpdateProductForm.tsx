"use client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Edit, Hash, Tag, Package, CheckCircle2, XCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export const updateSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
  name: z.string().optional(),
  slug: z.string().optional(),
  active: z.boolean().optional(),
});
export type UpdateForm = z.infer<typeof updateSchema>;

type Props = {
  isSubmitting: boolean;
  onSubmit: (values: UpdateForm) => Promise<void>;
};

export function UpdateProductForm({ isSubmitting, onSubmit }: Props) {
  const form = useForm<UpdateForm>({
    resolver: zodResolver(updateSchema),
    defaultValues: { id: "", name: "", slug: "", active: undefined },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Edit className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Update Product</CardTitle>
              <CardDescription className="text-sm">Update product name, slug, or active status by product ID</CardDescription>
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
                  form.setError("id", { message: msg });
                }
              })}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5" />
                        Product ID *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Product ID" {...field} />
                      </FormControl>
                      <FormDescription>Enter the product ID to update</FormDescription>
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
                        New Name (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="New product name" {...field} />
                      </FormControl>
                      <FormDescription>Leave empty to keep current name</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5" />
                        New Slug (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="New slug" {...field} />
                      </FormControl>
                      <FormDescription>Leave empty to keep current slug</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>Toggle the product active status</FormDescription>
                    </div>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={field.value !== undefined ? field.value : false}
                          onCheckedChange={(checked) => field.onChange(checked)}
                          disabled={!form.watch("id")}
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
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[120px]">
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      Update Product
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


