import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Companion from "@/components/companions/Companion";
import type { CompanionInfo } from "@/lib/companions";

interface CompanionUnlockProps {
  companion: CompanionInfo;
  onChoose: () => void;
  onLater: () => void;
}

/** Full-screen welcome of a newly unlocked companion, who introduces itself. */
const CompanionUnlock = ({ companion, onChoose, onLater }: CompanionUnlockProps) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-label={`Nouveau compagnon : ${companion.name}`}
    className="fixed inset-0 z-[60] flex flex-col overflow-y-auto accent-gradient px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] text-accent-foreground animate-fade-in"
  >
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-5 text-center">
      <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold">
        <Sparkles className="h-4 w-4 text-gold" /> Nouveau compagnon débloqué !
      </p>
      <div className="relative">
        <span className="absolute inset-4 rounded-full bg-gold/40 blur-2xl" aria-hidden="true" />
        <Companion id={companion.id} mood="wave" className="relative h-56 w-48 animate-flame-burst" />
      </div>
      <div className="space-y-2">
        <h1 className="font-serif text-4xl font-bold text-gold">{companion.name}</h1>
        <p className="text-sm opacity-80">{companion.bio}</p>
      </div>
      <p className="rounded-2xl bg-white/15 px-4 py-3 font-serif text-lg italic leading-snug">« {companion.lines.unlock} »</p>
    </div>
    <div className="mx-auto mt-6 w-full max-w-sm space-y-2">
      <Button variant="hero" size="lg" className="w-full" onClick={onChoose}>
        En faire mon compagnon
      </Button>
      <Button variant="ghost" className="w-full text-accent-foreground hover:bg-white/10 hover:text-accent-foreground" onClick={onLater}>
        Plus tard
      </Button>
    </div>
  </div>
);

export default CompanionUnlock;
