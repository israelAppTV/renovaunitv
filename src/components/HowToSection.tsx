import { BuyButton } from "@/components/BuyButton";

export interface HowToStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
}

export interface HowToSectionProps {
  title: string;
  titleHighlight?: string;
  subtitle: string;
  steps: HowToStep[];
  ctaLabel: string;
  ctaHref: string;
}

function renderTitle(title: string, titleHighlight?: string) {
  if (!titleHighlight || !title.includes(titleHighlight)) {
    return <span className="text-text">{title}</span>;
  }
  const parts = title.split(titleHighlight);
  return (
    <>
      {parts[0] && <span className="text-text">{parts[0]}</span>}
      <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {titleHighlight}
      </span>
      {parts[1] && <span className="text-text">{parts[1]}</span>}
    </>
  );
}

export function HowToSection({
  title,
  titleHighlight,
  subtitle,
  steps,
  ctaLabel,
  ctaHref,
}: HowToSectionProps) {
  if (!steps.length) return null;

  return (
    <section className="py-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {renderTitle(title, titleHighlight)}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text/80">
          {subtitle}
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <article
            key={step.id}
            className="flex flex-col rounded-xl border border-primary/20 bg-card p-6 shadow-lg transition duration-200 hover:shadow-xl"
          >
            <span
              className="text-4xl font-bold leading-none text-primary"
              aria-hidden
            >
              {step.stepNumber}
            </span>
            <h3 className="mt-4 text-xl font-bold text-text">{step.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-text/80">
              {step.description}
            </p>
          </article>
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <BuyButton href={ctaHref} className="px-8 py-3 text-base">
          {ctaLabel}
        </BuyButton>
      </div>
    </section>
  );
}
