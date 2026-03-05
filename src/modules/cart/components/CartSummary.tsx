"use client";

import Link from "next/link";

interface CartSummaryProps {
  itemCount?: number;
}

export function CartSummary({ itemCount = 0 }: CartSummaryProps) {
  return (
    <Link
      href="/cart"
      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      <span>Carrinho</span>
      {itemCount > 0 && (
        <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs text-white dark:bg-gray-100 dark:text-gray-900">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
