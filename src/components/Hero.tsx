import { Button } from "@/components/ui/button";
import { Award, BookOpen, Calendar, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-history.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center subtle-gradient overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Manuscrits historiques et artefacts anciens" 
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 z-10 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 animate-scale-in">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent-foreground">
              Découvrez l'histoire au quotidien
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            <span className="hero-gradient bg-clip-text text-transparent">
              Culturhist
            </span>
            <br />
            <span className="text-4xl md:text-5xl text-muted-foreground font-normal">
              Votre dose quotidienne d'histoire
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Enrichissez votre culture avec des faits historiques fascinants chaque jour. 
            Personnalisez votre parcours, gagnez des récompenses et ne manquez jamais une découverte.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="xl" variant="hero" className="w-full sm:w-auto">
              <Calendar className="w-5 h-5" />
              Commencer gratuitement
            </Button>
            <Button size="xl" variant="outline" className="w-full sm:w-auto">
              <BookOpen className="w-5 h-5" />
              En savoir plus
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-3xl mx-auto">
            {[
              { icon: BookOpen, value: "365+", label: "Faits par an" },
              { icon: Award, value: "50+", label: "Récompenses" },
              { icon: Calendar, value: "7j/7", label: "Disponible" },
              { icon: Sparkles, value: "100%", label: "Gratuit" },
            ].map((stat, index) => (
              <div 
                key={index} 
                className="space-y-2 animate-fade-in-up p-4 rounded-lg hover:bg-secondary/50 smooth-transition card-shadow"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <stat.icon className="w-6 h-6 text-primary mx-auto" />
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
