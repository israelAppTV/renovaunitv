import Link from "next/link";
import { CartPageClient } from "@/modules/cart/components/CartPageClient";

export default function CartPage() {
  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Carrinho
      </h1>
      <p className="mt-1 text-gray-600 dark:text-gray-400">
        Revise seus itens e finalize a compra.
      </p>
      <div className="mt-8">
        <CartPageClient />
      </div>
    </div>
  );
}
