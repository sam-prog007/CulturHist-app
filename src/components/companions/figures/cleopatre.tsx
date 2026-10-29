import { FACES, GOLD, GOLD_DARK, LAPIS, WHITE, line, usekh } from "./parts";
import type { Figure } from "./types";

const HAIR = "#141014";

/** Cléopâtre: the black hair with gold beads, the diadem with the uraeus, kohl, the collar and the sceptre. */
export const cleopatre: Figure = {
  skin: "#d9a273",
  skinShade: "#bb8352",
  iris: "#3a2a1a",
  face: FACES.heart,
  eyes: { kohl: true },
  cheeks: true,
  brow: { color: HAIR, width: 3 },
  lips: "#a23a3a",
  nose: (
    <g fill="none" {...line}>
      <path d="M100 90 Q99 98 97 101 Q100 103 103 101" />
    </g>
  ),
  back: (
    <g>
      <path d="M56 64 Q44 130 56 160 L86 160 Q72 120 70 80 Z M144 64 Q156 130 144 160 L114 160 Q128 120 130 80 Z" fill={HAIR} {...line} />
      <g fill={GOLD}>
        {[96, 112, 128, 144].map((y) => (
          <g key={y}>
            <circle cx={62} cy={y} r={2.2} />
            <circle cx={138} cy={y} r={2.2} />
          </g>
        ))}
      </g>
    </g>
  ),
  torso: WHITE,
  torsoShade: "#e4dac6",
  outfit: (
    <g>
      {/* Long sheath dress, gold belt and red sash. */}
      <path d="M58 204 L142 204 L148 238 Q100 246 52 238 Z" fill={WHITE} {...line} />
      <path d="M58 196 Q100 204 142 196" stroke={GOLD} strokeWidth={5} fill="none" />
      <path d="M100 202 L96 232 L104 232 Z" fill="#b5312a" {...line} strokeWidth={1.5} />
      {usekh}
    </g>
  ),
  sleeves: ["#d9a273", "#d9a273"],
  legs: WHITE,
  feet: GOLD_DARK,
  hair: (
    <g>
      {/* Straight fringe. */}
      <path d="M62 86 Q60 42 100 38 Q140 42 138 86 L132 86 Q132 66 122 64 L78 64 Q68 66 68 86 Z" fill={HAIR} {...line} />
      {/* Gold diadem, the uraeus raised in front. */}
      <path d="M60 64 Q100 46 140 64 L140 72 Q100 54 60 72 Z" fill={GOLD} {...line} />
      <path d="M100 34 Q90 48 96 58 L104 58 Q110 48 100 34 Z" fill={GOLD} stroke={GOLD_DARK} strokeWidth={1.5} />
      <circle cx={100} cy={44} r={2} fill="#c8302a" />
      <circle cx={80} cy={62} r={2.2} fill={LAPIS} />
      <circle cx={120} cy={62} r={2.2} fill={LAPIS} />
    </g>
  ),
  pose: {
    // A hand on the hip, the other on the sceptre.
    left: { d: "M70 148 Q46 172 68 194", hand: [68, 194] },
    right: { d: "M130 148 Q146 168 142 186", hand: [142, 188] },
    behind: (
      <g strokeLinecap="round">
        <path d="M144 98 L144 238" stroke="#2b1a10" strokeWidth={7} />
        <path d="M144 98 L144 238" stroke={GOLD} strokeWidth={4} />
        {/* A papyrus-flower top. */}
        <path d="M144 100 Q132 84 134 74 Q144 84 144 100 Q144 84 154 74 Q156 84 144 100 Z" fill="#3f8a6a" {...line} />
      </g>
    ),
  },
};
