import { FACES, GOLD, line } from "./parts";
import type { Figure } from "./types";

const HAIR = "#5a3620";

/** Marco Polo: the Venetian merchant's red cap with fur, the beard, the travelling cloak and the staff. */
export const marcoPolo: Figure = {
  skin: "#efcba6",
  skinShade: "#d6a57e",
  iris: "#6b4a2a",
  face: FACES.oval,
  brow: { color: "#4a2c18" },
  lips: "#b8705e",
  nose: (
    <g fill="none" {...line}>
      <path d="M100 86 Q98 98 95 102 Q100 106 105 102" />
    </g>
  ),
  back: (
    <g>
      {/* Travelling cloak and shoulder-length hair. */}
      <path d="M62 144 Q34 200 46 246 L154 246 Q166 200 138 144 Z" fill="#3f6b4f" {...line} />
      <path d="M58 76 Q48 120 62 136 L76 124 Q66 104 66 84 Z M142 76 Q152 120 138 136 L124 124 Q134 104 134 84 Z" fill={HAIR} {...line} />
    </g>
  ),
  torso: "#7a3a26",
  torsoShade: "#5f2b1b",
  outfit: (
    <g>
      <path d="M58 194 Q100 202 142 194" stroke="#3e2614" strokeWidth={6} fill="none" />
      <circle cx={100} cy={198} r={4} fill={GOLD} {...line} strokeWidth={1.5} />
      {/* Satchel on its strap. */}
      <path d="M74 146 L128 200" stroke="#6b4a2a" strokeWidth={5} />
      <rect x={118} y={196} width={22} height={18} rx={4} fill="#8a5a2c" {...line} />
      <path d="M118 202 L140 202" stroke="#6b4a2a" strokeWidth={2} />
    </g>
  ),
  sleeves: ["#7a3a26", "#7a3a26"],
  legs: "#4a3a2c",
  feet: "#3a2a1c",
  beard: (
    <g>
      <path d="M64 100 Q64 146 100 152 Q136 146 136 100 Q130 118 116 120 Q100 126 84 120 Q70 118 64 100 Z" fill={HAIR} {...line} />
      <path d="M86 110 Q100 103 114 110 Q108 115 100 113 Q92 115 86 110 Z" fill={HAIR} {...line} />
      <path d="M88 132 Q92 140 96 144 M104 140 Q108 136 112 130" stroke="#3e2614" strokeWidth={1.5} fill="none" />
    </g>
  ),
  hair: (
    <g>
      {/* Soft red cap over a fur band. */}
      <path d="M66 58 Q62 18 100 14 Q140 18 136 58 Z" fill="#a3322a" {...line} />
      <path d="M78 26 Q96 18 110 20" stroke="#c4554a" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M60 68 Q100 50 140 68 L140 56 Q100 40 60 56 Z" fill="#8a6a4a" {...line} />
      <path d="M68 60 l3 3 M80 56 l3 3 M94 53 l3 3 M108 53 l3 3 M122 56 l3 3 M132 60 l3 3" stroke="#6a4a2e" strokeWidth={1.6} />
    </g>
  ),
  pose: {
    left: { d: "M70 148 Q58 172 62 198", hand: [62, 200] },
    right: { d: "M130 148 Q148 164 146 182", hand: [146, 184] },
    behind: (
      <g>
        <path d="M146 66 L150 246" stroke="#2b1a10" strokeWidth={8} strokeLinecap="round" />
        <path d="M146 66 L150 246" stroke="#7a5230" strokeWidth={5} strokeLinecap="round" />
      </g>
    ),
    held: (
      // A rolled map.
      <g transform="translate(62 200) rotate(-25)">
        <rect x={-5} y={-16} width={10} height={30} rx={4} fill="#efe2c2" {...line} />
        <path d="M-5 -6 L5 -6" stroke="#b5312a" strokeWidth={2} />
      </g>
    ),
  },
};
