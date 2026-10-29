import { cn } from "@/lib/utils";

const GOLD = "#e0a82e";
const GOLD_DARK = "#b98314";
const BROWN = "#5c3620";

/** One branch of laurel, from the bottom of the medallion up one side. */
const branch = (side: -1 | 1) =>
  Array.from({ length: 7 }, (_, i) => {
    const t = (i + 0.8) / 7.4;
    // From the bottom (90°) up towards the top, on the left (side -1) or the right.
    const a = Math.PI / 2 + side * (0.08 + t * 0.7) * Math.PI;
    const x = 60 + 42 * Math.cos(a);
    const y = 60 + 42 * Math.sin(a);
    const tangent = (a * 180) / Math.PI + 90;
    return [-1, 1].map((out) => {
      const lx = x + out * 3.6 * Math.cos(a);
      const ly = y + out * 3.6 * Math.sin(a);
      return { lx, ly, angle: tangent + side * out * 40 };
    });
  }).flat();

const LEAVES = [...branch(-1), ...branch(1)];

/** The CulturHist medallion: a serif "CH" in a gold laurel wreath. Also the app icon. */
export const LogoMark = ({ className, title = "CulturHist" }: { className?: string; title?: string }) => (
  <svg viewBox="0 0 120 120" className={className} role={title ? "img" : undefined} aria-label={title || undefined} aria-hidden={title ? undefined : true}>
    <circle cx={60} cy={60} r={58} fill={BROWN} />
    <circle cx={60} cy={60} r={54} fill="none" stroke={GOLD} strokeWidth={2.5} />
    <path d="M56 101 A42 42 0 0 1 21 39 M64 101 A42 42 0 0 0 99 39" stroke={GOLD_DARK} strokeWidth={1.4} fill="none" />
    <g fill={GOLD} stroke={GOLD_DARK} strokeWidth={0.5}>
      {LEAVES.map(({ lx, ly, angle }, i) => (
        <ellipse key={i} cx={lx} cy={ly} rx={4.8} ry={2.1} transform={`rotate(${angle} ${lx} ${ly})`} />
      ))}
    </g>
    <circle cx={60} cy={102} r={2.2} fill={GOLD} />
    <text
      x={60}
      y={73}
      textAnchor="middle"
      fontFamily="'Playfair Display', Georgia, serif"
      fontWeight={800}
      fontSize={38}
      fill={GOLD}
      letterSpacing={-1}
    >
      CH
    </text>
  </svg>
);

/** "CulturHist" in the app's serif, "Hist" in gold. */
export const Wordmark = ({ className }: { className?: string }) => (
  <span className={cn("font-serif font-extrabold tracking-tight text-accent", className)}>
    Cultur<span className="text-primary">Hist</span>
  </span>
);
