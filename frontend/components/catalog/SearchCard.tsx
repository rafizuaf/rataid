"use client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter } from "lucide-react";
import { useState } from "react";

type Filters = { name?: string; category?: string; active?: boolean; slug?: string };

type Props = {
  isFetching: boolean;
  onSearch: (filters: Filters) => void;
  filters: Filters;
};

export function SearchCard({ isFetching, onSearch, filters }: Props) {
  const [local, setLocal] = useState<Filters>(filters);

  const hasActiveFilters = Object.values(local).some((v) => v !== undefined && v !== "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(local);
  };

  const handleReset = () => {
    setLocal({});
    onSearch({});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Filter className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Search & Filter</CardTitle>
              <CardDescription className="text-sm">Find products by name, category, slug, or status</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Product Name</Label>
                <Input
                  id="name"
                  placeholder="Search by name..."
                  value={local.name || ""}
                  onChange={(e) => setLocal({ ...local, name: e.target.value || undefined })}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                <Input
                  id="category"
                  placeholder="Filter by category..."
                  value={local.category || ""}
                  onChange={(e) => setLocal({ ...local, category: e.target.value || undefined })}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium">Slug</Label>
                <Input
                  id="slug"
                  placeholder="Search by slug..."
                  value={local.slug || ""}
                  onChange={(e) => setLocal({ ...local, slug: e.target.value || undefined })}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select
                  value={
                    local.active === undefined
                      ? "any"
                      : local.active
                        ? "true"
                        : "false"
                  }
                  onValueChange={(v) =>
                    setLocal({
                      ...local,
                      active: v === "any" ? undefined : v === "true",
                    })
                  }
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Any Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Status</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button type="submit" disabled={isFetching} className="gap-2">
                <Search className="h-4 w-4" />
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={!hasActiveFilters || isFetching}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Reset
              </Button>
              {hasActiveFilters && (
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-gray-500">Active filters:</span>
                  {local.name && (
                    <Badge variant="secondary" className="gap-1">
                      Name: {local.name}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setLocal({ ...local, name: undefined })}
                      />
                    </Badge>
                  )}
                  {local.category && (
                    <Badge variant="secondary" className="gap-1">
                      Category: {local.category}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setLocal({ ...local, category: undefined })}
                      />
                    </Badge>
                  )}
                  {local.slug && (
                    <Badge variant="secondary" className="gap-1">
                      Slug: {local.slug}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setLocal({ ...local, slug: undefined })}
                      />
                    </Badge>
                  )}
                  {local.active !== undefined && (
                    <Badge variant="secondary" className="gap-1">
                      Status: {local.active ? "Active" : "Inactive"}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setLocal({ ...local, active: undefined })}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}


