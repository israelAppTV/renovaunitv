"use client";

import { useEffect, useCallback } from "react";

const DEFAULT_VIDEO_URL = "https://www.youtube.com/watch?v=OqEqN1qEPBA";
const DEFAULT_EMBED_URL = "https://www.youtube.com/embed/OqEqN1qEPBA";
const DEFAULT_TITLE = "Como Vincular sua Conta UniTV";
const DEFAULT_SUBTITLE = "Como vincular uma conta email/celular UniTV";
const DEFAULT_STEPS = [
  "AVISO IMPORTANTE: Antes de resgatar o seu código, é essencial vincular uma conta (e-mail ou telefone) no seu perfil do aplicativo.",
  "Ao vincular, você garante a segurança do seu código e ativa o benefício de poder assistir em até 2 telas com a mesma conta.",
];

export interface TutorialModalProps {
  open: boolean;
  onClose: () => void;
  videoUrl?: string;
  title?: string;
  subtitle?: string;
  steps?: string[];
}

function getEmbedUrl(watchUrl: string): string {
  try {
    const url = new URL(watchUrl);
    const v = url.searchParams.get("v");
    return v ? `https://www.youtube.com/embed/${v}` : DEFAULT_EMBED_URL;
  } catch {
    return DEFAULT_EMBED_URL;
  }
}

function CheckIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-accent"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

export function TutorialModal({
  open,
  onClose,
  videoUrl = DEFAULT_VIDEO_URL,
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  steps = DEFAULT_STEPS,
}: TutorialModalProps) {
  const embedUrl = getEmbedUrl(videoUrl);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-modal-title"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 transition"
        aria-label="Fechar modal"
      />
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-xl border border-primary/20 bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-primary/20 px-6 py-3">
          <span className="text-xs font-medium uppercase tracking-wide text-text/70">
            Tutorial
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-primary/20 px-4 py-2 text-sm font-semibold text-text transition hover:bg-primary/30"
          >
            Fechar
          </button>
        </div>
        <div className="max-h-[90vh] overflow-y-auto px-6 py-6">
          <h2
            id="tutorial-modal-title"
            className="text-xl font-bold text-text sm:text-2xl"
          >
            {title}
          </h2>
          <p className="mt-1 text-sm text-text/80">{subtitle}</p>
          <div className="mt-6 aspect-video w-full overflow-hidden rounded-lg bg-background">
            <iframe
              src={embedUrl}
              title={title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-accent"
          >
            Assistir no YouTube
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-text">Passo a passo</h3>
            <ul className="mt-3 space-y-3">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <CheckIcon />
                  <span className="text-sm text-text/90">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
