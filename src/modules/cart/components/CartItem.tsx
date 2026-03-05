"use client";

import type { CartItem as CartItemType } from "@/types/cart";
import { formatPrice } from "@/utils/formatPrice";
import { useCart } from "../hooks/useCart";
import { cn } from "@/utils/cn";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23e5e7eb'%3E%3Crect width='100' height='100'/%3E%3C/svg%3E";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const imageSrc = item.image_url || PLACEHOLDER_IMAGE;
  const subtotal = item.price * item.quantity;

  return (
    <div className="flex gap-4 border-b border-gray-200 py-4 last:border-0 dark:border-gray-700">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
        <img
          src={imageSrc}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900 dark:text-gray-100">
          {item.name}
        </p>
        <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
          {formatPrice(item.price)} × {item.quantity}
        </p>
        <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
          {formatPrice(subtotal)}
        </p>
      </div>
      <div className="flex flex-col items-end justify-between gap-2">
        <div className="flex items-center gap-1 rounded border border-gray-300 dark:border-gray-600">
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="flex h-8 w-8 items-center justify-center text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Diminuir quantidade"
          >
            −
          </button>
          <span className="min-w-[2rem] text-center text-sm tabular-nums">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="flex h-8 w-8 items-center justify-center text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Aumentar quantidade"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={() => removeItem(item.id)}
          className="text-sm text-red-600 hover:underline dark:text-red-400"
        >
          Remover
        </button>
      </div>
    </div>
  );
}
