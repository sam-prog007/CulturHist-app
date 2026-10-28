import { cn } from "@/lib/utils";
import Companion, { type CompanionMood } from "@/components/companions/Companion";
import type { CompanionInfo } from "@/lib/companions";

interface CompanionBubbleProps {
  companion: CompanionInfo;
  mood: CompanionMood;
  text: string;
  className?: string;
}

/** The active companion with a speech bubble, signed with its name. */
const CompanionBubble = ({ companion, mood, text, className }: CompanionBubbleProps) => (
  <div className={cn("flex items-end gap-2", className)}>
    <Companion id={companion.id} mood={mood} className="h-24 w-[5.25rem] shrink-0" />
    <div className="relative mb-5 min-w-0 flex-1 rounded-2xl rounded-bl-sm bg-card px-4 py-3 card-shadow animate-scale-in">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">{companion.name}</p>
      <p role="status" className="text-sm font-medium leading-snug">
        {text}
      </p>
    </div>
  </div>
);

export default CompanionBubble;
