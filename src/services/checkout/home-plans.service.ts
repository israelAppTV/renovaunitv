import "server-only";
import type { PlanCardData } from "@/components/PlanCard";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const FEATURES_MENSAL = [
  "Assista em 2 telas com a mesma conta",
  "Canais ao vivo SD, HD e FHD",
  "Filmes e séries sempre atualizados",
  "Compatível com TV Box, celular e Smart TV",
  "Código enviado na hora por e-mail",
  "Suporte técnico + tutoriais de instalação",
] as const;

const FEATURES_ANUAL = [
  "12 meses de acesso completo",
  "Equivalente a ~R$15/mês — economize R$120",
  "Canais ao vivo SD, HD e FHD",
  "Filmes e séries + acesso em 2 telas",
  "Funciona em TV Box, Smart TV e celular Android",
  "Suporte dedicado por 1 ano inteiro",
] as const;

function getAnnualWhatsappUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_ANNUAL_WHATSAPP_URL?.trim();
  return raw ? raw : null;
}

/** Planos exibidos na home a partir do catálogo Supabase (slug mensal / anual). */
export async function getHomePlans(): Promise<PlanCardData[]> {
  const annualWhatsappUrl = getAnnualWhatsappUrl();
  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch {
    return fallbackPlans();
  }

  const { data, error } = await supabase
    .from("products")
    .select("slug, name, price, description")
    .in("slug", ["mensal", "anual"])
    .eq("is_active", true);

  if (error || !data?.length) {
    return fallbackPlans();
  }

  const bySlug = new Map(data.map((p) => [p.slug as string, p]));
  const order = ["mensal", "anual"] as const;
  const out: PlanCardData[] = [];

  for (const slug of order) {
    const p = bySlug.get(slug);
    if (!p) continue;
    const features =
      slug === "mensal" ? [...FEATURES_MENSAL] : [...FEATURES_ANUAL];
    const periodLabel =
      slug === "mensal"
        ? "Assinatura por 30 dias"
        : "Assinatura por 12 meses";
    out.push({
      id: slug,
      title: p.name,
      periodLabel,
      priceCents: p.price,
      shortDescription:
        (p.description as string | null)?.trim() ||
        (slug === "mensal"
          ? "Comprar recarga mensal via PIX"
          : "Comprar assinatura anual — melhor custo"),
      features,
      ctaLabel:
        slug === "mensal"
          ? "Comprar Recarga Mensal"
          : annualWhatsappUrl
            ? "Falar com vendedor no WhatsApp"
            : "Comprar Recarga Anual",
      ctaHref:
        slug === "anual" && annualWhatsappUrl
          ? annualWhatsappUrl
          : `/checkout?plan=${slug}`,
      detailsLabel:
        slug === "mensal"
          ? "Ver detalhes do Plano Mensal"
          : "Ver detalhes do Plano Anual",
      detailsHref: "/#planos",
    });
  }

  return out.length ? out : fallbackPlans();
}

function fallbackPlans(): PlanCardData[] {
  const annualWhatsappUrl = getAnnualWhatsappUrl();
  return [
    {
      id: "mensal",
      title: "Recarga Mensal",
      periodLabel: "Assinatura por 30 dias",
      priceCents: 2490,
      shortDescription: "Comprar recarga mensal via PIX",
      features: [...FEATURES_MENSAL],
      ctaLabel: "Comprar Recarga Mensal",
      ctaHref: "/checkout?plan=mensal",
      detailsLabel: "Ver detalhes do Plano Mensal",
      detailsHref: "/#planos",
    },
    {
      id: "anual",
      title: "Recarga Anual",
      periodLabel: "Assinatura por 12 meses",
      priceCents: 17990,
      shortDescription: "Comprar assinatura anual — melhor custo",
      features: [...FEATURES_ANUAL],
      ctaLabel: annualWhatsappUrl
        ? "Falar com vendedor no WhatsApp"
        : "Comprar Recarga Anual",
      ctaHref: annualWhatsappUrl ?? "/checkout?plan=anual",
      detailsLabel: "Ver detalhes do Plano Anual",
      detailsHref: "/#planos",
    },
  ];
}
