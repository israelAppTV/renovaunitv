"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Plan = "mensal" | "anual";

export function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const initialPlan: Plan = planParam === "anual" ? "anual" : "mensal";

  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [taxId, setTaxId] = useState("");
  const [phoneArea, setPhoneArea] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planSlug: plan,
          customer: { name, email, taxId, phoneArea, phoneNumber },
        }),
      });
      const data = (await res.json()) as {
        url?: string;
        whatsappUrl?: string;
        annualWhatsapp?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Não foi possível iniciar o pagamento.");
        return;
      }
      if (data.annualWhatsapp && data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("Resposta inválida do servidor.");
    } catch {
      setError("Falha de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-lg space-y-6 rounded-xl border border-primary/20 bg-card p-6 shadow-lg sm:p-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-text">Finalizar compra</h1>
        <p className="mt-1 text-sm text-text/70">
          Informe seus dados para pagamento seguro via PIX.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text">Plano</label>
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value as Plan)}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-background px-3 py-2 text-text dark:border-gray-600"
        >
          <option value="mensal">Recarga Mensal</option>
          <option value="anual">Recarga Anual</option>
        </select>
        {plan === "anual" && (
          <p className="mt-2 text-sm text-amber-300">
            Ao clicar em comprar, vamos abrir o WhatsApp com seus dados para
            atendimento e fechamento do pedido anual.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text" htmlFor="name">
          Nome completo (nome e sobrenome)
        </label>
        <input
          id="name"
          required
          minLength={3}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-background px-3 py-2 text-text dark:border-gray-600"
          autoComplete="name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text" htmlFor="email">
          E-mail (para envio do código)
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-background px-3 py-2 text-text dark:border-gray-600"
          autoComplete="email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text" htmlFor="taxId">
          CPF ou CNPJ (somente números)
        </label>
        <input
          id="taxId"
          required
          inputMode="numeric"
          pattern="[0-9]{11,14}"
          minLength={11}
          maxLength={14}
          value={taxId}
          onChange={(e) => setTaxId(e.target.value.replace(/\D/g, ""))}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-background px-3 py-2 font-mono text-text dark:border-gray-600"
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1">
          <label
            className="block text-sm font-medium text-text"
            htmlFor="phoneArea"
          >
            DDD
          </label>
          <input
            id="phoneArea"
            required
            inputMode="numeric"
            maxLength={2}
            placeholder="11"
            value={phoneArea}
            onChange={(e) =>
              setPhoneArea(e.target.value.replace(/\D/g, "").slice(0, 2))
            }
            className="mt-1 w-full rounded-lg border border-gray-300 bg-background px-3 py-2 font-mono text-text dark:border-gray-600"
            autoComplete="tel-area-code"
          />
        </div>
        <div className="col-span-2">
          <label
            className="block text-sm font-medium text-text"
            htmlFor="phoneNumber"
          >
            Celular (9 dígitos, começa com 9)
          </label>
          <input
            id="phoneNumber"
            required
            inputMode="numeric"
            maxLength={9}
            placeholder="987654321"
            value={phoneNumber}
            onChange={(e) =>
              setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 9))
            }
            className="mt-1 w-full rounded-lg border border-gray-300 bg-background px-3 py-2 font-mono text-text dark:border-gray-600"
            autoComplete="tel-national"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-primary to-accent py-3.5 font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-50"
      >
        {loading
          ? "Redirecionando…"
          : plan === "anual"
            ? "Enviar pedido anual no WhatsApp"
            : "Ir para o pagamento PIX"}
      </button>

      <p className="text-center text-xs text-text/60">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="underline hover:text-primary"
        >
          Voltar ao site
        </button>
      </p>
    </form>
  );
}
