import { cn } from "@/lib/utils";
import Mascot, { type MascotMood } from "@/components/mascot/Mascot";

interface MascotBubbleProps {
  mood: MascotMood;
  text: string;
  grade?: number | null;
  className?: string;
  /** Mascot on the right, bubble pointing at it. */
  reverse?: boolean;
}

/** Minerve with a speech bubble. */
const MascotBubble = ({ mood, text, grade, className, reverse }: MascotBubbleProps) => (
  <div className={cn("flex items-end gap-2", reverse && "flex-row-reverse", className)}>
    <Mascot mood={mood} grade={grade} className="h-20 w-20 shrink-0" />
    <p
      role="status"
      className={cn(
        "relative mb-4 min-w-0 flex-1 rounded-2xl bg-card px-4 py-3 text-sm font-medium leading-snug card-shadow animate-scale-in",
        reverse ? "rounded-br-sm" : "rounded-bl-sm"
      )}
    >
      {text}
    </p>
  </div>
);

export default MascotBubble;
