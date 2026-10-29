import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { LEGAL, LEGAL_LINKS } from "@/lib/legal";

/**
 * The frame of the pages anyone can read without an account: discovery,
 * fact pages and legal pages. Readable on a phone like the app, wider on a desktop.
 */
const PublicPage = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-[100dvh] subtle-gradient">
      <header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <LogoMark className="h-8 w-8" title="" />
            <Wordmark className="text-xl" />
          </Link>
          <Button asChild variant="hero" size="sm" className="rounded-full px-4">
            <Link to={user ? "/app" : "/"}>{user ? "Ouvrir l'app" : "Commencer"}</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-10 pt-6">{children}</main>

      <footer className="border-t pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6">
        <div className="mx-auto max-w-2xl space-y-3 px-4 text-sm text-muted-foreground">
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            <Link to="/decouvrir" className="hover:text-foreground">Découvrir</Link>
            {LEGAL_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
          <p>
            © {new Date().getFullYear()} {LEGAL.site} ·{" "}
            <a href={`mailto:${LEGAL.contact}`} className="hover:text-foreground">
              {LEGAL.contact}
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicPage;
