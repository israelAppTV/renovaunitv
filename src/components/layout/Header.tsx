"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "./Container";
import { CartTrigger } from "@/modules/cart/components/CartTrigger";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/#planos", label: "Produtos" },
  { href: "/orders", label: "Meus Pedidos" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="text-lg font-semibold">
            Marketplace
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex md:items-center md:gap-6" aria-label="Principal">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                {label}
              </Link>
            ))}
            <CartTrigger />
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden dark:text-gray-400 dark:hover:bg-gray-800"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span className="sr-only">Abrir menu</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        <div
          id="mobile-menu"
          className={`md:hidden ${menuOpen ? "block border-t border-gray-200 dark:border-gray-800" : "hidden"}`}
          role="region"
          aria-label="Menu móvel"
        >
          <nav className="flex flex-col gap-1 py-3" aria-label="Navegação móvel">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="px-3 py-2">
              <CartTrigger className="w-full justify-start rounded-md px-3 py-2 text-left" />
            </div>
          </nav>
        </div>
      </Container>
    </header>
  );
}
