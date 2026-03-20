"use client";

import { useState } from "react";
import {
  InstallTutorialModal,
  type InstallTutorialStep,
} from "@/components/InstallTutorialModal";

export interface InstallTutorialCardData {
  id: string;
  title: string;
  subtitle: string;
  modalTitle: string;
  modalSubtitle?: string;
  modalSteps: InstallTutorialStep[];
  modalVideoUrl?: string;
  modalImageSrc?: string;
}

export interface InstallTutorialsSectionProps {
  title: string;
  titleHighlight?: string;
  subtitle: string;
  cards: InstallTutorialCardData[];
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

function TvBoxIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function TvAndroidIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}

function LaptopIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

const iconByKey: Record<string, () => JSX.Element> = {
  tvbox: TvBoxIcon,
  tvandroid: TvAndroidIcon,
  celular: PhoneIcon,
  "pc-mac": LaptopIcon,
  phone: PhoneIcon,
  laptop: LaptopIcon,
};

export function InstallTutorialsSection({
  title,
  titleHighlight,
  subtitle,
  cards,
}: InstallTutorialsSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openCard = cards.find((c) => c.id === openId);

  if (!cards.length) return null;

  return (
    <section className="py-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
          {renderTitle(title, titleHighlight)}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text/80">
          {subtitle}
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = iconByKey[card.id] ?? TvBoxIcon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setOpenId(card.id)}
              className="flex items-center gap-4 rounded-xl border border-primary/20 bg-card p-5 text-left shadow-lg transition duration-200 hover:border-primary/40 hover:shadow-xl"
              aria-expanded={openId === card.id}
              aria-haspopup="dialog"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
                <Icon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-text">{card.title}</p>
                <p className="text-sm text-text/80">{card.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
      {openCard && (
        <InstallTutorialModal
          open={openId === openCard.id}
          onClose={() => setOpenId(null)}
          title={openCard.modalTitle}
          subtitle={openCard.modalSubtitle}
          steps={openCard.modalSteps}
          videoUrl={openCard.modalVideoUrl}
          imageSrc={openCard.modalImageSrc}
        />
      )}
    </section>
  );
}
