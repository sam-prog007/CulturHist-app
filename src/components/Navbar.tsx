import { Button } from "@/components/ui/button";
import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <BookOpen className="w-6 h-6 text-primary group-hover:scale-110 smooth-transition" />
            <span className="text-xl font-bold text-foreground">Culturhist</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a 
              href="#features" 
              className="text-foreground/80 hover:text-foreground smooth-transition font-medium"
            >
              Fonctionnalités
            </a>
            <a 
              href="#how-it-works" 
              className="text-foreground/80 hover:text-foreground smooth-transition font-medium"
            >
              Comment ça marche
            </a>
            <a 
              href="#about" 
              className="text-foreground/80 hover:text-foreground smooth-transition font-medium"
            >
              À propos
            </a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost">
              Se connecter
            </Button>
            <Button variant="hero">
              Commencer
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground hover:bg-muted rounded-lg smooth-transition"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col space-y-4">
              <a 
                href="#features" 
                className="text-foreground/80 hover:text-foreground smooth-transition font-medium px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                Fonctionnalités
              </a>
              <a 
                href="#how-it-works" 
                className="text-foreground/80 hover:text-foreground smooth-transition font-medium px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                Comment ça marche
              </a>
              <a 
                href="#about" 
                className="text-foreground/80 hover:text-foreground smooth-transition font-medium px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                À propos
              </a>
              <div className="flex flex-col gap-2 px-4 pt-4 border-t border-border">
                <Button variant="ghost" className="w-full">
                  Se connecter
                </Button>
                <Button variant="hero" className="w-full">
                  Commencer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
