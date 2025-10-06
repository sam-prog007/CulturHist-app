import { Button } from "@/components/ui/button";
import { Award, BookOpen, Calendar, Sparkles, Target } from "lucide-react";
import heroImage from "@/assets/hero-history.jpg";
import logo from "@/assets/culturhist-logo.png";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  
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

          {/* Main Heading with Logo */}
          <div className="flex flex-col items-center space-y-6">
            <img 
              src={logo} 
              alt="CulturHist Logo" 
              className="w-32 h-32 md:w-40 md:h-40 animate-scale-in"
            />
            <h1 className="text-4xl md:text-5xl text-muted-foreground font-normal">
              Votre dose quotidienne d'histoire
            </h1>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Enrichissez votre culture avec des faits historiques fascinants chaque jour. 
            Personnalisez votre parcours, gagnez des récompenses et ne manquez jamais une découverte.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="xl" 
              variant="hero" 
              className="w-full sm:w-auto"
              onClick={() => navigate('/auth')}
            >
              <Calendar className="w-5 h-5" />
              Commencer gratuitement
            </Button>
            <Button 
              size="xl" 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <BookOpen className="w-5 h-5" />
              En savoir plus
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-3xl mx-auto">
            {[
              { icon: BookOpen, value: "365+", label: "Faits par an" },
              { icon: Award, value: "50+", label: "Récompenses" },
              { icon: Target, value: "Tous", label: "Niveaux" },
              { icon: Sparkles, value: "Gratuit", label: "" },
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
