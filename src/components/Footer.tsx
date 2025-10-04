import { BookOpen, Mail, Twitter, Facebook, Instagram } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              <span className="text-xl font-bold">Culturhist</span>
            </div>
            <p className="text-primary-foreground/80 text-sm">
              Votre compagnon quotidien pour découvrir l'histoire du monde.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Produit</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <a href="#" className="hover:text-primary-foreground smooth-transition">
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground smooth-transition">
                  Tarifs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground smooth-transition">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Entreprise</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <a href="#" className="hover:text-primary-foreground smooth-transition">
                  À propos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground smooth-transition">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground smooth-transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Légal</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <a href="#" className="hover:text-primary-foreground smooth-transition">
                  Confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground smooth-transition">
                  Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground smooth-transition">
                  Mentions légales
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © {currentYear} Culturhist. Tous droits réservés.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a 
              href="#" 
              className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 smooth-transition"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a 
              href="#" 
              className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 smooth-transition"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a 
              href="#" 
              className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 smooth-transition"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a 
              href="#" 
              className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 smooth-transition"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
