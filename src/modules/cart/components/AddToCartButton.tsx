"use client";

import type { Product } from "@/types/product";
import { useCart } from "../hooks/useCart";
import { cn } from "@/utils/cn";

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  children?: React.ReactNode;
}

export function AddToCartButton({ product, className, children }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const hasStock = product.stock_count > 0;

  return (
    <button
      type="button"
      onClick={() => hasStock && addItem(product)}
      disabled={!hasStock}
      className={cn(
        "rounded-md px-4 py-2 text-sm font-medium transition",
        hasStock
          ? "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          : "cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
        className
      )}
    >
      {children ?? "Adicionar ao carrinho"}
    </button>
  );
}
