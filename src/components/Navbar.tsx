import { Button } from "@/components/ui/button";
import { Menu, X, Flame, LogOut, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/culturhist-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const isAppSection = ['/app', '/quiz', '/facts', '/profile', '/quiz-limit', '/facts-limit', '/learned-facts'].includes(location.pathname);

  useEffect(() => {
    const fetchStreak = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('current_streak')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setStreak(data?.current_streak || 0);
      } catch (error) {
        console.error('Error fetching streak:', error);
      }
    };

    fetchStreak();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Déconnexion réussie');
    navigate('/');
  };

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
                  className={`text-foreground/80 hover:text-foreground smooth-transition font-medium pb-1 ${
                    location.pathname === '/app' ? 'border-b-2 border-primary text-foreground' : ''
                  }`}
                >
                  Accueil
                </button>
                <button 
                  onClick={() => navigate('/quiz')}
                  className={`text-foreground/80 hover:text-foreground smooth-transition font-medium pb-1 ${
                    location.pathname === '/quiz' ? 'border-b-2 border-primary text-foreground' : ''
                  }`}
                >
                  Quiz
                </button>
                <button 
                  onClick={() => navigate('/profile')}
                  className={`text-foreground/80 hover:text-foreground smooth-transition font-medium pb-1 ${
                    location.pathname === '/profile' ? 'border-b-2 border-primary text-foreground' : ''
                  }`}
                >
                  Profil
                </button>
              </>
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
          {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
                  <Flame className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold text-accent">{streak}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="hero">
                      Mon espace
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Modifier mes informations
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Se déconnecter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
                    className={`text-foreground/80 hover:text-foreground smooth-transition font-medium px-4 py-2 text-left ${
                      location.pathname === '/app' ? 'text-primary font-semibold' : ''
                    }`}
                  >
                    Accueil
                  </button>
                  <button 
                    onClick={() => { navigate('/quiz'); setIsOpen(false); }}
                    className={`text-foreground/80 hover:text-foreground smooth-transition font-medium px-4 py-2 text-left ${
                      location.pathname === '/quiz' ? 'text-primary font-semibold' : ''
                    }`}
                  >
                    Quiz
                  </button>
                  <button 
                    onClick={() => { navigate('/profile'); setIsOpen(false); }}
                    className={`text-foreground/80 hover:text-foreground smooth-transition font-medium px-4 py-2 text-left ${
                      location.pathname === '/profile' ? 'text-primary font-semibold' : ''
                    }`}
                  >
                    Profil
                  </button>
                </>
              )}
              <div className={`flex flex-col gap-2 px-4 pt-4 ${!isAppSection ? 'border-t border-border' : ''}`}>
                {user ? (
                  <>
                    <Button variant="outline" className="w-full" onClick={() => { navigate('/profile'); setIsOpen(false); }}>
                      <Settings className="mr-2 h-4 w-4" />
                      Modifier mes informations
                    </Button>
                    <Button variant="hero" className="w-full" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Se déconnecter
                    </Button>
                  </>
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
