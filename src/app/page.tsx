import { CtaCardSection } from "@/components/CtaCardSection";
import { FaqSection } from "@/components/FaqSection";
import { Hero } from "@/components/Hero";
import { HowToSection } from "@/components/HowToSection";
import { InstallTutorialsSection } from "@/components/InstallTutorialsSection";
import { PlansSection } from "@/components/PlansSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { TipsSectionWithModal } from "@/components/TipsSectionWithModal";

export default function HomePage() {
  return (
    <div className="space-y-12 py-8">
      <Hero
        title="Comprar Recarga Oficial com Entrega Imediata"
        titleHighlight="Oficial"
        subtitle="Compre sua recarga via PIX e receba o código na hora por e-mail. Aqui você encontra os melhores planos e preços com segurança, suporte e tutoriais de instalação para TV Box, celular e Smart TV."
        badges={[
          { text: "Site Oficial • Entrega segura", dot: "orange" },
          { text: "Recarga com entrega imediata por e-mail", dot: "green" },
        ]}
        featureCards={[
          {
            title: "Pagamento",
            mainText: "PIX ou Cartão",
            description: "Compre recarga via PIX",
          },
          {
            title: "Código",
            mainText: "Entrega Imediata",
            description: "Receba por e-mail na hora",
          },
          {
            title: "Assinatura",
            mainText: "Até 2 telas",
            description: "Acesso simultâneo garantido",
          },
        ]}
        ctaLabel="Comprar Recarga"
        ctaHref="/#planos"
        secondaryCtaLabel="Download e Instalação"
        secondaryCtaHref="/#planos"
        imageSrc="/images/hero-app.webp"
        imageAlt="Prévia do app e compatibilidade em dispositivos"
        imageCardTitle="Prévia do app"
      />
      <PlansSection
        title="Planos e Preços — Recarga Oficial"
        titleHighlight="Recarga Oficial"
        subtitle="Compare os planos e escolha a melhor opção para comprar sua assinatura. Recarga mensal ou anual com entrega imediata, pagamento via PIX e acesso completo a canais, filmes e séries."
        plans={[
          {
            id: "mensal",
            title: "Recarga Mensal",
            periodLabel: "Assinatura por 30 dias",
            priceCents: 2490,
            shortDescription: "Comprar recarga mensal via PIX",
            features: [
              "Assista em 2 telas com a mesma conta",
              "Canais ao vivo SD, HD e FHD",
              "Filmes e séries sempre atualizados",
              "Compatível com TV Box, celular e Smart TV",
              "Código enviado na hora por e-mail",
              "Suporte técnico + tutoriais de instalação",
            ],
            ctaLabel: "Comprar Recarga Mensal",
            ctaHref: "/#planos",
            detailsLabel: "Ver detalhes do Plano Mensal",
            detailsHref: "/#planos",
          },
          {
            id: "anual",
            title: "Recarga Anual",
            periodLabel: "Assinatura por 12 meses",
            priceCents: 17990,
            shortDescription: "Comprar assinatura anual — melhor custo",
            features: [
              "12 meses de acesso completo",
              "Equivalente a ~R$15/mês — economize R$120",
              "Canais ao vivo SD, HD e FHD",
              "Filmes e séries + acesso em 2 telas",
              "Funciona em TV Box, Smart TV e celular Android",
              "Suporte dedicado por 1 ano inteiro",
            ],
            ctaLabel: "Comprar Recarga Anual",
            ctaHref: "/#planos",
            detailsLabel: "Ver detalhes do Plano Anual",
            detailsHref: "/#planos",
          },
        ]}
      />
      <InstallTutorialsSection
        title="UniTV Download e Instalação — Tutoriais em Vídeo"
        titleHighlight="Tutoriais em Vídeo"
        subtitle="Saiba como baixar o UniTV APK e instalar o aplicativo no seu dispositivo. Clique no tutorial do seu aparelho e siga o passo a passo completo com vídeo."
        cards={[
          {
            id: "tvbox",
            title: "TV Box",
            subtitle: "Instalação rápida",
            modalTitle: "Instalação em TV Box",
            modalVideoUrl: "https://youtu.be/mTbuLBzjG8E",
            modalSteps: [
              "Abra o navegador da TV Box (ex.: Chrome).",
              {
                text: "Acesse ",
                link: {
                  href: "https://baixa.app/unitvbox",
                  label: "https://baixa.app/unitvbox",
                },
              },
              "Faça o download, depois Abrir e Instalar.",
            ],
          },
          {
            id: "tvandroid",
            title: "TV Android",
            subtitle: "Downloader / Play Store",
            modalTitle: "Instalação em TV Android",
            modalVideoUrl: "https://youtu.be/9O-aStaDtFg",
            modalSteps: [
              "Na Play Store, procure por Downloader e instale.",
              "Abra o app e use a barra de pesquisa.",
              "Digite o código: 3364299 e aperte Go.",
              "Quando pedir permissão, habilite Permitir desta fonte para o Downloader.",
              "Instale o app UniTV.",
            ],
          },
          {
            id: "celular",
            title: "Celular Android",
            subtitle: "APK + permissões",
            modalTitle: "Instalação em Celular Android",
            modalVideoUrl: "https://youtu.be/OmPiR0tWFjY",
            modalSteps: [
              {
                text: "Clique e baixe: ",
                link: {
                  href: "https://baixa.app/unitvcelular",
                  label: "unitv-celular.apk",
                },
              },
              'Abra o arquivo. Surgirá o aviso "Para sua segurança..."',
              "Toque em Configurações e habilite Permitir desta fonte.",
              "Volte e abra o arquivo novamente.",
              "Toque em Instalar.",
            ],
          },
          {
            id: "pc-mac",
            title: "PC / Mac",
            subtitle: "Emulador recomendado",
            modalTitle: "Instalação em PC / Mac",
            modalImageSrc: "/images/unitvPCMAC.jpg",
            modalSteps: [
              "Baixe o emulador BlueStacks e o arquivo UniTV:",
              {
                text: "",
                link: {
                  href: "https://www.bluestacks.com",
                  label: "Baixar BlueStacks",
                },
              },
              {
                text: "",
                link: {
                  href: "https://baixa.app/unitv",
                  label: "Baixar UniTV",
                },
              },
              "Instale o BlueStacks e execute.",
              "Arraste o .apk da UniTV para dentro do BlueStacks.",
              "Se canais/filmes ficarem pretos, mude para Reprodutor 2 nas configurações.",
            ],
          },
        ]}
      />
      <TipsSectionWithModal
        title="Dicas para Usar sua Assinatura"
        subtitle="Antes de comprar sua recarga, prepare seu dispositivo. Vincule sua conta, melhore a conexão e escolha o aparelho certo para a melhor experiência. Confira as dicas essenciais do site oficial."
        tips={[
          {
            id: "vincular-conta",
            label: "Antes de comprar",
            title: "Vincular conta no app",
            description:
              "Essencial antes de ativar seu código de recarga. Garante segurança e libera o uso em 2 telas simultâneas.",
            ctaLabel: "Ver tutorial",
            ctaHref: "/#planos",
          },
          {
            id: "estabilidade-tvbox",
            label: "Assinatura TV Box",
            title: "Melhore a estabilidade da sua TV Box",
            description:
              "Para usar a assinatura na TV Box sem travamentos, conecte via cabo de rede (Ethernet). É muito mais estável que Wi-Fi para streaming.",
          },
          {
            id: "tvbox-compativel",
            label: "Dispositivo compatível",
            title: "Qual TV Box usar?",
            description:
              "Para a melhor experiência, recomendamos TV Box de marcas confiáveis como Xiaomi. Evita travamentos e garante qualidade FHD nos canais.",
          },
        ]}
        tutorialVideoUrl="https://www.youtube.com/watch?v=OqEqN1qEPBA"
        tutorialModalTitle="Como Vincular sua Conta UniTV"
        tutorialModalSubtitle="Como vincular uma conta email/celular UniTV"
        tutorialSteps={[
          "AVISO IMPORTANTE: Antes de resgatar o seu código, é essencial vincular uma conta (e-mail ou telefone) no seu perfil do aplicativo.",
          "Ao vincular, você garante a segurança do seu código e ativa o benefício de poder assistir em até 2 telas com a mesma conta.",
        ]}
      />
      <HowToSection
        title="Como Comprar Recarga — Passo a Passo"
        titleHighlight="Passo a Passo"
        subtitle="Comprar sua recarga oficial é rápido e seguro. Veja como funciona: do pagamento via PIX até a entrega imediata do código no seu e-mail."
        steps={[
          {
            id: "escolha-plano",
            stepNumber: 1,
            title: "Escolha seu Plano",
            description:
              "Veja os planos e preços: recarga mensal ou anual. Escolha o que melhor cabe no seu bolso.",
          },
          {
            id: "compre-pix",
            stepNumber: 2,
            title: "Compre via PIX ou Cartão",
            description:
              "Comprar recarga via PIX é instantâneo. Pagamento processado com segurança. Também aceitamos cartão de crédito.",
          },
          {
            id: "codigo-hora",
            stepNumber: 3,
            title: "Código na Hora",
            description:
              "Recarga com entrega imediata: seu código é enviado automaticamente por e-mail assim que o pagamento for confirmado. Sem espera.",
          },
          {
            id: "ative-assinatura",
            stepNumber: 4,
            title: "Ative sua Assinatura",
            description:
              "Abra o app, insira o código de recarga, vincule sua conta e pronto — acesso completo a canais, filmes e séries em até 2 telas.",
          },
        ]}
        ctaLabel="Comprar Recarga Agora"
        ctaHref="/#planos"
      />
      <TestimonialsSection
        title="Quem Compra Recarga, Recomenda"
        subtitle="Veja o que dizem os clientes que já compraram sua assinatura pelo nosso site oficial. Entrega imediata e suporte que fazem diferença."
        testimonials={[
          {
            id: "rafael-m",
            quote:
              "Comprei no sábado de tarde para assistir ao jogo e foi super rápido. Fiz o PIX e a liberação no meu celular foi em menos de 5 minutos. Imagem limpa e sem travamentos.",
            author: "Rafael M.",
            plan: "Recarga Mensal",
          },
          {
            id: "camila-l",
            quote:
              "Cancelei minha operadora de TV tradicional e mudei pro UniTV. Melhor escolha que fiz! O catálogo de filmes é gigante, a família toda usa na TV da sala. Vale cada centavo.",
            author: "Camila L.",
            plan: "Assinatura Semestral",
          },
          {
            id: "roberto-f",
            quote:
              "Eu não sou muito bom com tecnologia, mas o suporte por e-mail teve muita paciência e me ajudou a configurar tudo na minha TV Samsung passo a passo. Atendimento nota 10!",
            author: "Roberto F.",
            plan: "Assinatura Anual",
          },
        ]}
      />
      <FaqSection
        title="Dúvidas sobre Recarga UniTV — Perguntas Frequentes"
        subtitle="Respondemos as principais dúvidas de quem quer comprar recarga UniTV, renovar assinatura UniTV ou saber como funciona o download e instalação do app."
        ctaLabel="Ver todas as dúvidas frequentes"
        ctaHref="#faq"
        items={[
          {
            id: "codigo-apos-pagamento",
            question: "Como recebo meu código após o pagamento?",
            answer:
              "Ao comprar sua recarga UniTV, nosso sistema envia automaticamente o código para o e-mail informado. A recarga UniTV tem entrega imediata: pagou via PIX, recebeu na hora. Para cartão de crédito, o código chega em poucos minutos após confirmação.",
          },
          {
            id: "formas-pagamento",
            question: "Quais são as formas de pagamento aceitas?",
            answer:
              "Você pode comprar recarga UniTV via PIX (confirmação instantânea e entrega imediata do código) ou Cartão de Crédito. Todo o processamento é feito com segurança pela plataforma PagBank. O PIX é a forma mais rápida de comprar sua assinatura UniTV",
          },
          {
            id: "plano-mensal-anual",
            question: "Qual a diferença entre o plano mensal e o anual?",
            answer:
              "A recarga UniTV mensal custa R$ 24,90 e dá acesso por 30 dias. Já a recarga UniTV anual sai por R$ 179,90 (equivalente a ~R$ 14,99/mês), sendo a melhor opção para quem quer assinar UniTV Pro por longo prazo. Ambos os planos incluem canais ao vivo, filmes, séries, 2 telas e suporte técnico. A diferença é apenas o período e o custo-benefício.",
          },
          {
            id: "vincular-conta",
            question: "Por que preciso vincular uma conta no app?",
            answer:
              "Antes de ativar o código da sua recarga UniTV, é essencial vincular uma conta (e-mail ou telefone) no app. Isso garante a segurança da sua assinatura UniTV e libera o benefício de assistir em até 2 telas simultâneas. Sem a vinculação, você não consegue usar o código de recarga corretamente.",
          },
          {
            id: "dispositivos",
            question: "Em quais dispositivos posso usar a UniTV?",
            answer:
              "O app UniTV é compatível com TV Box (assinatura UniTV TV Box), Smart TV com Android, celular Android (UniTV APK) e PC/Mac (via emulador BlueStacks). Para fazer o UniTV download e instalação, confira nossos tutoriais em vídeo com passo a passo para cada dispositivo. Após instalar, basta comprar o código UniTV e ativar.",
          },
        ]}
      />
      <CtaCardSection
        title="Comprar Recarga UniTV Oficial — Assine Agora"
        description="Este é o UniTV site oficial. Compre sua UniTV recarga via PIX e receba o código com entrega imediata por e-mail. Comprar código UniTV é rápido: escolha entre os planos mensal e anual, faça o pagamento e receba na hora. Comprar acesso UniTV oficial com suporte completo para instalação em TV Box, celular e Smart TV."
        monthlyLabel="Comprar Recarga Mensal — R$ 24,90"
        monthlyHref="/#planos"
        annualLabel="Comprar Recarga Anual — R$ 179,90"
        annualHref="/#planos"
        footerText="Precisa renovar assinatura UniTV ou tem dúvidas? Consulte nossas perguntas frequentes."
        footerHref="#faq"
      />
    </div>
  );
}
