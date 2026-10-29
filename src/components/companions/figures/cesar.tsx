import { FACES, LINEN, line, laurelLeaves } from "./parts";
import type { Figure } from "./types";

/** Jules César: the laurel wreath, the hair combed forward, the aquiline nose, the purple-bordered toga. */
export const cesar: Figure = {
  skin: "#efcaa4",
  skinShade: "#d4a27a",
  iris: "#5a4630",
  face: FACES.angular,
  brow: { color: "#4a3220" },
  lips: "#b8705e",
  nose: (
    <g fill="none" {...line}>
      {/* Aquiline. */}
      <path d="M99 84 Q107 94 103 102 Q100 105 96 103" />
    </g>
  ),
  back: <path d="M64 144 Q38 200 50 244 L82 244 Q70 196 80 150 Z" fill="#a3302a" {...line} />,
  torso: LINEN,
  torsoShade: "#d9ccae",
  outfit: (
    <g>
      {/* Toga over the shoulder, its purple border. */}
      <path d="M64 146 Q100 160 142 212 L120 216 Q92 180 60 170 Z" fill="#faf3e4" {...line} />
      <path d="M64 147 Q100 161 141 211" stroke="#6b2a6b" strokeWidth={6} fill="none" />
      <path d="M80 176 Q96 186 110 206" stroke="#e2d6bc" strokeWidth={2} fill="none" />
      {/* Sandal straps. */}
      <path d="M78 230 L94 226 M106 226 L122 230" stroke="#6b4a2a" strokeWidth={3} />
    </g>
  ),
  sleeves: [LINEN, LINEN],
  legs: "#efcaa4",
  feet: "#6b4a2a",
  hair: (
    <g>
      {/* Short hair combed forward over a high brow. */}
      <path
        d="M60 88 Q56 44 100 40 Q144 44 140 88 Q136 68 126 64 L122 72 L116 62 L110 70 L104 60 L98 70 L92 60 L86 70 L80 62 L74 72 L70 64 Q62 72 60 88 Z"
        fill="#4a3220"
        {...line}
      />
      {laurelLeaves(74, 44, 30, "#c9a63a")}
    </g>
  ),
  pose: {
    left: { d: "M70 148 Q58 172 62 198", hand: [62, 200] },
    // The raised arm of the orator.
    right: { d: "M130 148 Q150 132 160 114", hand: [160, 112] },
    held: (
      <g transform="translate(62 200) rotate(-20)">
        <rect x={-5} y={-16} width={10} height={30} rx={4} fill="#efe2c2" {...line} />
        <rect x={-7} y={-18} width={14} height={5} rx={2.5} fill="#8a5a2c" />
      </g>
    ),
  },
};
