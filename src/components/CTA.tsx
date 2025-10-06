import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
const CTA = () => {
  return <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <div className="hero-gradient rounded-3xl p-12 md:p-16 text-center space-y-8 elegant-shadow animate-fade-in relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">
                Rejoignez l'aventure
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground">
              Prêt à enrichir votre culture ?
            </h2>

            {/* Description */}
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">Commencez dès aujourd'hui votre voyage à travers l'histoire. Recevez votre premier fait historique gratuitement en quelques secondes.</p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button size="xl" variant="accent" className="w-full sm:w-auto group" onClick={() => document.getElementById('features')?.scrollIntoView({
              behavior: 'smooth'
            })}>
                Commencer maintenant
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 smooth-transition" />
              </Button>
              <Button size="xl" variant="outline" className="w-full sm:w-auto bg-primary-foreground hover:bg-primary-foreground/90 text-primary border-0" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({
              behavior: 'smooth'
            })}>
                En savoir plus
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                <span>100% gratuit</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                <span>Sans engagement</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                <span>Sécurisé</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default CTA;