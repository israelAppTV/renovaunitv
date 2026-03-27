import Link from "next/link";

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const ref = searchParams.ref;
  const refStr = Array.isArray(ref) ? ref[0] : ref;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-text">Pagamento em processamento</h1>
      <p className="mt-4 text-text/80">
        Se o pagamento PIX for confirmado, enviaremos o código de ativação para
        o e-mail informado na compra — em geral em poucos instantes.
      </p>
      {refStr && (
        <p className="mt-2 text-xs text-text/50">
          Referência: <span className="font-mono">{refStr}</span>
        </p>
      )}
      <Link
        href="/"
        className="mt-8 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-white"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
