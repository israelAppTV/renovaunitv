import Link from "next/link";

export interface HeroBadge {
  text: string;
  dot?: "orange" | "green";
}

export interface HeroFeatureCard {
  title: string;
  mainText: string;
  description: string;
}

interface HeroProps {
  title: string;
  titleHighlight?: string;
  subtitle: string;
  badges?: HeroBadge[];
  featureCards?: HeroFeatureCard[];
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  imageSrc?: string;
  imageAlt?: string;
  imageCardTitle?: string;
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

export function Hero({
  title,
  titleHighlight,
  subtitle,
  badges,
  featureCards,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  imageSrc,
  imageAlt = "Prévia do produto",
  imageCardTitle,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-background px-6 py-16 shadow-xl sm:py-24">
      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Coluna esquerda: conteúdo */}
        <div className="flex flex-col">
          {badges && badges.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-3">
              {badges.map((badge, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2 text-sm font-medium text-text/90 shadow-md"
                >
                  {badge.dot && (
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        badge.dot === "orange" ? "bg-primary" : "bg-accent"
                      }`}
                      aria-hidden
                    />
                  )}
                  {badge.text}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {renderTitle(title, titleHighlight)}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-text/80">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            {ctaLabel && ctaHref && (
              <Link
                href={ctaHref}
                className="inline-flex items-center rounded-xl bg-primary px-8 py-3.5 font-semibold text-white shadow-lg transition duration-200 hover:opacity-90 hover:shadow-xl"
              >
                {ctaLabel}
              </Link>
            )}
            {secondaryCtaLabel && secondaryCtaHref && (
              <Link
                href={secondaryCtaHref}
                className="inline-flex items-center rounded-xl border border-primary/50 bg-card px-6 py-3.5 font-semibold text-text transition duration-200 hover:bg-primary/10"
              >
                {secondaryCtaLabel}
              </Link>
            )}
          </div>
          {featureCards && featureCards.length > 0 && (
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {featureCards.slice(0, 3).map((card, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-primary/20 bg-card p-4 shadow-lg"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-text/70">
                    {card.title}
                  </p>
                  <p className="mt-1 font-semibold text-text">
                    {card.mainText}
                  </p>
                  <p className="mt-1 text-sm text-text/80">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coluna direita: prévia (só se imageSrc) */}
        {imageSrc && (
          <div className="rounded-xl bg-card p-4 shadow-xl lg:p-6">
            {imageCardTitle && (
              <p className="mb-4 text-sm font-medium text-text/70">
                {imageCardTitle}
              </p>
            )}
            <div className="overflow-hidden rounded-lg">
              <img
                src={imageSrc}
                alt={imageAlt}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
