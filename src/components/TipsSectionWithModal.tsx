"use client";

import { useState } from "react";
import Link from "next/link";
import type { TipItem } from "@/components/TipsSection";
import { TutorialModal } from "@/components/TutorialModal";

export interface TipsSectionWithModalProps {
  title: string;
  subtitle: string;
  tips: TipItem[];
  tutorialVideoUrl?: string;
  tutorialModalTitle?: string;
  tutorialModalSubtitle?: string;
  tutorialSteps?: string[];
}

function ArrowIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 8l4 4m0 0l-4 4m4-4H3"
      />
    </svg>
  );
}

export function TipsSectionWithModal({
  title,
  subtitle,
  tips,
  tutorialVideoUrl,
  tutorialModalTitle,
  tutorialModalSubtitle,
  tutorialSteps,
}: TipsSectionWithModalProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const showTutorialModal = Boolean(tutorialVideoUrl);

  if (!tips.length) return null;

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
        {tips.map((tip) => (
          <article
            key={tip.id}
            className="flex flex-col rounded-xl border border-primary/20 bg-card p-6 shadow-lg transition duration-200 hover:shadow-xl"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-text/70">
              {tip.label}
            </p>
            <h3 className="mt-2 text-xl font-bold text-text">{tip.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-text/80">
              {tip.description}
            </p>
            {tip.ctaLabel && tip.ctaHref && (
              <>
                {showTutorialModal && tip.ctaLabel === "Ver tutorial" ? (
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-accent"
                  >
                    {tip.ctaLabel}
                    <ArrowIcon />
                  </button>
                ) : (
                  <Link
                    href={tip.ctaHref}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-accent"
                  >
                    {tip.ctaLabel}
                    <ArrowIcon />
                  </Link>
                )}
              </>
            )}
          </article>
        ))}
      </div>
      {showTutorialModal && (
        <TutorialModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          videoUrl={tutorialVideoUrl}
          title={tutorialModalTitle}
          subtitle={tutorialModalSubtitle}
          steps={tutorialSteps}
        />
      )}
    </section>
  );
}
