import { FACES, GOLD, WHITE, line, straightNose } from "./parts";
import type { Figure } from "./types";

const HAIR = "#2a2420";
const ROBE = "#2f5f6b";

/** Confucius: the scholar's cap on a topknot, the long thin beard, the wide-sleeved robe, hands joined. */
export const confucius: Figure = {
  skin: "#efcfa6",
  skinShade: "#d4aa7c",
  iris: "#3a2a1c",
  face: FACES.long,
  wrinkles: true,
  brow: { color: HAIR },
  lips: "#a8705e",
  nose: straightNose,
  torso: ROBE,
  torsoShade: "#244a54",
  outfit: (
    <g>
      {/* Long robe, the collar crossed right over left, the sash. */}
      <path d="M56 204 L144 204 L150 238 Q100 246 50 238 Z" fill={ROBE} {...line} />
      <path d="M84 140 Q96 166 116 200" stroke={WHITE} strokeWidth={7} fill="none" />
      <path d="M116 140 Q108 152 102 160" stroke={WHITE} strokeWidth={7} fill="none" />
      <path d="M56 200 Q100 208 144 200" stroke="#c9a24a" strokeWidth={6} fill="none" />
    </g>
  ),
  sleeves: [ROBE, ROBE],
  legs: ROBE,
  feet: "#1c1a20",
  beard: (
    <g>
      <path d="M90 120 Q92 168 100 180 Q108 168 110 120 Q100 128 90 120 Z" fill={HAIR} {...line} />
      {/* Long drooping moustache. */}
      <path d="M98 110 Q82 114 76 136 M102 110 Q118 114 124 136" stroke={HAIR} strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
  ),
  hair: (
    <g>
      <path d="M62 84 Q60 40 100 38 Q140 40 138 84 Q132 62 100 60 Q68 62 62 84 Z" fill={HAIR} {...line} />
      {/* Topknot under a small cap (guan), held by a pin. */}
      <circle cx={100} cy={32} r={11} fill={HAIR} {...line} />
      <path d="M88 32 Q88 14 100 12 Q112 14 112 32 Z" fill="#1c1a20" {...line} />
      <path d="M76 24 L124 22" stroke={GOLD} strokeWidth={3} strokeLinecap="round" />
    </g>
  ),
  pose: {
    // Hands joined, hidden in the wide sleeves.
    left: { d: "M70 148 Q56 176 92 186", hand: [92, 186], hidden: true },
    right: { d: "M130 148 Q144 176 108 186", hand: [108, 186], hidden: true },
    held: (
      <g>
        <path d="M74 176 Q100 168 126 176 L130 198 Q100 206 70 198 Z" fill={ROBE} {...line} />
        <path d="M88 186 Q100 182 112 186" stroke="#1a3a42" strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
    ),
  },
};
