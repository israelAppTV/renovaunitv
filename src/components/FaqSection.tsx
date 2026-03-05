"use client";

import Link from "next/link";
import { useState } from "react";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqSectionProps {
  title: string;
  subtitle: string;
  items: FaqItem[];
  ctaLabel: string;
  ctaHref: string;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-primary transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

export function FaqSection({
  title,
  subtitle,
  items,
  ctaLabel,
  ctaHref,
}: FaqSectionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  if (!items.length) return null;

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section id="faq" className="py-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text/80">
          {subtitle}
        </p>
      </div>
      <div className="mt-12 flex flex-col gap-4">
        {items.map((item) => {
          const isOpen = openId === item.id;
          const regionId = `faq-answer-${item.id}`;
          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-xl border border-primary/20 bg-card shadow-lg transition duration-200 hover:shadow-xl"
            >
              <h3>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left font-semibold text-text transition hover:bg-primary/5"
                  onClick={() => toggle(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={regionId}
                  id={`faq-question-${item.id}`}
                >
                  <span>{item.question}</span>
                  <ChevronIcon open={isOpen} />
                </button>
              </h3>
              <div
                id={regionId}
                role="region"
                aria-labelledby={`faq-question-${item.id}`}
                className={isOpen ? "block" : "hidden"}
              >
                <div className="border-t border-primary/20 px-6 pb-4 pt-2">
                  <p className="text-sm leading-relaxed text-text/80">
                    {item.answer}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div className="mt-10 flex justify-center">
        <Link
          href={ctaHref}
          className="rounded-xl border border-primary/50 bg-transparent px-6 py-3 text-center text-sm font-semibold text-text transition hover:border-primary hover:bg-primary/10"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
