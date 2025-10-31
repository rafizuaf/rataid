"use client";
import { ReactNode } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";

export function GraphQLProvider({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider store={store}>
      {children}
      <Toaster richColors position="top-right" />
    </ReduxProvider>
  );
}