export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  plan: string;
}

export interface TestimonialsSectionProps {
  title: string;
  subtitle: string;
  testimonials: TestimonialItem[];
}

function StarIcon() {
  return (
    <svg
      className="h-5 w-5 text-accent"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function StarsRow() {
  return (
    <div className="flex gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} />
      ))}
    </div>
  );
}

export function TestimonialsSection({
  title,
  subtitle,
  testimonials,
}: TestimonialsSectionProps) {
  if (!testimonials.length) return null;

  return (
    <section className="py-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text/80">
          {subtitle}
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
        {testimonials.map((item) => (
          <article
            key={item.id}
            className="flex flex-col rounded-xl border border-primary/20 bg-card p-6 shadow-lg transition duration-200 hover:shadow-xl"
          >
            <StarsRow />
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-text">
              &ldquo;{item.quote}&rdquo;
            </blockquote>
            <footer className="mt-4">
              <cite className="not-italic">
                <span className="block font-semibold text-text">
                  {item.author}
                </span>
                <span className="mt-1 block text-xs text-text/80">
                  {item.plan}
                </span>
              </cite>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
