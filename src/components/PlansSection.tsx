import type { PlanCardData } from "@/components/PlanCard";
import { PlanCard } from "@/components/PlanCard";

export interface PlansSectionProps {
  title: string;
  titleHighlight?: string;
  subtitle: string;
  plans: PlanCardData[];
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

export function PlansSection({
  title,
  titleHighlight,
  subtitle,
  plans,
}: PlansSectionProps) {
  if (!plans.length) return null;

  return (
    <section id="planos" className="py-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {renderTitle(title, titleHighlight)}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text/80">
          {subtitle}
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </section>
  );
}
