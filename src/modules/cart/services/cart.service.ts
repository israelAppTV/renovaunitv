import type { CartItem } from "@/types/cart";

/**
 * Calcula o total do carrinho em centavos.
 * Lógica de negócio centralizada (fora de componentes).
 */
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Retorna a quantidade total de itens (soma das quantidades).
 */
export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Garante quantidade dentro de limites válidos (>= 1).
 */
export function clampQuantity(quantity: number): number {
  return Math.max(1, Math.floor(quantity));
}
