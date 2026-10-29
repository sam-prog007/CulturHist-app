import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import BottomSheet from "@/components/BottomSheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LEGAL } from "@/lib/legal";

const MOODS = [
  { value: 1, emoji: "😕", label: "Pas convaincu" },
  { value: 2, emoji: "😐", label: "Bof" },
  { value: 3, emoji: "🙂", label: "Bien" },
  { value: 4, emoji: "😍", label: "J'adore" },
];

interface FeedbackSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * "Donner mon avis": a mood and a message, saved in the feedback table that
 * only the team reads. If saving fails, the message can still go by e-mail.
 */
const FeedbackSheet = ({ open, onOpenChange }: FeedbackSheetProps) => {
  const [mood, setMood] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const { pathname } = useLocation();

  const send = async () => {
    setSending(true);
    const { error } = await supabase.from("feedback").insert({
      mood,
      message: message.trim(),
      page: pathname,
      app_version: __APP_VERSION__,
      user_agent: navigator.userAgent.slice(0, 300),
    });
    setSending(false);
    if (error) {
      setFailed(true);
      return;
    }
    toast.success("Merci pour votre avis !", { description: "Il nous aide vraiment à améliorer CulturHist." });
    setMood(null);
    setMessage("");
    onOpenChange(false);
  };

  const mailto = `mailto:${LEGAL.contact}?subject=${encodeURIComponent("Mon avis sur CulturHist")}&body=${encodeURIComponent(message)}`;

  return (
    <BottomSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) setFailed(false);
        onOpenChange(next);
      }}
      title="Donner mon avis"
      description="Un bug, une idée, un fait qui vous a plu ? Tout nous aide."
    >
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Votre impression">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={mood === m.value}
              onClick={() => setMood(mood === m.value ? null : m.value)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl border-2 bg-card px-1 py-2 text-xs font-medium transition-colors",
                mood === m.value ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
              )}
            >
              <span className="text-2xl" aria-hidden="true">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={4000}
          rows={5}
          placeholder="Qu'est-ce qui vous plaît, vous gêne ou vous manque ?"
          className="rounded-xl bg-card text-base"
          aria-label="Votre message"
        />

        {failed && (
          <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            L'envoi n'a pas fonctionné.{" "}
            <a href={mailto} className="font-semibold underline">
              Envoyez-le plutôt par e-mail
            </a>
            .
          </p>
        )}

        <Button variant="hero" size="lg" className="h-12 w-full rounded-xl" disabled={!message.trim() || sending} onClick={send}>
          {sending ? <Loader2 className="animate-spin" /> : <Send />}
          Envoyer
        </Button>
      </div>
    </BottomSheet>
  );
};

export default FeedbackSheet;
