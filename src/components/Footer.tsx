import Link from "next/link";
import { Container } from "@/components/layout/Container";

export function Footer({ className }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`border-t border-primary/20 bg-card ${className ?? ""}`}
    >
      <Container>
        <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-3 md:gap-10">
          <div>
            <h3 className="text-lg font-semibold text-text">UniTV Oficial</h3>
            <p className="mt-3 text-sm leading-relaxed text-text/80">
              UniTV site oficial — plataforma de UniTV recarga com entrega
              imediata, suporte 24h e pagamento seguro via PIX. Comprar acesso
              UniTV oficial com garantia.
            </p>
          </div>
          <nav aria-label="Páginas">
            <h3 className="text-lg font-semibold text-text">Páginas</h3>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-text/80 transition hover:text-primary"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/#planos"
                  className="text-sm text-text/80 transition hover:text-primary"
                >
                  Plano Mensal
                </Link>
              </li>
              <li>
                <Link
                  href="/#planos"
                  className="text-sm text-text/80 transition hover:text-primary"
                >
                  Plano Anual
                </Link>
              </li>
              <li>
                <Link
                  href="#faq"
                  className="text-sm text-text/80 transition hover:text-primary"
                >
                  Dúvidas Frequentes
                </Link>
              </li>
              <li>
                <Link
                  href="/#planos"
                  className="text-sm text-text/80 transition hover:text-primary"
                >
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Atalhos">
            <h3 className="text-lg font-semibold text-text">Atalhos</h3>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link
                  href="/#planos"
                  className="text-sm text-text/80 transition hover:text-primary"
                >
                  Planos e Preços
                </Link>
              </li>
              <li>
                <Link
                  href="/#planos"
                  className="text-sm text-text/80 transition hover:text-primary"
                >
                  Tutoriais
                </Link>
              </li>
              <li>
                <Link
                  href="#how-to"
                  className="text-sm text-text/80 transition hover:text-primary"
                >
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link
                  href="#faq"
                  className="text-sm text-text/80 transition hover:text-primary"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/aviso-legal"
                  className="text-sm text-text/80 transition hover:text-primary"
                >
                  Aviso Legal
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-privacidade"
                  className="text-sm text-text/80 transition hover:text-primary"
                >
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-primary/20 py-6">
          <p className="text-center text-sm text-text/70">
            © {year} UniTV Vendas. Todos os direitos reservados.
          </p>
        </div>
      </Container>
    </footer>
  );
}
