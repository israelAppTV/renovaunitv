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
  whatsappCtaLabel?: string;
  whatsappCtaHref?: string;
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
  whatsappCtaLabel,
  whatsappCtaHref,
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
          {whatsappCtaLabel && whatsappCtaHref && (
            <a
              href={whatsappCtaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#25D366] px-6 py-4 text-center text-base font-bold uppercase tracking-wide text-white shadow-lg shadow-[#25D366]/35 transition duration-200 hover:scale-[1.02] hover:brightness-110 hover:shadow-xl sm:text-lg"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7 shrink-0 fill-current"
                aria-hidden
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884" />
              </svg>
              {whatsappCtaLabel}
            </a>
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
