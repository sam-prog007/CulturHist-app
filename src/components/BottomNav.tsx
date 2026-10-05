import { NavLink, useLocation } from "react-router-dom";
import { Brain, Home, Map, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/app", label: "Accueil", icon: Home, also: ["/facts"] },
  { to: "/quiz", label: "Quiz", icon: Brain, also: [] },
  { to: "/cartes", label: "Cartes", icon: Map, also: [] },
  { to: "/profile", label: "Profil", icon: User, also: ["/learned-facts"] },
];

/** Bottom tab bar of the signed-in app, in a frosted "liquid glass" style. */
const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="glass-bar mx-auto flex max-w-md items-stretch justify-between rounded-full p-1.5">
        {TABS.map(({ to, label, icon: Icon, also }) => {
          const active = pathname === to || also.includes(pathname);
          return (
            <NavLink
              key={to}
              to={to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-1.5 text-[11px] font-medium smooth-transition",
                active ? "bg-primary/15 text-accent" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-primary")} strokeWidth={active ? 2.4 : 2} />
              {label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
