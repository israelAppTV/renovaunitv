"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Plan = "mensal" | "anual";
type PaymentChannel = "site" | "whatsapp";

function isFormValid(input: {
  name: string;
  email: string;
  taxId: string;
  phoneArea: string;
  phoneNumber: string;
}): boolean {
  const taxDigits = input.taxId.replace(/\D/g, "");
  const areaDigits = input.phoneArea.replace(/\D/g, "").slice(0, 2);
  const numberDigits = input.phoneNumber.replace(/\D/g, "").slice(0, 9);

  if (input.name.trim().length < 3) return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim().toLowerCase())) return false;
  if (taxDigits.length !== 11 && taxDigits.length !== 14) return false;
  if (areaDigits.length !== 2) return false;
  if (numberDigits.length !== 9 || !numberDigits.startsWith("9")) return false;

  return true;
}

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
  const [showNotice, setShowNotice] = useState(true);

  const canProceed = isFormValid({ name, email, taxId, phoneArea, phoneNumber });

  async function submitByChannel(channel: PaymentChannel) {
    setError(null);

    if (!canProceed) {
      setError("Preencha corretamente todos os dados para continuar.");
      return;
    }

    if (plan === "anual" && channel === "site") {
      setError("Plano anual é vendido apenas pelo WhatsApp.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planSlug: plan,
          paymentChannel: channel,
          customer: { name, email, taxId, phoneArea, phoneNumber },
        }),
      });
      const data = (await res.json()) as {
        url?: string;
        whatsappUrl?: string;
        viaWhatsapp?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Não foi possível iniciar o pagamento.");
        return;
      }
      if (data.viaWhatsapp && data.whatsappUrl) {
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
    <>
      {showNotice && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-primary/30 bg-card p-5 shadow-xl">
            <h2 className="text-lg font-bold text-text">Aviso importante</h2>
            <p className="mt-2 text-sm text-text/80">
              Se pagar pelo site, o código do plano mensal é enviado em até 24 horas.
              Para receber mais rápido, escolha o pagamento via WhatsApp.
            </p>
            <button
              type="button"
              onClick={() => setShowNotice(false)}
              className="mt-4 w-full rounded-lg bg-gradient-to-r from-primary to-accent py-2.5 font-semibold text-white"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      <form className="mx-auto max-w-lg space-y-6 rounded-xl border border-primary/20 bg-card p-6 shadow-lg sm:p-8">
      <div>
        <h1 className="text-2xl font-bold text-text">Finalizar compra</h1>
        <p className="mt-1 text-sm text-text/70">
          Informe seus dados para pagamento pelo site ou WhatsApp.
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
            O plano anual é vendido apenas no WhatsApp.
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

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={loading || !canProceed || plan === "anual"}
          onClick={() => submitByChannel("site")}
          className="w-full rounded-xl border border-primary/40 bg-primary/10 py-3.5 font-semibold text-text transition hover:border-primary hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Processando..." : "Pagamento pelo site"}
        </button>
        <button
          type="button"
          disabled={loading || !canProceed}
          onClick={() => submitByChannel("whatsapp")}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-accent py-3.5 font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Processando..." : "Pagamento pelo WhatsApp"}
        </button>
      </div>

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
    </>
  );
}
