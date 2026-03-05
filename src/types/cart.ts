/**
 * Item no carrinho (snapshot para exibição e cálculo; preço em centavos).
 */
export interface CartItem {
  id: string;
  quantity: number;
  name: string;
  price: number;
  image_url: string | null;
}
