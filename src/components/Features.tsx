import { Calendar, Trophy, Bell, Sparkles, Globe, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: Calendar,
      title: "Faits quotidiens personnalisés",
      description: "Recevez chaque jour un fait historique adapté à vos périodes et pays préférés.",
      gradient: "from-primary/10 to-primary/5"
    },
    {
      icon: Trophy,
      title: "Système de récompenses",
      description: "Gagnez des points, des badges et maintenez votre série pour débloquer des réalisations.",
      gradient: "from-accent/10 to-accent/5"
    },
    {
      icon: Globe,
      title: "Personnalisation avancée",
      description: "Choisissez vos périodes historiques et pays favoris pour une expérience sur mesure.",
      gradient: "from-primary/10 to-primary/5"
    },
    {
      icon: Bell,
      title: "Rappels intelligents",
      description: "Ne manquez jamais votre dose d'histoire avec des notifications personnalisables.",
      gradient: "from-accent/10 to-accent/5"
    },
    {
      icon: Target,
      title: "Suivi de progression",
      description: "Visualisez votre série, vos réalisations et votre parcours d'apprentissage.",
      gradient: "from-primary/10 to-primary/5"
    },
    {
      icon: Sparkles,
      title: "Interface élégante",
      description: "Profitez d'une expérience visuelle raffinée inspirée de l'histoire et du patrimoine.",
      gradient: "from-accent/10 to-accent/5"
    },
  ];

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Fonctionnalités
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tout ce dont vous avez besoin pour enrichir votre culture historique au quotidien
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group hover:scale-105 smooth-transition card-shadow hover:elegant-shadow animate-fade-in-up border-border/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 space-y-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 smooth-transition`}>
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
