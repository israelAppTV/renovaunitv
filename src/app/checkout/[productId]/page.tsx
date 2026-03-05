import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/modules/products/services/products.service";
import { PriceTag } from "@/components/PriceTag";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%231e293b'%3E%3Crect width='100' height='100'/%3E%3C/svg%3E";

interface CheckoutPageProps {
  params: { productId: string };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const product = await getProductById(params.productId);
  if (!product) notFound();

  const imageSrc = product.image_url || PLACEHOLDER_IMAGE;

  return (
    <div className="py-8">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-8 text-2xl font-bold text-text">
          Checkout
        </h1>
        <div className="rounded-xl bg-card p-6 shadow-xl">
          <div className="flex gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-background">
              <img
                src={imageSrc}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-text">
                {product.name}
              </p>
              <p className="mt-1">
                <PriceTag priceCents={product.price} />
              </p>
            </div>
          </div>
          <div className="mt-6 border-t border-primary/20 pt-6">
            <button
              type="button"
              disabled
              className="w-full rounded-xl bg-primary/50 py-3 font-semibold text-text/70 shadow-lg"
            >
              Finalizar compra (em breve)
            </button>
          </div>
        </div>
        <Link
          href="/#planos"
          className="mt-6 inline-block text-sm text-primary transition hover:underline"
        >
          ← Continuar comprando
        </Link>
      </div>
    </div>
  );
}
