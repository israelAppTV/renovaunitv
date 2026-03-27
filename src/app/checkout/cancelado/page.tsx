import Link from "next/link";

export default function CheckoutCancelledPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-text">Pagamento não concluído</h1>
      <p className="mt-4 text-text/80">
        Você cancelou ou o pagamento não foi finalizado. Nenhuma cobrança foi
        efetuada.
      </p>
      <Link
        href="/checkout?plan=mensal"
        className="mt-8 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-white"
      >
        Tentar novamente
      </Link>
    </div>
  );
}
