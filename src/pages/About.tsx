import { Helmet } from "react-helmet-async";
import { Award, Users, Target, Heart } from "lucide-react";
import { CMSText } from "@/components/cms/CMSText";
import { CMSImage } from "@/components/cms/CMSImage";

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
          <CMSText
            path="about.heroTitle"
            className="font-serif text-4xl font-bold text-foreground sm:text-5xl"
          />
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            <CMSText path="about.heroSubtitle" multiline />
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <CMSText
                path="about.missionTitle"
                className="font-serif text-3xl font-bold text-foreground"
              />
              <p className="mt-6 text-lg text-muted-foreground">
                <CMSText path="about.missionText1" multiline />
              </p>
              <p className="mt-4 text-lg text-muted-foreground">
                <CMSText path="about.missionText2" multiline />
              </p>
            </div>
            <CMSImage
              path="about.image"
              alt="Sobre a MedBeauty"
              containerClassName="relative aspect-video overflow-hidden rounded-2xl bg-muted"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-border bg-card py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <CMSText
              path="about.valuesTitle"
              className="font-serif text-3xl font-bold text-foreground"
            />
            <p className="mt-4 text-muted-foreground">
              <CMSText path="about.valuesSubtitle" />
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
              <CMSText path="about.stat1Value" className="font-serif text-4xl font-bold text-primary" />
              <CMSText path="about.stat1Label" className="mt-2 text-muted-foreground block" />
            </div>
            <div>
              <CMSText path="about.stat2Value" className="font-serif text-4xl font-bold text-primary" />
              <CMSText path="about.stat2Label" className="mt-2 text-muted-foreground block" />
            </div>
            <div>
              <CMSText path="about.stat3Value" className="font-serif text-4xl font-bold text-primary" />
              <CMSText path="about.stat3Label" className="mt-2 text-muted-foreground block" />
            </div>
            <div>
              <CMSText path="about.stat4Value" className="font-serif text-4xl font-bold text-primary" />
              <CMSText path="about.stat4Label" className="mt-2 text-muted-foreground block" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
