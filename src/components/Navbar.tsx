import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/culturhist-logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const isAppSection = ['/app', '/quiz', '/facts'].includes(location.pathname);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <img src={logo} alt="CulturHist Logo" className="w-8 h-8 group-hover:scale-110 smooth-transition" />
            <span className="text-xl font-bold text-foreground">CulturHist</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {!isAppSection ? (
              <>
                <a 
                  href="#features" 
                  className="text-foreground/80 hover:text-foreground smooth-transition font-medium"
                >
                  Caractéristiques
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
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/app')}
                  className="text-foreground/80 hover:text-foreground smooth-transition font-medium"
                >
                  Accueil
                </button>
                <button 
                  onClick={() => navigate('/quiz')}
                  className="text-foreground/80 hover:text-foreground smooth-transition font-medium"
                >
                  Quiz
                </button>
              </>
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Button variant="hero" onClick={() => navigate('/app')}>
                Mon espace
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Se connecter
                </Button>
                <Button variant="hero" onClick={() => navigate('/auth')}>
                  Commencer
                </Button>
              </>
            )}
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
              {!isAppSection ? (
                <>
                  <a 
                    href="#features" 
                    className="text-foreground/80 hover:text-foreground smooth-transition font-medium px-4 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Caractéristiques
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
                </>
              ) : (
                <>
                  <button 
                    onClick={() => { navigate('/app'); setIsOpen(false); }}
                    className="text-foreground/80 hover:text-foreground smooth-transition font-medium px-4 py-2 text-left"
                  >
                    Accueil
                  </button>
                  <button 
                    onClick={() => { navigate('/quiz'); setIsOpen(false); }}
                    className="text-foreground/80 hover:text-foreground smooth-transition font-medium px-4 py-2 text-left"
                  >
                    Quiz
                  </button>
                </>
              )}
              <div className={`flex flex-col gap-2 px-4 pt-4 ${!isAppSection ? 'border-t border-border' : ''}`}>
                {user ? (
                  <Button variant="hero" className="w-full" onClick={() => { navigate('/app'); setIsOpen(false); }}>
                    Mon espace
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full" onClick={() => { navigate('/auth'); setIsOpen(false); }}>
                      Se connecter
                    </Button>
                    <Button variant="hero" className="w-full" onClick={() => { navigate('/auth'); setIsOpen(false); }}>
                      Commencer
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
