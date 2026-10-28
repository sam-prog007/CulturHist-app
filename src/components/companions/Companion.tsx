import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { CompanionId } from "@/components/companions/ids";

/*
 * The companions: ten historical figures drawn as "chibi" characters (big
 * head, small body). They share one body and one face, which carries the
 * mood; each figure adds what makes it recognisable (Napoléon's bicorne,
 * César's laurels, Cléopâtre's diadem…). SVG, so that they stay sharp, light
 * and animatable: blink and bounce in index.css, waving with SMIL, all still
 * with prefers-reduced-motion.
 */

export type CompanionMood = "happy" | "cheer" | "sad" | "sleepy" | "think" | "wave";

const INK = "#2b1a10";
const GOLD = "#e0a82e";
const GOLD_DARK = "#a8770f";
const WHITE = "#fbf6ec";
/** Linen, for the white clothes of Egypt and Rome. */
const LINEN = "#f1e6cf";
const OUTLINE = "rgba(43, 26, 16, 0.22)";
const CHEEK = "#ee8f7f";

type Point = [number, number];

interface Look {
  skin: string;
  /** Torso and sleeves. */
  outfit: string;
  legs?: string;
  /** Drawn behind everything: capes, long hair, headcloth lappets. */
  back?: ReactNode;
  /** Over the torso: collars, belts, sashes. */
  body?: ReactNode;
  /** Over the face, under the headwear: beards, moustaches, make-up. */
  face?: ReactNode;
  /** Hair and headwear. */
  head?: ReactNode;
  /** Held in the left hand when it hangs down. */
  item?: (hand: Point) => ReactNode;
  /** Napoléon keeps his hand in his waistcoat when all is well. */
  handInWaistcoat?: boolean;
}

const laurel = (cy: number, spread = 58) => (
  <g>
    {Array.from({ length: 14 }, (_, i) => {
      const side = i < 7 ? -1 : 1;
      const t = ((i % 7) + 0.5) / 7;
      const a = Math.PI / 2 + side * (0.12 + t * 0.78) * (Math.PI / 2);
      const x = 100 + spread * Math.cos(a);
      const y = cy - 34 * Math.sin(a);
      const angle = (Math.atan2(-34 * Math.cos(a), -spread * Math.sin(a)) * 180) / Math.PI;
      return (
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx={9}
          ry={4}
          fill={GOLD}
          stroke={GOLD_DARK}
          strokeWidth={1}
          transform={`rotate(${angle + (i % 2 ? 28 : -28)} ${x} ${y})`}
        />
      );
    })}
  </g>
);

const scroll = ([x, y]: Point) => (
  <g transform={`translate(${x - 6} ${y - 22}) rotate(-12)`}>
    <rect x={0} y={0} width={12} height={34} rx={3} fill="#efe2c2" stroke="#c9b28a" strokeWidth={1.5} />
    <rect x={-2} y={-2} width={16} height={6} rx={3} fill="#c9a46a" />
    <rect x={-2} y={30} width={16} height={6} rx={3} fill="#c9a46a" />
  </g>
);

/** Each figure's look; `nemes` is the id of Ramsès' striped headcloth pattern in this picture. */
const looks = (nemes: string): Record<CompanionId, Look> => ({
  napoleon: {
    skin: "#f3d4b5",
    outfit: "#24427a",
    legs: "#f2ece0",
    handInWaistcoat: true,
    body: (
      <g>
        <path d="M88 160 L100 196 L112 160 Z" fill={WHITE} />
        <path d="M62 166 Q72 158 82 162 L80 170 Q70 168 62 174 Z M138 166 Q128 158 118 162 L120 170 Q130 168 138 174 Z" fill={GOLD} />
        {[176, 190, 204].map((y) => (
          <g key={y} fill={GOLD}>
            <circle cx={88} cy={y} r={2.5} />
            <circle cx={112} cy={y} r={2.5} />
          </g>
        ))}
      </g>
    ),
    head: (
      <g>
        <path d="M62 66 Q70 40 100 38 Q130 40 138 66 Q120 56 104 60 Q112 70 100 78 Q96 64 82 62 Q70 62 62 66 Z" fill="#3a2418" />
        <path d="M20 66 Q100 -14 180 66 Q100 40 20 66 Z" fill="#1a1820" />
        <path d="M28 62 Q100 34 172 62" stroke={GOLD} strokeWidth={3} fill="none" />
        <circle cx={100} cy={40} r={10} fill="#1f3f8f" />
        <circle cx={100} cy={40} r={6.5} fill={WHITE} />
        <circle cx={100} cy={40} r={3} fill="#c8302a" />
      </g>
    ),
  },
  imhotep: {
    skin: "#c98d5c",
    outfit: LINEN,
    legs: "#c98d5c",
    body: (
      <g>
        <path d="M66 162 Q100 186 134 162 L132 172 Q100 198 68 172 Z" fill="#1f5f8f" />
        <path d="M70 168 Q100 190 130 168" stroke={GOLD} strokeWidth={3} fill="none" />
        <path d="M66 214 L134 214" stroke={GOLD} strokeWidth={4} />
      </g>
    ),
    head: <ellipse cx={82} cy={58} rx={18} ry={9} transform="rotate(-20 82 58)" fill="#fff" opacity={0.22} />,
    item: scroll,
  },
  "marco-polo": {
    skin: "#f1cfac",
    outfit: "#7a2e24",
    legs: "#4a3a2c",
    back: <path d="M54 162 Q30 200 44 230 L156 230 Q170 200 146 162 Z" fill="#3f6b4f" />,
    body: <path d="M70 160 L136 214" stroke="#6b4a2a" strokeWidth={6} />,
    face: (
      <g fill="#6b4226">
        <path d="M54 106 Q52 168 100 168 Q148 168 146 106 Q140 130 120 132 Q100 142 80 132 Q60 130 54 106 Z" />
      </g>
    ),
    head: (
      <g>
        <path d="M40 104 Q34 60 64 46 L64 120 Z M160 104 Q166 60 136 46 L136 120 Z" fill="#6b4226" />
        <path d="M120 40 Q150 6 178 12 Q152 18 134 44 Z" fill="#3f7d5c" />
        <path d="M66 52 Q68 18 100 16 Q132 18 134 52 Z" fill="#8a3324" />
        <ellipse cx={100} cy={54} rx={68} ry={12} fill="#6e2619" />
        <path d="M67 46 Q100 38 133 46" stroke={GOLD} strokeWidth={5} fill="none" />
      </g>
    ),
    item: ([x, y]) => <rect x={x - 12} y={y - 12} width={22} height={18} rx={4} fill="#8a5a2c" stroke="#5c3a1a" strokeWidth={2} />,
  },
  leonard: {
    skin: "#f2d2b0",
    outfit: "#7b2d33",
    legs: "#3a2a2a",
    back: <path d="M40 90 Q30 150 54 176 L146 176 Q170 150 160 90 Z" fill="#d8d3cb" />,
    face: (
      <g>
        <path d="M60 116 Q62 196 100 212 Q138 196 140 116 Q128 134 112 132 Q100 140 88 132 Q72 134 60 116 Z" fill="#e2ddd4" />
        <path d="M86 150 Q90 180 100 196 M114 150 Q110 180 100 196" stroke="#c6beb2" strokeWidth={2.5} fill="none" />
        <path d="M84 126 Q100 120 116 126" stroke="#cfc8bc" strokeWidth={5} strokeLinecap="round" fill="none" />
      </g>
    ),
    head: (
      <g>
        <path d="M44 92 Q42 52 100 44 Q158 52 156 92 Q140 70 100 70 Q60 70 44 92 Z" fill="#d8d3cb" />
        <ellipse cx={104} cy={44} rx={60} ry={18} transform="rotate(-8 104 44)" fill="#2c2b3c" />
        <circle cx={110} cy={25} r={5} fill="#2c2b3c" />
      </g>
    ),
    item: ([x, y]) => (
      <g transform={`translate(${x - 14} ${y - 18}) rotate(-8)`}>
        <rect width={24} height={30} rx={3} fill="#8a5a2c" />
        <rect x={3} y={3} width={18} height={24} rx={2} fill="#efe2c2" />
        <path d="M7 10 L17 10 M7 15 L17 15 M7 20 L14 20" stroke="#a08560" strokeWidth={1.5} />
      </g>
    ),
  },
  cesar: {
    skin: "#f1cfac",
    outfit: LINEN,
    legs: "#c98d5c",
    body: <path d="M62 168 Q96 176 132 226 L114 228 Q86 186 60 182 Z" fill="#8e2a6b" />,
    head: (
      <g>
        <path d="M46 84 Q46 44 100 40 Q154 44 154 84 Q148 70 136 66 L134 74 L124 64 L118 72 L108 62 L100 72 L92 62 L82 72 L76 64 L66 74 L64 66 Q52 70 46 84 Z" fill="#5a3a22" />
        {laurel(76)}
      </g>
    ),
  },
  socrate: {
    skin: "#f0cca6",
    outfit: "#d9c7a3",
    legs: "#c98d5c",
    body: <path d="M60 164 Q110 170 140 224 L120 228 Q96 184 58 180 Z" fill="#b89b6a" />,
    face: (
      <g>
        <g fill="#e4ded4">
          {[
            [64, 128], [78, 146], [100, 154], [122, 146], [136, 128], [74, 164], [100, 172], [126, 164], [88, 182], [112, 182],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={11} />
          ))}
        </g>
        <ellipse cx={100} cy={114} rx={9} ry={7} fill="#e9b48e" />
      </g>
    ),
    head: (
      <g fill="#e4ded4">
        <circle cx={44} cy={90} r={10} />
        <circle cx={46} cy={108} r={9} />
        <circle cx={156} cy={90} r={10} />
        <circle cx={154} cy={108} r={9} />
      </g>
    ),
  },
  ramses: {
    skin: "#b47b4f",
    outfit: LINEN,
    legs: "#b47b4f",
    back: (
      <g>
        <path d="M38 80 L30 168 L66 168 L64 90 Z M162 80 L170 168 L134 168 L136 90 Z" fill={`url(#${nemes})`} />
      </g>
    ),
    body: (
      <g>
        <path d="M64 162 Q100 190 136 162 L134 174 Q100 202 66 174 Z" fill="#1f5f8f" />
        <path d="M68 168 Q100 194 132 168" stroke={GOLD} strokeWidth={3} fill="none" />
      </g>
    ),
    face: <path d="M94 136 L106 136 L104 170 L96 170 Z" fill={`url(#${nemes})`} />,
    head: (
      <g>
        <path d="M38 92 Q34 30 100 26 Q166 30 162 92 L150 92 Q146 62 100 60 Q54 62 50 92 Z" fill={`url(#${nemes})`} />
        <path d="M100 30 Q90 44 96 56 L104 56 Q110 44 100 30 Z" fill={GOLD} stroke={GOLD_DARK} />
      </g>
    ),
    item: ([x, y]) => (
      <g stroke={GOLD} strokeWidth={5} fill="none" strokeLinecap="round">
        <path d={`M${x} ${y + 14} L${x} ${y - 40} Q${x} ${y - 54} ${x - 12} ${y - 50}`} />
        <path d={`M${x} ${y - 30} L${x} ${y - 20}`} stroke="#1f5f8f" />
      </g>
    ),
  },
  cleopatre: {
    skin: "#d9a273",
    outfit: LINEN,
    legs: "#d9a273",
    back: <path d="M36 70 Q22 140 40 166 L160 166 Q178 140 164 70 Z" fill="#141014" />,
    body: (
      <g>
        <path d="M62 160 Q100 196 138 160 L136 176 Q100 210 64 176 Z" fill={GOLD} />
        <path d="M66 168 Q100 200 134 168" stroke="#1f5f8f" strokeWidth={4} fill="none" />
        <path d="M70 176 Q100 206 130 176" stroke="#c8302a" strokeWidth={3} fill="none" />
      </g>
    ),
    face: (
      <g stroke={INK} strokeWidth={3} strokeLinecap="round">
        <path d="M66 98 L56 92" />
        <path d="M134 98 L144 92" />
      </g>
    ),
    head: (
      <g>
        <path d="M38 96 Q34 34 100 32 Q166 34 162 96 L150 96 Q148 76 140 70 L60 70 Q52 76 50 96 Z" fill="#141014" />
        <path d="M40 62 Q100 38 160 62 L158 72 Q100 48 42 72 Z" fill={GOLD} />
        <path d="M100 34 Q90 48 96 58 L104 58 Q110 48 100 34 Z" fill={GOLD} stroke={GOLD_DARK} />
        <circle cx={100} cy={46} r={2.5} fill="#c8302a" />
      </g>
    ),
  },
  confucius: {
    skin: "#efcfa8",
    outfit: "#2f5f6b",
    legs: "#1d2b30",
    body: (
      <g>
        <path d="M82 158 L100 192 L118 158" stroke={WHITE} strokeWidth={6} fill="none" />
        <path d="M58 206 L142 206" stroke={GOLD} strokeWidth={5} />
      </g>
    ),
    face: (
      <g fill="none" stroke="#2a2420" strokeWidth={3} strokeLinecap="round">
        <path d="M92 124 Q76 130 70 156" />
        <path d="M108 124 Q124 130 130 156" />
        <path d="M100 136 L100 160" strokeWidth={4} />
      </g>
    ),
    head: (
      <g>
        <path d="M44 88 Q44 46 100 42 Q156 46 156 88 Q140 66 100 64 Q60 66 44 88 Z" fill="#2a2420" />
        <rect x={68} y={20} width={64} height={32} rx={6} fill="#1d1b20" />
        <rect x={54} y={12} width={92} height={11} rx={3} fill="#2c2b3c" />
        <path d="M100 50 L100 60" stroke={GOLD} strokeWidth={4} />
      </g>
    ),
    item: scroll,
  },
  alexandre: {
    skin: "#f3d4b5",
    outfit: "#c48a2c",
    legs: "#7a2018",
    back: <path d="M56 160 Q28 196 40 232 L160 232 Q172 196 144 160 Z" fill="#b5342a" />,
    body: (
      <g stroke="#8f6118" strokeWidth={3} fill="none">
        <path d="M80 176 Q100 186 120 176" />
        <path d="M78 194 Q100 204 122 194" />
        <path d="M62 214 L138 214" strokeWidth={5} />
      </g>
    ),
    head: (
      <g>
        <g fill="#b98a3c">
          {[
            [46, 74], [42, 90], [46, 106], [154, 74], [158, 90], [154, 106], [62, 66], [138, 66],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={9} />
          ))}
        </g>
        <path d="M50 70 Q50 18 100 16 Q150 18 150 70 Q130 54 100 54 Q70 54 50 70 Z" fill="#c48a2c" />
        <path d="M58 60 Q100 42 142 60" stroke="#8f6118" strokeWidth={3} fill="none" />
        <path d="M66 22 Q72 -14 100 -16 Q128 -14 134 22 Q118 8 100 8 Q82 8 66 22 Z" fill="#b5342a" />
      </g>
    ),
  },
});

/** Arm ends for each mood: [shoulder → hand] on the left, then on the right. */
const ARMS: Record<CompanionMood, { left: string; right: string; leftHand: Point; rightHand: Point }> = {
  happy: { left: "M68 170 Q58 186 56 206", right: "M132 170 Q142 186 144 206", leftHand: [56, 206], rightHand: [144, 206] },
  cheer: { left: "M68 170 Q46 156 42 128", right: "M132 170 Q154 156 158 128", leftHand: [42, 128], rightHand: [158, 128] },
  sad: { left: "M70 172 Q64 192 64 212", right: "M130 172 Q136 192 136 212", leftHand: [64, 212], rightHand: [136, 212] },
  sleepy: { left: "M68 170 Q60 190 60 210", right: "M132 170 Q140 190 140 210", leftHand: [60, 210], rightHand: [140, 210] },
  think: { left: "M68 170 Q58 186 56 206", right: "M132 170 Q158 186 120 154", leftHand: [56, 206], rightHand: [120, 154] },
  wave: { left: "M68 170 Q58 186 56 206", right: "M132 170 Q158 150 162 122", leftHand: [56, 206], rightHand: [162, 122] },
};

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const Face = ({ mood, blink, skin }: { mood: CompanionMood; blink: boolean; skin: string }) => {
  const eyes =
    mood === "cheer" ? (
      <g fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round">
        <path d="M70 104 Q78 94 86 104" />
        <path d="M114 104 Q122 94 130 104" />
      </g>
    ) : mood === "sleepy" ? (
      <g fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round">
        <path d="M70 102 Q78 108 86 102" />
        <path d="M114 102 Q122 108 130 102" />
      </g>
    ) : (
      <g>
        {[78, 122].map((cx) => {
          const [dx, dy] = mood === "think" ? [3, -4] : mood === "sad" ? [0, 2] : [0, 0];
          return (
            <g key={cx}>
              <ellipse cx={cx + dx} cy={101 + dy} rx={6.5} ry={8.5} fill={INK} />
              <circle cx={cx + dx + 2.5} cy={98 + dy} r={2.4} fill="#fff" />
              {blink && <ellipse cx={cx} cy={101} rx={9} ry={10.5} fill={skin} className="companion-lid" />}
            </g>
          );
        })}
      </g>
    );

  const brows =
    mood === "sad" ? (
      <g stroke={INK} strokeWidth={3.5} strokeLinecap="round">
        <path d="M68 90 L86 83" />
        <path d="M132 90 L114 83" />
      </g>
    ) : mood === "think" ? (
      <path d="M114 84 Q124 78 134 84" stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none" />
    ) : null;

  const mouth =
    mood === "cheer" ? (
      <path d="M88 118 Q100 136 112 118 Z" fill="#8c2f2a" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
    ) : mood === "sad" ? (
      <path d="M90 126 Q100 118 110 126" stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none" />
    ) : mood === "sleepy" ? (
      <ellipse cx={100} cy={124} rx={4} ry={3} fill="#8c2f2a" />
    ) : mood === "think" ? (
      <path d="M94 124 L108 121" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
    ) : (
      <path d="M89 119 Q100 130 111 119" stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none" />
    );

  return (
    <g>
      {brows}
      {eyes}
      {mood !== "sad" && mood !== "think" && (
        <g fill={CHEEK} opacity={0.5}>
          <ellipse cx={64} cy={116} rx={8} ry={5} />
          <ellipse cx={136} cy={116} rx={8} ry={5} />
        </g>
      )}
      {mouth}
    </g>
  );
};

interface CompanionProps {
  id: CompanionId;
  mood?: CompanionMood;
  /** Off for still pictures (lists, icons). */
  animated?: boolean;
  /** A dark shape: a companion not unlocked yet. */
  silhouette?: boolean;
  /** "head" crops to the head and shoulders, for portraits. */
  framing?: "full" | "head";
  className?: string;
  title?: string;
  /** Position and size when drawn inside another SVG. */
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

/** A historical companion in a mood. */
const Companion = ({
  id,
  mood = "happy",
  animated = true,
  silhouette = false,
  framing = "full",
  className,
  title,
  ...position
}: CompanionProps) => {
  const nemes = `nemes-${useId().replace(/:/g, "")}`;
  const look = looks(nemes)[id];
  const live = animated && !silhouette;
  const waistcoat = look.handInWaistcoat && mood === "happy";
  const arms = ARMS[mood];
  const leftArm = waistcoat ? "M68 170 Q70 196 98 184" : arms.left;
  const leftHand: Point = waistcoat ? [98, 184] : arms.leftHand;
  const holds = look.item && !waistcoat && (mood === "happy" || mood === "sad" || mood === "think" || mood === "wave" || mood === "sleepy");

  const rightArm = (
    <g>
      <path d={arms.right} stroke={OUTLINE} strokeWidth={20} strokeLinecap="round" fill="none" />
      <path d={arms.right} stroke={look.outfit} strokeWidth={17} strokeLinecap="round" fill="none" />
      <circle cx={arms.rightHand[0]} cy={arms.rightHand[1]} r={8.5} fill={look.skin} />
    </g>
  );

  return (
    <svg
      {...position}
      viewBox={framing === "head" ? "26 12 148 148" : "0 -20 200 256"}
      className={cn(
        "companion",
        live && mood === "cheer" && "companion-bounce",
        silhouette && "companion-silhouette",
        className
      )}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <pattern id={nemes} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#1f4f8f" />
          <rect width="8" height="3.5" fill={GOLD} />
        </pattern>
      </defs>
      {look.back}

      {/* Legs and torso. */}
      <g fill={look.legs ?? INK}>
        <rect x={76} y={214} width={18} height={20} rx={7} />
        <rect x={106} y={214} width={18} height={20} rx={7} />
      </g>
      <path d="M62 162 Q100 148 138 162 L148 222 Q100 234 52 222 Z" fill={look.outfit} stroke={OUTLINE} strokeWidth={2} />
      {look.body}

      {/* Arms; the right one waves on its own. */}
      <path d={leftArm} stroke={OUTLINE} strokeWidth={20} strokeLinecap="round" fill="none" />
      <path d={leftArm} stroke={look.outfit} strokeWidth={17} strokeLinecap="round" fill="none" />
      <circle cx={leftHand[0]} cy={leftHand[1]} r={8.5} fill={look.skin} />
      {holds && look.item?.(leftHand)}
      {mood === "wave" && live && !reducedMotion() ? (
        <g>
          {rightArm}
          <animateTransform attributeName="transform" type="rotate" values="0 132 170; -16 132 170; 0 132 170" dur="0.9s" repeatCount="indefinite" />
        </g>
      ) : (
        rightArm
      )}

      {/* Head. */}
      <circle cx={42} cy={104} r={10} fill={look.skin} />
      <circle cx={158} cy={104} r={10} fill={look.skin} />
      <circle cx={100} cy={96} r={60} fill={look.skin} />
      <Face mood={mood} blink={live} skin={look.skin} />
      {look.face}
      {look.head}

      {mood === "sleepy" && (
        <g fill={INK} fontFamily="Outfit, sans-serif" fontWeight={700} opacity={0.7}>
          <text x={156} y={36} fontSize={22} className={cn(live && "companion-z")}>z</text>
          <text x={172} y={16} fontSize={16} className={cn(live && "companion-z")} style={{ animationDelay: "0.6s" }}>z</text>
        </g>
      )}
    </svg>
  );
};

export default Companion;
