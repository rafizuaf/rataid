"use client";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Package, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { Product } from "@/lib/productsApi";

type Props = {
  items: Product[];
  isFetching: boolean;
};

export function StatsCard({ items, isFetching }: Props) {
  const total = items.length;
  const active = items.filter((p) => p.active).length;
  const inactive = total - active;

  const stats = [
    {
      label: "Total Products",
      value: total,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      label: "Active",
      value: active,
      icon: CheckCircle2,
      color: "bg-green-500",
    },
    {
      label: "Inactive",
      value: inactive,
      icon: XCircle,
      color: "bg-gray-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-linear-to-br from-gray-50 to-gray-100/50 border border-gray-200"
                >
                  <div className={`${stat.color} p-3 rounded-lg shadow-sm`}>
                    {isFetching ? (
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
