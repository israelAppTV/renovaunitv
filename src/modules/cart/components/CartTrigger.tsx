"use client";

import { useState } from "react";
import { useCart } from "../hooks/useCart";
import { CartDrawer } from "./CartDrawer";
import { cn } from "@/utils/cn";

interface CartTriggerProps {
  className?: string;
}

export function CartTrigger({ className }: CartTriggerProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <>
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
          className
        )}
        aria-label={`Abrir carrinho${itemCount > 0 ? `, ${itemCount} itens` : ""}`}
      >
        <span>Carrinho</span>
        {itemCount > 0 && (
          <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs text-white dark:bg-gray-100 dark:text-gray-900">
            {itemCount}
          </span>
        )}
      </button>
      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
