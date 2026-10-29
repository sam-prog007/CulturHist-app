import { FACES, GOLD, GOLD_DARK, LAPIS, kilt, line, straightNose, usekh } from "./parts";
import type { Figure } from "./types";

/** Ramsès II: the blue war crown (khepresh) and its cobra, the false beard, the crook and flail crossed. */
export const ramses: Figure = {
  skin: "#b07648",
  skinShade: "#925a2f",
  iris: "#3a2414",
  face: FACES.long,
  eyes: { kohl: true },
  brow: { color: "#1b120c" },
  lips: "#7e3e2c",
  nose: straightNose,
  torso: "#b07648",
  torsoShade: "#925a2f",
  outfit: (
    <g>
      {kilt}
      {usekh}
    </g>
  ),
  sleeves: ["#b07648", "#b07648"],
  legs: "#b07648",
  feet: "#b07648",
  beard: (
    // The braided false beard of the pharaohs.
    <g>
      <path d="M94 130 L106 130 L105 158 Q100 163 95 158 Z" fill="#1f2a4a" {...line} />
      <path d="M95 138 L105 138 M95 146 L105 146 M95 153 L105 153" stroke={GOLD} strokeWidth={1.5} />
    </g>
  ),
  hair: (
    <g>
      {/* Khepresh, the blue crown studded with gold, and the uraeus. */}
      <path d="M60 84 Q52 52 66 30 Q80 4 100 2 Q120 4 134 30 Q148 52 140 84 Q132 66 100 64 Q68 66 60 84 Z" fill={LAPIS} {...line} />
      <g fill={GOLD}>
        {[
          [80, 22], [100, 16], [120, 22], [72, 38], [90, 34], [110, 34], [128, 38], [68, 54], [84, 50], [100, 48], [116, 50], [132, 54],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={2.4} />
        ))}
      </g>
      <path d="M60 80 Q100 60 140 80" stroke={GOLD} strokeWidth={4} fill="none" />
      <path d="M100 52 Q90 64 96 72 L104 72 Q110 64 100 52 Z" fill={GOLD} stroke={GOLD_DARK} strokeWidth={1.5} />
      <circle cx={100} cy={60} r={1.6} fill="#c8302a" />
    </g>
  ),
  pose: {
    left: { d: "M70 148 Q60 174 92 172", hand: [92, 172] },
    right: { d: "M130 148 Q140 174 108 172", hand: [108, 172] },
    held: (
      <g strokeLinecap="round" fill="none">
        {/* Crook (heqa). */}
        <path d="M110 186 L78 136 Q72 126 80 122 Q88 120 88 128" stroke="#2b1a10" strokeWidth={7} />
        <path d="M110 186 L78 136 Q72 126 80 122 Q88 120 88 128" stroke={GOLD} strokeWidth={4.5} />
        <path d="M110 186 L78 136" stroke={LAPIS} strokeWidth={4.5} strokeDasharray="4 4" />
        {/* Flail (nekhakha). */}
        <path d="M90 186 L122 136" stroke="#2b1a10" strokeWidth={7} />
        <path d="M90 186 L122 136" stroke={GOLD} strokeWidth={4.5} />
        <path d="M122 136 Q132 140 134 152 M122 136 Q136 136 140 146 M122 136 Q130 132 138 136" stroke={LAPIS} strokeWidth={3} />
      </g>
    ),
  },
};
