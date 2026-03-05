import Link from "next/link";
import { PriceTag } from "@/components/PriceTag";
import { BuyButton } from "@/components/BuyButton";
import { cn } from "@/utils/cn";

export interface PlanCardData {
  id: string;
  title: string;
  periodLabel: string;
  priceCents: number;
  shortDescription: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  detailsLabel?: string;
  detailsHref?: string;
}

interface PlanCardProps {
  plan: PlanCardData;
  className?: string;
}

function PlanIcon() {
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent p-1.5"
      aria-hidden
    >
      <svg
        className="h-full w-full text-white"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M8 5v14l11-7L8 5z" />
      </svg>
    </span>
  );
}

export function PlanCard({ plan, className }: PlanCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border border-primary/20 bg-card p-6 shadow-lg transition duration-200 hover:shadow-xl",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <PlanIcon />
        <div>
          <h3 className="font-bold text-text">{plan.title}</h3>
          <p className="mt-0.5 text-sm text-text/80">{plan.periodLabel}</p>
        </div>
      </div>
      <div className="mt-6">
        <PriceTag priceCents={plan.priceCents} className="text-3xl" />
      </div>
      <p className="mt-2 text-sm text-text/80">{plan.shortDescription}</p>
      <ul className="mt-6 list-none space-y-3">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
              aria-hidden
            />
            <span className="text-sm text-text">{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-col gap-3">
        <BuyButton href={plan.ctaHref} className="w-full py-3.5">
          {plan.ctaLabel}
        </BuyButton>
        {plan.detailsLabel && plan.detailsHref && (
          <Link
            href={plan.detailsHref}
            className="rounded-xl border border-primary/50 bg-transparent px-4 py-3 text-center text-sm font-semibold text-text transition hover:bg-primary/10"
          >
            {plan.detailsLabel}
          </Link>
        )}
      </div>
    </article>
  );
}
