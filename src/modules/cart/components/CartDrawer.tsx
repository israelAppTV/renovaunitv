"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "../hooks/useCart";
import { CartItem } from "./CartItem";
import { cn } from "@/utils/cn";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, totalFormatted, itemCount } = useCart();

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        role="presentation"
        className="fixed inset-0 z-40 bg-black/50"
        aria-hidden
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl dark:bg-gray-900",
          "transition-transform duration-200 ease-out"
        )}
        aria-label="Carrinho de compras"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Carrinho {itemCount > 0 && `(${itemCount})`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Fechar carrinho"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">
              Seu carrinho está vazio.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item) => (
                <li key={item.id}>
                  <CartItem item={item} />
                </li>
              ))}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 dark:border-gray-800">
            <p className="flex justify-between text-lg font-semibold text-gray-900 dark:text-gray-100">
              <span>Total</span>
              <span>{totalFormatted}</span>
            </p>
            <Link
              href="/cart"
              onClick={onClose}
              className="mt-4 block w-full rounded-md bg-gray-900 py-3 text-center font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Ver carrinho / Finalizar
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
