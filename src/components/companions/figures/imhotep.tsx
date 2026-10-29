import { FACES, kilt, line, straightNose, usekh } from "./parts";
import type { Figure } from "./types";

/** Imhotep: the scribe's skullcap, the reed pen behind the ear, the papyrus unrolled. */
export const imhotep: Figure = {
  skin: "#b47a4b",
  skinShade: "#975f34",
  iris: "#3e2614",
  face: FACES.long,
  brow: { color: "#2b1a10" },
  lips: "#8c4a36",
  nose: straightNose,
  torso: "#b47a4b",
  torsoShade: "#975f34",
  outfit: (
    <g>
      {kilt}
      {usekh}
    </g>
  ),
  sleeves: ["#b47a4b", "#b47a4b"],
  legs: "#b47a4b",
  feet: "#b47a4b",
  hair: (
    <g>
      {/* Close-fitting skullcap. */}
      <path d="M62 80 Q60 32 100 30 Q140 32 138 80 Q130 58 100 56 Q70 58 62 80 Z" fill="#26324f" {...line} />
      <path d="M80 44 Q96 36 112 38" stroke="#4a5a80" strokeWidth={3} fill="none" strokeLinecap="round" />
      {/* Reed pen behind the ear. */}
      <path d="M140 60 L152 104" stroke="#c9a46a" strokeWidth={4} strokeLinecap="round" />
      <path d="M151 100 L153 108" stroke="#2b1a10" strokeWidth={3} strokeLinecap="round" />
    </g>
  ),
  pose: {
    left: { d: "M70 148 Q62 170 80 180", hand: [78, 180] },
    right: { d: "M130 148 Q138 170 120 180", hand: [122, 180] },
    held: (
      <g>
        {/* Papyrus unrolled, with a few hieroglyphs. */}
        <rect x={78} y={168} width={44} height={24} fill="#efe2c2" {...line} />
        <rect x={72} y={166} width={8} height={28} rx={4} fill="#d9c398" {...line} />
        <rect x={120} y={166} width={8} height={28} rx={4} fill="#d9c398" {...line} />
        <g fill="none" stroke="#8a6a3a" strokeWidth={1.6} strokeLinecap="round">
          <path d="M86 174 l4 0 M86 179 q3 -3 6 0 M86 185 l5 0" />
          <circle cx={100} cy={176} r={2.5} />
          <path d="M97 183 l6 0 M98 187 l4 0" />
          <path d="M108 174 l0 6 l5 0 M109 185 q3 3 5 0" />
        </g>
      </g>
    ),
  },
};
