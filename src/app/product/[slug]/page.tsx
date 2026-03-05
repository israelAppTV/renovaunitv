import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/modules/products/services/products.service";
import { PriceTag } from "@/components/PriceTag";
import { BuyButton } from "@/components/BuyButton";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='%231e293b'%3E%3Crect width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236366f1' font-family='sans-serif' font-size='18'%3ESem imagem%3C/text%3E%3C/svg%3E";

interface ProductPageProps {
  params: { slug: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.slug);
  if (!product) notFound();

  const imageSrc = product.image_url || PLACEHOLDER_IMAGE;
  const hasStock = product.stock_count > 0;

  return (
    <div className="py-8">
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-8 rounded-xl bg-card p-6 shadow-xl md:grid-cols-2">
          <div className="overflow-hidden rounded-xl bg-background">
            <img
              src={imageSrc}
              alt=""
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-text">
              {product.name}
            </h1>
            {product.description && (
              <p className="mt-4 text-text/80">
                {product.description}
              </p>
            )}
            <div className="mt-6">
              <PriceTag priceCents={product.price} className="text-2xl" />
            </div>
            <div className="mt-8">
              <BuyButton
                href={hasStock ? `/checkout/${product.id}` : "#"}
                disabled={!hasStock}
                className="w-full py-4 text-lg"
              >
                {hasStock ? "Comprar agora" : "Indisponível"}
              </BuyButton>
            </div>
            <Link
              href="/#planos"
              className="mt-4 text-sm text-primary transition hover:underline"
            >
              ← Voltar aos planos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
