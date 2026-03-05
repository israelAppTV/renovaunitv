import Link from "next/link";
import type { Product } from "@/types/product";
import { formatPrice } from "@/utils/formatPrice";
import { cn } from "@/utils/cn";
import { AddToCartButton } from "@/modules/cart/components/AddToCartButton";

interface ProductCardProps {
  product: Product;
  className?: string;
}

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='%23e5e7eb'%3E%3Crect width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='18'%3ESem imagem%3C/text%3E%3C/svg%3E";

export function ProductCard({ product, className }: ProductCardProps) {
  const hasStock = product.stock_count > 0;
  const imageSrc = product.image_url || PLACEHOLDER_IMAGE;

  return (
    <article
      className={cn(
        "flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900",
        className
      )}
    >
      <Link href={`/products/${product.id}`} className="flex flex-col flex-1 overflow-hidden">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={imageSrc}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {product.description}
            </p>
          )}
          <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
      <div className="flex gap-2 p-4 pt-0">
        <Link
          href={`/products/${product.id}`}
          className={cn(
            "flex-1 rounded-md px-4 py-2 text-center text-sm font-medium transition",
            hasStock
              ? "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
              : "cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
          )}
          aria-disabled={!hasStock}
        >
          {hasStock ? "Comprar" : "Indisponível"}
        </Link>
        <AddToCartButton product={product} className="shrink-0" />
      </div>
    </article>
  );
}
