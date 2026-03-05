import Link from "next/link";
import type { Product } from "@/types/product";
import { PriceTag } from "./PriceTag";
import { BuyButton } from "./BuyButton";
import { cn } from "@/utils/cn";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='%231e293b'%3E%3Crect width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236366f1' font-family='sans-serif' font-size='18'%3ESem imagem%3C/text%3E%3C/svg%3E";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const imageSrc = product.image_url || PLACEHOLDER_IMAGE;
  const hasStock = product.stock_count > 0;
  const productSlug = product.id;

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-xl bg-card shadow-lg transition duration-200 hover:scale-[1.02] hover:shadow-xl",
        className
      )}
    >
      <Link href={`/product/${productSlug}`} className="flex flex-1 flex-col overflow-hidden">
        <div className="aspect-[4/3] w-full overflow-hidden bg-background">
          <img
            src={imageSrc}
            alt=""
            className="h-full w-full object-cover transition duration-200"
          />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 font-semibold text-text">
            {product.name}
          </h3>
          <div className="mt-3">
            <PriceTag priceCents={product.price} className="text-xl" />
          </div>
        </div>
      </Link>
      <div className="p-5 pt-0">
        <BuyButton
          href={hasStock ? `/checkout/${product.id}` : "#"}
          disabled={!hasStock}
          className="w-full"
        >
          {hasStock ? "Comprar" : "Indisponível"}
        </BuyButton>
      </div>
    </article>
  );
}
