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
  /** Se definido, o card abre este link em nova aba (ex.: WhatsApp) e não abre modal. */
  externalHref?: string;
  modalTitle?: string;
  modalSubtitle?: string;
  modalSteps?: InstallTutorialStep[];
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

function FireTvStickIcon() {
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
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      className="h-7 w-7"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

const iconByKey: Record<string, () => JSX.Element> = {
  firetv: FireTvStickIcon,
  tvbox: TvBoxIcon,
  celular: WhatsAppIcon,
};

const cardClassName =
  "flex items-center gap-4 rounded-xl border border-primary/20 bg-card p-5 text-left shadow-lg transition duration-200 hover:border-primary/40 hover:shadow-xl";

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
    <section id="tutoriais" className="py-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
          {renderTitle(title, titleHighlight)}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text/80">
          {subtitle}
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = iconByKey[card.id] ?? TvBoxIcon;
          const inner = (
            <>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
                <Icon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-text">{card.title}</p>
                <p className="text-sm text-text/80">{card.subtitle}</p>
              </div>
            </>
          );

          if (card.externalHref) {
            return (
              <a
                key={card.id}
                href={card.externalHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClassName}
                aria-label={`${card.title}: abrir WhatsApp em nova aba`}
              >
                {inner}
              </a>
            );
          }

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setOpenId(card.id)}
              className={cardClassName}
              aria-expanded={openId === card.id}
              aria-haspopup="dialog"
            >
              {inner}
            </button>
          );
        })}
      </div>
      {openCard && !openCard.externalHref && (
        <InstallTutorialModal
          open={openId === openCard.id}
          onClose={() => setOpenId(null)}
          title={openCard.modalTitle ?? ""}
          subtitle={openCard.modalSubtitle}
          steps={openCard.modalSteps}
          videoUrl={openCard.modalVideoUrl}
          imageSrc={openCard.modalImageSrc}
        />
      )}
    </section>
  );
}
