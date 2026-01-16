import { Helmet } from "react-helmet-async";
import { Award, Users, Target, Heart } from "lucide-react";

const values = [
  {
    icon: Award,
    title: "Excelência",
    description: "Buscamos a excelência em cada produto que oferecemos.",
  },
  {
    icon: Users,
    title: "Parceria",
    description: "Somos parceiros dos profissionais de estética.",
  },
  {
    icon: Target,
    title: "Inovação",
    description: "Investimos constantemente em tecnologia e pesquisa.",
  },
  {
    icon: Heart,
    title: "Cuidado",
    description: "Cuidamos da beleza e bem-estar de cada cliente.",
  },
];

export default function About() {
  return (
    <>
      <Helmet>
        <title>Sobre Nós | MedBeauty</title>
        <meta
          name="description"
          content="Conheça a MedBeauty: empresa líder em produtos para estética profissional no Brasil. Nossa missão é unir beleza e tecnologia."
        />
      </Helmet>

      {/* Hero */}
      <section className="gradient-elegant py-24">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">
            Sobre a MedBeauty
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Naturalmente beauty, definitivamente tech. Somos uma empresa comprometida
            com a inovação em produtos para estética profissional.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground">
                Nossa Missão
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">
                A MedBeauty nasceu com o propósito de oferecer aos profissionais de
                estética os melhores produtos do mercado, unindo tecnologia de ponta
                e resultados comprovados.
              </p>
              <p className="mt-4 text-lg text-muted-foreground">
                Trabalhamos com marcas reconhecidas internacionalmente e somos
                pioneiros na introdução de diversas tecnologias no mercado brasileiro.
              </p>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted">
              <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                <span className="font-serif text-2xl text-primary">MedBeauty</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-border bg-card py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground">
              Nossos Valores
            </h2>
            <p className="mt-4 text-muted-foreground">
              Os princípios que guiam nossa atuação no mercado
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-border bg-background p-6 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-serif text-4xl font-bold text-primary">10+</p>
              <p className="mt-2 text-muted-foreground">Anos de experiência</p>
            </div>
            <div>
              <p className="font-serif text-4xl font-bold text-primary">5.000+</p>
              <p className="mt-2 text-muted-foreground">Clientes atendidos</p>
            </div>
            <div>
              <p className="font-serif text-4xl font-bold text-primary">50+</p>
              <p className="mt-2 text-muted-foreground">Produtos no catálogo</p>
            </div>
            <div>
              <p className="font-serif text-4xl font-bold text-primary">27</p>
              <p className="mt-2 text-muted-foreground">Estados atendidos</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
