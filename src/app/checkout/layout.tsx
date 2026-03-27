import { Suspense } from "react";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="py-12">
      <Suspense fallback={<div className="text-center text-text/70">Carregando…</div>}>
        {children}
      </Suspense>
    </div>
  );
}
