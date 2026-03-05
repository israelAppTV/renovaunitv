"use client";

import { useCartContext } from "../context/CartContext";
import { formatPrice } from "@/utils/formatPrice";

/**
 * Hook de acesso ao carrinho. Retorna estado e ações.
 * totalFormatted usa a lógica de formatação em BRL.
 */
export function useCart() {
  const cart = useCartContext();
  return {
    ...cart,
    totalFormatted: formatPrice(cart.totalCents),
  };
}
