import type { Metadata } from "next";
import Script from "next/script";
import "@/app/globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingWhatsAppButton } from "@/components/FloatingWhatsAppButton";
import { Container } from "@/components/layout/Container";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Renova UnitTV",
  description: "Loja de códigos digitais",
  icons: {
    icon: "/logo.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col antialiased">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18116512472"
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18116512472');
          `}
        </Script>
        <Providers>
          <Navbar />
          <main className="flex-1">
            <Container>{children}</Container>
          </main>
          <Footer />
          <FloatingWhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
