"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import type { Product } from "@/lib/productsApi";
import { Dispatch, SetStateAction, useState } from "react";
import { Package, DollarSign, Tag, Trash2, CheckCircle2, XCircle, Hash, Power, Edit } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Props = {
  items: Product[];
  setItems: Dispatch<SetStateAction<Product[]>>;
  onDelete: (id: string) => Promise<void>;
  onToggleActive?: (id: string, active: boolean) => Promise<void>;
  onEdit?: (product: Product) => void;
  isDeleting?: boolean;
  isFetching?: boolean;
};

export function ProductList({ items, setItems, onDelete, onToggleActive, onEdit, isDeleting, isFetching }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {items.map((p) => (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 border border-gray-200">
              <CardContent className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 truncate mb-1">{p.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={p.active ? "default" : "secondary"}
                        className={cn(
                          "text-xs",
                          p.active
                            ? "bg-green-500 hover:bg-green-600 text-white border-green-600"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300"
                        )}
                      >
                        {p.active ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                  {onToggleActive && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col items-end gap-1 ml-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-xs font-medium transition-colors",
                                  p.active ? "text-green-600" : "text-gray-500"
                                )}
                              >
                                {p.active ? "Active" : "Inactive"}
                              </span>
                              <Switch
                                checked={p.active}
                                onCheckedChange={async (checked) => {
                                  if (togglingId === p.id) return;
                                  const snapshot = items;
                                  try {
                                    setTogglingId(p.id);
                                    setItems((prev) =>
                                      prev.map((item) =>
                                        item.id === p.id ? { ...item, active: checked } : item
                                      )
                                    );
                                    await onToggleActive(p.id, checked);
                                    toast.success(`Product ${checked ? "activated" : "deactivated"} successfully`);
                                  } catch (e: unknown) {
                                    setItems(snapshot);
                                    const message = e instanceof Error ? e.message : "Toggle failed";
                                    toast.error(message);
                                  } finally {
                                    setTogglingId(null);
                                  }
                                }}
                                disabled={togglingId === p.id || !!isDeleting}
                                aria-label={`Toggle product ${p.active ? "inactive" : "active"}`}
                                className={cn(
                                  p.active
                                    ? "data-[state=checked]:bg-green-500! data-[state=checked]:hover:bg-green-600!"
                                    : "data-[state=checked]:bg-gray-400"
                                )}
                              />
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                              <Power className="h-3 w-3" />
                              <span>Status</span>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">
                            {p.active
                              ? "Click to deactivate this product"
                              : "Click to activate this product"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>

                <div className="space-y-2 flex-1 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Hash className="h-3.5 w-3.5 text-gray-400" />
                    <span className="font-mono text-xs">{p.sku}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Tag className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs truncate">{p.slug}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <DollarSign className="h-3.5 w-3.5 text-green-600" />
                    <span className="font-semibold">{(p.priceCents / 100).toFixed(2)} {p.currency}</span>
                  </div>
                  {p.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {p.categories.slice(0, 3).map((cat, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                      {p.categories.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{p.categories.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-auto">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 disabled:opacity-50"
                      onClick={() => onEdit(p)}
                      disabled={deletingId === p.id || !!isDeleting}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className={onEdit ? "flex-1" : "w-full"}
                        disabled={deletingId === p.id || !!isDeleting}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete <strong>{p.name}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            const snapshot = items;
                            try {
                              setDeletingId(p.id);
                              setItems((prev) => prev.filter((it) => it.id !== p.id));
                              await onDelete(p.id);
                              toast.success("Product deleted successfully");
                            } catch (e: unknown) {
                              setItems(snapshot);
                              const message = e instanceof Error ? e.message : "Delete failed";
                              toast.error(message);
                            } finally {
                              setDeletingId(null);
                            }
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
      {!isFetching && items.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="col-span-full flex flex-col items-center justify-center py-16"
        >
          <Package className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-500 mb-1">No products found</p>
          <p className="text-sm text-gray-400">Try adjusting your filters or create a new product</p>
        </motion.div>
      )}
    </div>
  );
}


