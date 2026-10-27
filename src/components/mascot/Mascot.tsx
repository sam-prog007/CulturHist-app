import { useId } from "react";
import { cn } from "@/lib/utils";
import { costumeForGrade, type Costume } from "@/components/mascot/costumes";

/*
 * Minerve, the CulturHist owl (Minerva's owl, the symbol of knowledge).
 * One body, six moods, and a costume for each grade: she dresses as the
 * historical figure of the user's grade (scribe, Marco Polo, Léonard…).
 * Drawn in SVG so that she stays sharp, light and animatable; the animations
 * (blink, bounce, wave) are in index.css and stop with prefers-reduced-motion.
 */

export type MascotMood = "happy" | "cheer" | "sad" | "sleepy" | "think" | "wave";

const C = {
  body: "#7a4a2b",
  bodyDark: "#5c3620",
  face: "#e9c99a",
  belly: "#f6e7c8",
  feather: "#d9b47e",
  gold: "#e0a82e",
  beak: "#e8962e",
  ink: "#2b1a10",
  cheek: "#f2998a",
  white: "#fffaf0",
};

interface MascotProps {
  mood?: MascotMood;
  /** Grade level (1–10): the costume she wears. None: plain Minerve. */
  grade?: number | null;
  /** Or a costume by name (the grades list shows each one). */
  costume?: Costume | null;
  /** Off for still pictures (lists, icons). */
  animated?: boolean;
  className?: string;
  title?: string;
  /** "head" crops to her head, for the logo and the app icon. */
  framing?: "full" | "head";
  /** Position and size when drawn inside another SVG (the logo). */
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

const Eyes = ({ mood, blink }: { mood: MascotMood; blink: boolean }) => {
  if (mood === "cheer") {
    // Closed, smiling eyes: ^ ^
    return (
      <g fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round">
        <path d="M60 98 Q74 80 88 98" />
        <path d="M112 98 Q126 80 140 98" />
      </g>
    );
  }
  const look = mood === "sad" ? [0, 6] : mood === "think" ? [6, -6] : mood === "sleepy" ? [0, 4] : [0, 0];
  return (
    <g>
      {[74, 126].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={94} r={20} fill={C.white} stroke={C.gold} strokeWidth={4} />
          <circle cx={cx + look[0]} cy={94 + look[1]} r={9} fill={C.ink} />
          <circle cx={cx + look[0] + 3.5} cy={94 + look[1] - 3.5} r={3} fill={C.white} />
        </g>
      ))}
      {/* Eyelids: half closed when sleepy, blinking now and then otherwise. */}
      <g fill={C.face}>
        {[74, 126].map((cx) =>
          mood === "sleepy" ? (
            <path key={cx} d={`M${cx - 23} 95 A23 23 0 0 1 ${cx + 23} 95 Z`} />
          ) : (
            blink && <circle key={cx} cx={cx} cy={94} r={23} className="mascot-lid" />
          )
        )}
      </g>
      {mood === "sad" && (
        <g stroke={C.bodyDark} strokeWidth={4} strokeLinecap="round">
          <path d="M58 70 L86 78" />
          <path d="M142 70 L114 78" />
        </g>
      )}
      {mood === "think" && <path d="M110 66 Q126 58 142 66" stroke={C.bodyDark} strokeWidth={4} strokeLinecap="round" fill="none" />}
    </g>
  );
};

/** What she wears for each grade, drawn over the head (and for some, the body). */
const CostumeLayer = ({ costume, uid }: { costume: Costume; uid: string }) => {
  switch (costume) {
    case "scribe":
      // Lapis headband and a reed pen behind the ear.
      return (
        <g>
          <path d="M52 60 Q100 36 148 60 L148 70 Q100 46 52 70 Z" fill="#1f4f8f" />
          <path d="M60 60 Q100 42 140 60" stroke={C.gold} strokeWidth={2.5} fill="none" strokeDasharray="6 5" />
          <path d="M150 34 L170 94" stroke="#c9a46a" strokeWidth={5} strokeLinecap="round" />
          <path d="M168 88 L172 100" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    case "marco-polo":
      // Traveller's hat with a feather.
      return (
        <g>
          <path d="M120 30 Q150 0 176 6 Q150 12 132 36 Z" fill="#3f7d5c" />
          <path d="M70 46 Q70 14 100 12 Q130 14 130 46 Z" fill="#8a3324" />
          <ellipse cx={100} cy={48} rx={64} ry={11} fill="#6e2619" />
          <path d="M71 40 Q100 34 129 40" stroke={C.gold} strokeWidth={5} fill="none" />
        </g>
      );
    case "leonard":
      // Dark beret and a long white beard.
      return (
        <g>
          <ellipse cx={104} cy={40} rx={54} ry={17} transform="rotate(-8 104 40)" fill="#2c2b3c" />
          <circle cx={108} cy={22} r={4} fill="#2c2b3c" />
          <path d="M76 116 Q78 168 100 182 Q122 168 124 116 Q112 128 100 124 Q88 128 76 116 Z" fill="#ece7df" />
          <path d="M90 136 Q94 156 100 166 M110 136 Q106 156 100 166" stroke="#cfc8bc" strokeWidth={2} fill="none" />
        </g>
      );
    case "cesar": {
      // Golden laurel wreath: two branches meeting over the forehead.
      const leaves = Array.from({ length: 12 }, (_, i) => {
        const side = i < 6 ? -1 : 1;
        const t = ((i % 6) + 0.5) / 6;
        const a = Math.PI / 2 + side * t * (Math.PI / 2) * 0.95;
        const x = 100 + 54 * Math.cos(a);
        const y = 70 - 30 * Math.sin(a);
        const tangent = (Math.atan2(-30 * Math.cos(a), -54 * Math.sin(a)) * 180) / Math.PI;
        return { x, y, tangent, out: i % 2 === 0 ? 1 : -1 };
      });
      return (
        <g>
          <path d="M48 76 Q48 42 100 40 Q152 42 152 76" fill="none" stroke="#9b7414" strokeWidth={2.5} />
          <g fill={C.gold} stroke="#9b7414" strokeWidth={1}>
            {leaves.map(({ x, y, tangent, out }, i) => (
              <ellipse key={i} cx={x} cy={y} rx={8} ry={3.8} transform={`rotate(${tangent + out * 35} ${x} ${y})`} />
            ))}
          </g>
        </g>
      );
    }
    case "napoleon":
      // Bicorne with the tricolour cockade.
      return (
        <g>
          <path d="M26 54 Q100 -14 174 54 Q100 30 26 54 Z" fill="#1d1b20" />
          <path d="M34 50 Q100 26 166 50" stroke={C.gold} strokeWidth={3} fill="none" />
          <circle cx={100} cy={30} r={10} fill="#1f3f8f" />
          <circle cx={100} cy={30} r={6.5} fill={C.white} />
          <circle cx={100} cy={30} r={3} fill="#c8302a" />
        </g>
      );
    case "socrate":
      // White toga over the shoulder, short curly beard.
      return (
        <g>
          <path d="M36 110 Q104 140 150 198 L124 204 Q84 156 32 134 Z" fill={C.white} />
          <path d="M40 120 Q100 146 138 198" stroke="#ddd3c2" strokeWidth={2.5} fill="none" />
          <path d="M80 118 Q84 146 100 150 Q116 146 120 118 Q110 128 100 126 Q90 128 80 118 Z" fill="#ece7df" />
          <g fill="#ece7df">
            <circle cx={86} cy={138} r={6} />
            <circle cx={114} cy={138} r={6} />
            <circle cx={100} cy={148} r={6} />
          </g>
        </g>
      );
    case "ramses": {
      // Striped nemes headcloth with the cobra.
      const id = `nemes-${uid}`;
      return (
        <g>
          <defs>
            <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" fill="#1f4f8f" />
              <rect width="8" height="3.5" fill={C.gold} />
            </pattern>
          </defs>
          <path d="M48 74 Q44 26 100 24 Q156 26 152 74 L166 128 L142 128 L138 80 Q100 62 62 80 L58 128 L34 128 Z" fill={`url(#${id})`} />
          <path d="M100 26 Q92 38 100 48 Q108 38 100 26 Z" fill={C.gold} stroke="#b07f17" />
        </g>
      );
    }
    case "cleopatre":
      // Black bob, golden diadem with the cobra, kohl.
      return (
        <g>
          <path d="M46 56 Q28 92 40 124 L60 118 Q50 88 62 62 Z" fill="#1b1416" />
          <path d="M154 56 Q172 92 160 124 L140 118 Q150 88 138 62 Z" fill="#1b1416" />
          <path d="M50 62 Q100 34 150 62 L148 72 Q100 46 52 72 Z" fill={C.gold} />
          <path d="M100 30 Q90 42 96 52 L104 52 Q110 42 100 30 Z" fill={C.gold} stroke="#b07f17" />
          <circle cx={100} cy={40} r={2.5} fill="#c8302a" />
          <g stroke={C.ink} strokeWidth={3} strokeLinecap="round">
            <path d="M54 90 L44 84" />
            <path d="M146 90 L156 84" />
          </g>
        </g>
      );
    case "confucius":
      // Scholar's hat and long moustache.
      return (
        <g>
          <rect x={68} y={24} width={64} height={30} rx={6} fill="#1d1b20" />
          <rect x={58} y={16} width={84} height={10} rx={3} fill="#2c2b3c" />
          <path d="M100 52 L100 60" stroke={C.gold} strokeWidth={4} />
          <g fill="none" stroke="#3a2a22" strokeWidth={2.5} strokeLinecap="round">
            <path d="M94 118 Q74 124 70 152" />
            <path d="M106 118 Q126 124 130 152" />
          </g>
        </g>
      );
    case "alexandre":
      // Bronze helmet with a red crest.
      return (
        <g>
          <path d="M56 40 Q60 -6 100 -4 Q140 -6 144 40 Q120 18 100 18 Q80 18 56 40 Z" fill="#b5342a" />
          <path d="M70 30 Q100 8 130 30" stroke="#8e2219" strokeWidth={2} fill="none" />
          <path d="M48 74 Q44 26 100 24 Q156 26 152 74 L138 72 Q100 54 62 72 Z" fill="#c48a2c" />
          <path d="M60 64 Q100 46 140 64" stroke="#8f6118" strokeWidth={3} fill="none" />
        </g>
      );
  }
};

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Minerve the owl, in a mood and, optionally, in the costume of a grade. */
const Mascot = ({ mood = "happy", grade, costume, animated = true, className, title, framing = "full", ...position }: MascotProps) => {
  const uid = useId().replace(/:/g, "");
  const outfit = costume ?? costumeForGrade(grade);
  const wingsUp = mood === "cheer";
  const wingsDown = mood === "sad";

  return (
    <svg
      {...position}
      viewBox={framing === "head" ? "30 16 140 140" : "0 -8 200 224"}
      className={cn("mascot", animated && "mascot-animated", animated && mood === "cheer" && "mascot-bounce", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {/* Wings, behind the body. */}
      <g fill={C.bodyDark}>
        <path
          d="M34 118 C14 138 16 176 44 190 C42 162 46 138 34 118 Z"
          transform={wingsUp ? "rotate(55 38 122)" : wingsDown ? "rotate(-10 38 122)" : undefined}
        />
        <path
          d="M166 118 C186 138 184 176 156 190 C158 162 154 138 166 118 Z"
          transform={wingsUp ? "rotate(-55 162 122)" : wingsDown ? "rotate(10 162 122)" : mood === "wave" ? "rotate(-70 162 122)" : undefined}
        >
          {mood === "wave" && animated && !reducedMotion() && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="-70 162 122; -40 162 122; -70 162 122"
              dur="0.9s"
              repeatCount="indefinite"
            />
          )}
        </path>
      </g>

      {/* Ear tufts and body. */}
      <path d="M54 64 L40 24 L78 48 Z" fill={C.body} />
      <path d="M146 64 L160 24 L122 48 Z" fill={C.body} />
      <path d="M100 38 C150 38 172 80 172 128 C172 178 140 204 100 204 C60 204 28 178 28 128 C28 80 50 38 100 38 Z" fill={C.body} />

      {/* Belly with feathers. */}
      <ellipse cx={100} cy={160} rx={46} ry={38} fill={C.belly} />
      <g fill="none" stroke={C.feather} strokeWidth={3} strokeLinecap="round">
        {[
          [84, 146], [100, 146], [116, 146],
          [76, 164], [92, 164], [108, 164], [124, 164],
          [88, 182], [104, 182],
        ].map(([x, y]) => (
          <path key={`${x}-${y}`} d={`M${x - 5} ${y} L${x} ${y + 5} L${x + 5} ${y}`} />
        ))}
      </g>

      {/* Feet. */}
      <g fill={C.beak}>
        <ellipse cx={84} cy={204} rx={10} ry={5} />
        <ellipse cx={116} cy={204} rx={10} ry={5} />
      </g>

      {/* Face disc, eyes, beak, cheeks. */}
      <path d="M100 70 C80 52 42 60 42 96 C42 124 70 134 100 122 C130 134 158 124 158 96 C158 60 120 52 100 70 Z" fill={C.face} />
      <Eyes mood={mood} blink={animated} />
      {(mood === "happy" || mood === "cheer" || mood === "wave") && (
        <g fill={C.cheek} opacity={0.55}>
          <ellipse cx={56} cy={118} rx={8} ry={5} />
          <ellipse cx={144} cy={118} rx={8} ry={5} />
        </g>
      )}

      {outfit && <CostumeLayer costume={outfit} uid={uid} />}
      {/* The beak comes last, over the beards. */}
      <path d="M91 112 L109 112 L100 128 Z" fill={C.beak} />

      {mood === "sleepy" && (
        <g fill={C.bodyDark} fontFamily="Outfit, sans-serif" fontWeight={700}>
          <text x={160} y={40} fontSize={22} className={cn(animated && "mascot-z")}>z</text>
          <text x={176} y={20} fontSize={16} className={cn(animated && "mascot-z")} style={{ animationDelay: "0.6s" }}>z</text>
        </g>
      )}
    </svg>
  );
};

export default Mascot;
