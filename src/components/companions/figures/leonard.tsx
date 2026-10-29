import { FACES, WHITE, line } from "./parts";
import type { Figure } from "./types";

const WHITE_HAIR = "#ebe7de";

/** Léonard de Vinci: the long white hair and beard of the self-portrait, the dark beret, the notebook. */
export const leonard: Figure = {
  skin: "#f0cfae",
  skinShade: "#d6a982",
  iris: "#5a6b4a",
  face: FACES.long,
  wrinkles: true,
  brow: { color: "#d9d3c8", width: 5 },
  lips: "#b88070",
  nose: (
    <g fill="none" {...line}>
      <path d="M100 82 Q99 98 94 104 Q100 108 106 104" />
    </g>
  ),
  back: (
    <path d="M58 68 Q38 130 56 170 L84 152 Q66 120 68 84 Z M142 68 Q162 130 144 170 L116 152 Q134 120 132 84 Z" fill={WHITE_HAIR} {...line} />
  ),
  torso: "#9c5a2c",
  torsoShade: "#7e4520",
  outfit: (
    <g>
      {/* Long robe with a dark fur collar. */}
      <path d="M56 202 L144 202 L150 236 Q100 244 50 236 Z" fill="#9c5a2c" {...line} />
      <path d="M64 146 Q100 136 136 146 L132 158 Q100 148 68 158 Z" fill="#4a2e1c" {...line} />
      <path d="M58 204 Q100 212 142 204" stroke="#6e3e1c" strokeWidth={4} fill="none" />
    </g>
  ),
  sleeves: ["#9c5a2c", "#9c5a2c"],
  legs: "#3a2a2a",
  feet: "#2a1c14",
  beard: (
    <g>
      <path d="M64 100 Q60 170 100 194 Q140 170 136 100 Q128 122 114 122 Q100 128 86 122 Q72 122 64 100 Z" fill={WHITE_HAIR} {...line} />
      <path d="M84 108 Q100 102 116 108 Q110 116 100 114 Q90 116 84 108 Z" fill={WHITE_HAIR} {...line} />
      <path d="M86 132 Q90 160 98 182 M114 132 Q110 160 102 182 M100 132 L100 176" stroke="#c9c2b5" strokeWidth={1.6} fill="none" />
    </g>
  ),
  hair: (
    <g>
      {/* Locks at the temples, under the beret. */}
      <path d="M64 64 Q56 84 64 102 M136 64 Q144 84 136 102" stroke={WHITE_HAIR} strokeWidth={8} fill="none" strokeLinecap="round" />
      <ellipse cx={102} cy={44} rx={52} ry={16} transform="rotate(-6 102 44)" fill="#24232e" {...line} />
      <path d="M58 54 Q100 46 144 46" stroke="#3a3946" strokeWidth={3} fill="none" />
      <circle cx={108} cy={28} r={4} fill="#24232e" />
    </g>
  ),
  pose: {
    left: { d: "M70 148 Q54 176 68 196", hand: [68, 196] },
    right: { d: "M130 148 Q148 172 134 194", hand: [134, 194] },
    held: (
      <g>
        {/* Notebook with a flying machine sketch, and the quill. */}
        <g transform="translate(46 178) rotate(-8)">
          <rect width={30} height={34} rx={3} fill="#7a4a26" {...line} />
          <rect x={4} y={4} width={22} height={26} rx={2} fill="#efe2c2" />
          <path d="M8 18 Q15 10 22 18 M8 18 L22 18 M15 18 L15 26" stroke="#a08560" strokeWidth={1.4} fill="none" />
        </g>
        <path d="M134 194 L150 164" stroke="#8a7a6a" strokeWidth={2} />
        <path d="M150 164 Q160 158 154 170 Q148 176 142 178 Z" fill={WHITE} {...line} strokeWidth={1.4} />
      </g>
    ),
  },
};
