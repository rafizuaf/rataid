"use client";
import { motion } from "framer-motion";
import { Package2 } from "lucide-react";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-600 text-white shadow-lg">
              <Package2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Product Catalog</h1>
              <p className="text-xs text-gray-500">GraphQL E-commerce System</p>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
