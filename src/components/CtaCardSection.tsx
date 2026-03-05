import Link from "next/link";

export interface CtaCardSectionProps {
  title: string;
  description: string;
  monthlyLabel: string;
  monthlyHref: string;
  annualLabel: string;
  annualHref: string;
  footerText: string;
  footerHref: string;
}

export function CtaCardSection({
  title,
  description,
  monthlyLabel,
  monthlyHref,
  annualLabel,
  annualHref,
  footerText,
  footerHref,
}: CtaCardSectionProps) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-xl border border-primary/20 bg-card p-8 shadow-xl sm:p-10">
          <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
            {title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-text/80 sm:text-base">
            {description}
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href={monthlyHref}
              className="inline-block rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3.5 text-center font-semibold text-white shadow-lg transition duration-200 hover:opacity-90 hover:shadow-xl"
            >
              {monthlyLabel}
            </Link>
            <Link
              href={annualHref}
              className="inline-block rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3.5 text-center font-semibold text-white shadow-lg transition duration-200 hover:opacity-90 hover:shadow-xl"
            >
              {annualLabel}
            </Link>
          </div>
          <p className="mt-8 text-center">
            <Link
              href={footerHref}
              className="text-sm text-text/80 transition hover:text-primary hover:underline"
            >
              {footerText}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
