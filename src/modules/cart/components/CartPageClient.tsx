"use client";

import Link from "next/link";
import { useCart } from "../hooks/useCart";
import { CartItem } from "./CartItem";

export function CartPageClient() {
  const { items, totalFormatted, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center dark:border-gray-800 dark:bg-gray-900/50">
        <p className="text-gray-600 dark:text-gray-400">
          Seu carrinho está vazio.
        </p>
        <Link
          href="/#planos"
          className="mt-4 inline-block font-medium text-gray-900 underline dark:text-gray-100"
        >
          Ver planos
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="flex-1 rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {items.map((item) => (
            <li key={item.id} className="px-4">
              <CartItem item={item} />
            </li>
          ))}
        </ul>
      </div>
      <div className="w-full shrink-0 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/50 lg:w-80">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Resumo
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {itemCount} {itemCount === 1 ? "item" : "itens"}
        </p>
        <p className="mt-4 flex justify-between text-lg font-semibold text-gray-900 dark:text-gray-100">
          <span>Total</span>
          <span>{totalFormatted}</span>
        </p>
        <Link
          href="/checkout"
          className="mt-6 block w-full rounded-md bg-gray-900 py-3 text-center font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
        >
          Finalizar compra
        </Link>
      </div>
    </div>
  );
}
