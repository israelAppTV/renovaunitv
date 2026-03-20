"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/layout/Container";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/#planos", label: "Comprar Recarga" },
  { href: "/#planos", label: "Tutoriais" },
  { href: "/#faq", label: "Perguntas Frequentes" },
];

function LogoIcon() {
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent p-1.5"
      aria-hidden
    >
      <svg
        className="h-full w-full text-white"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M8 5v14l11-7L8 5z" />
      </svg>
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-card bg-card/95 shadow-lg backdrop-blur">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 transition opacity-90 hover:opacity-100"
          >
            <LogoIcon />
            <span className="text-lg font-bold tracking-tight">
              <span className="text-text">UniTV </span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                OFICIAL
              </span>
            </span>
          </Link>

          <div className="hidden flex-1 justify-center md:flex md:items-center md:gap-6">
            {navLinks.map(({ href, label }) => {
              const isActive =
                href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={`${href}-${label}`}
                  href={href}
                  className={`text-sm font-medium transition hover:text-primary ${
                    isActive ? "text-primary" : "text-text/80"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/#planos"
              className="rounded-xl border border-primary/50 bg-transparent px-5 py-2.5 text-sm font-semibold text-text transition hover:border-primary hover:bg-primary/10"
            >
              Ver planos
            </Link>
          </div>

          <button
            type="button"
            className="rounded-xl p-2 text-text/90 transition hover:bg-primary/20 hover:text-primary md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label="Abrir menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-primary/20 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={`${href}-${label}`}
                  href={href}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-text transition hover:bg-primary/20 hover:text-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/#planos"
                className="mt-2 rounded-xl border border-primary/50 bg-transparent px-4 py-3 text-center text-sm font-semibold text-text transition hover:bg-primary/10"
                onClick={() => setMenuOpen(false)}
              >
                Ver planos
              </Link>
            </div>
          </div>
        )}
      </Container>
    </nav>
  );
}
