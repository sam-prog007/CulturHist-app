import { FACES, GOLD, GOLD_DARK, line } from "./parts";
import type { Figure } from "./types";

const HAIR = "#a8742e";

/** Curls of hair, as a cluster of circles. */
const curls = (points: [number, number, number][]) =>
  points.map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={HAIR} {...line} strokeWidth={1.6} />);

/** Alexandre le Grand: young and clean-shaven, the mane swept up from the brow (anastole), linothorax and red cloak, spear. */
export const alexandre: Figure = {
  skin: "#f2d2b0",
  skinShade: "#d8ab82",
  iris: "#6a8a9a",
  face: FACES.square,
  cheeks: true,
  brow: { color: "#8a5a2a" },
  lips: "#c07a68",
  nose: (
    <g fill="none" {...line}>
      {/* Straight Greek nose, from the brow. */}
      <path d="M100 78 L99 100 Q101 103 105 101" />
    </g>
  ),
  back: (
    <g>
      <path d="M62 144 Q34 200 44 246 L156 246 Q166 200 138 144 Z" fill="#b5342a" {...line} />
      {curls([
        [56, 70, 12], [52, 90, 12], [56, 110, 11], [144, 70, 12], [148, 90, 12], [144, 110, 11], [66, 50, 12], [134, 50, 12],
      ])}
    </g>
  ),
  torso: "#efe3c4",
  torsoShade: "#d6c69e",
  outfit: (
    <g>
      {/* Linothorax: shoulder flaps, a gorgon on the chest, a belt and the strips (pteruges). */}
      <path d="M64 144 L84 140 L86 158 L66 162 Z M136 144 L116 140 L114 158 L134 162 Z" fill="#e4d4ac" {...line} />
      <circle cx={100} cy={168} r={8} fill={GOLD} {...line} />
      <path d="M96 166 l2 0 M102 166 l2 0 M97 171 q3 2 6 0" stroke={GOLD_DARK} strokeWidth={1.4} fill="none" />
      <path d="M58 194 Q100 202 142 194" stroke="#2552a0" strokeWidth={6} fill="none" />
      {[60, 72, 84, 96, 108, 120, 132].map((x) => (
        <rect key={x} x={x} y={198} width={10} height={20} rx={2} fill="#efe3c4" {...line} strokeWidth={1.5} />
      ))}
      <path d="M78 230 L94 226 M106 226 L122 230" stroke="#6b4a2a" strokeWidth={3} />
    </g>
  ),
  sleeves: ["#f2d2b0", "#f2d2b0"],
  legs: "#f2d2b0",
  feet: "#6b4a2a",
  hair: (
    <g>
      {/* The anastole: the hair rising from the middle of the brow. */}
      <path
        d="M60 86 Q56 42 100 36 Q144 42 140 86 Q136 66 124 60 Q114 64 108 56 Q104 66 100 68 Q96 66 92 56 Q86 64 76 60 Q64 66 60 86 Z"
        fill={HAIR}
        {...line}
      />
      <path d="M90 58 Q96 34 100 30 Q104 34 110 58 Q104 50 100 52 Q96 50 90 58 Z" fill={HAIR} {...line} />
      {curls([
        [72, 42, 9], [86, 34, 9], [114, 34, 9], [128, 42, 9],
      ])}
      <path d="M80 46 Q92 38 98 40" stroke="#d29a4a" strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
  ),
  pose: {
    left: { d: "M70 148 Q58 172 62 198", hand: [62, 200] },
    right: { d: "M130 148 Q148 164 146 182", hand: [146, 184] },
    behind: (
      <g strokeLinecap="round">
        <path d="M146 26 L150 246" stroke="#2b1a10" strokeWidth={7} />
        <path d="M146 26 L150 246" stroke="#8a5a2c" strokeWidth={4} />
        <path d="M146 6 L152 28 L140 28 Z" fill="#c48a2c" {...line} />
      </g>
    ),
    // Chin up, as in his portraits.
    headTilt: -5,
  },
};
