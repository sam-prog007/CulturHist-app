import { useId } from "react";
import { cn } from "@/lib/utils";
import Mascot from "@/components/mascot/Mascot";

const GOLD = "#e0a82e";
const BROWN = "#5c3620";

/** Laurel leaves around the medallion, open at the top. */
const LEAVES = Array.from({ length: 16 }, (_, i) => {
  const side = i < 8 ? -1 : 1;
  const t = ((i % 8) + 0.5) / 8;
  const a = Math.PI / 2 + side * (0.25 + t * 0.62) * Math.PI;
  const x = 60 + 46 * Math.cos(a);
  const y = 60 + 46 * Math.sin(a);
  return { x, y, angle: (a * 180) / Math.PI + 90 + (i % 2 ? 30 : -30) };
});

/** The CulturHist medallion: Minerve's head inside a gold laurel ring. Also the app icon. */
export const LogoMark = ({ className, title = "CulturHist" }: { className?: string; title?: string }) => {
  const clip = `medal-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label={title}>
      <circle cx={60} cy={60} r={57} fill={BROWN} />
      <circle cx={60} cy={60} r={52} fill="none" stroke={GOLD} strokeWidth={3} />
      {LEAVES.map(({ x, y, angle }, i) => (
        <ellipse key={i} cx={x} cy={y} rx={5.5} ry={2.6} fill={GOLD} transform={`rotate(${angle} ${x} ${y})`} />
      ))}
      <clipPath id={clip}>
        <circle cx={60} cy={60} r={42} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <Mascot framing="head" animated={false} x={16} y={18} width={88} height={88} />
      </g>
    </svg>
  );
};

/** "CulturHist" in the app's serif, "Hist" in gold. */
export const Wordmark = ({ className }: { className?: string }) => (
  <span className={cn("font-serif font-extrabold tracking-tight text-accent", className)}>
    Cultur<span className="text-primary">Hist</span>
  </span>
);
