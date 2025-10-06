import { UserPlus, Settings, Calendar, Trophy, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "Créez votre compte",
      description: "Inscrivez-vous gratuitement en quelques secondes",
      color: "text-primary"
    },
    {
      icon: Settings,
      title: "Personnalisez vos préférences",
      description: "Choisissez vos périodes et pays préférés",
      color: "text-accent"
    },
    {
      icon: Calendar,
      title: "Recevez vos faits quotidiens",
      description: "Découvrez un nouveau fait historique chaque jour",
      color: "text-primary"
    },
    {
      icon: CheckCircle,
      title: "Répondez aux quiz",
      description: "Validez vos connaissances avec des questions interactives",
      color: "text-accent"
    },
    {
      icon: Trophy,
      title: "Gagnez des récompenses",
      description: "Maintenez votre série et débloquez des badges",
      color: "text-primary"
    },
  ];

  return (
    <section className="py-20 px-4 subtle-gradient">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Commencez votre voyage dans l'histoire en cinq étapes simples
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Hidden on mobile */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary transform -translate-y-1/2 opacity-20"></div>

          <div className="grid md:grid-cols-5 gap-6 relative">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="relative flex flex-col items-center text-center space-y-4 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Step Number Badge */}
                <div className="absolute -top-4 right-1/2 translate-x-1/2 md:translate-x-0 md:right-auto md:-top-8 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold elegant-shadow z-10">
                  {index + 1}
                </div>

                {/* Icon Circle */}
                <div className="w-20 h-20 rounded-full bg-card border-2 border-border flex items-center justify-center group hover:scale-110 smooth-transition elegant-shadow relative z-10">
                  <step.icon className={`w-10 h-10 ${step.color}`} />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
