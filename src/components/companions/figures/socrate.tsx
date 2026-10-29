import { FACES, line } from "./parts";
import type { Figure } from "./types";

const GREY = "#bdb6aa";

/** Curls of hair or beard, as a cluster of circles. */
const curls = (points: [number, number, number][]) =>
  points.map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={GREY} {...line} strokeWidth={1.6} />);

/** Socrate: bald and bearded, the snub nose and bulging eyes Plato described, the himation, bare feet. */
export const socrate: Figure = {
  skin: "#eec9a2",
  skinShade: "#d3a278",
  iris: "#5a4a3a",
  face: FACES.broad,
  eyes: { scale: 1.2 },
  wrinkles: true,
  brow: { color: "#9a948a", width: 5 },
  lips: "#b8705e",
  nose: (
    <g {...line} fill="none">
      {/* Snub nose. */}
      <path d="M97 88 Q91 102 93 105 Q100 110 107 105 Q109 102 103 88" />
      <circle cx={96} cy={104} r={1.2} fill="#2b1a10" />
      <circle cx={104} cy={104} r={1.2} fill="#2b1a10" />
    </g>
  ),
  torso: "#d9c9a3",
  torsoShade: "#bba97f",
  outfit: (
    <g>
      {/* The right shoulder bare, the himation over the left one. */}
      <path d="M112 140 Q130 140 136 146 L138 168 Q122 160 112 140 Z" fill="#eec9a2" {...line} />
      <path d="M64 150 Q96 168 124 214 M84 146 Q106 172 136 204" stroke="#bba97f" strokeWidth={2} fill="none" />
      <path d="M66 148 Q100 158 138 168" stroke="#a8956a" strokeWidth={4} fill="none" />
    </g>
  ),
  sleeves: ["#d9c9a3", "#eec9a2"],
  legs: "#eec9a2",
  feet: "#eec9a2",
  beard: (
    <g>
      {curls([
        [64, 108, 9], [70, 124, 10], [80, 138, 10], [94, 146, 11], [108, 146, 11], [122, 138, 10], [132, 124, 10], [138, 108, 9],
        [88, 156, 9], [102, 160, 9], [116, 154, 9],
      ])}
      <path d="M84 110 Q100 102 116 110 Q108 116 100 114 Q92 116 84 110 Z" fill={GREY} {...line} />
    </g>
  ),
  hair: (
    <g>
      {/* Bald and shining on top, grey curls at the temples. */}
      <ellipse cx={86} cy={50} rx={14} ry={7} transform="rotate(-18 86 50)" fill="#fff" opacity={0.45} />
      {curls([
        [58, 70, 8], [54, 84, 8], [58, 98, 7], [142, 70, 8], [146, 84, 8], [142, 98, 7],
      ])}
    </g>
  ),
  pose: {
    left: { d: "M70 148 Q58 172 62 198", hand: [62, 200] },
    // A raised finger: a question.
    right: { d: "M130 148 Q160 142 162 120", hand: [162, 118], finger: true },
  },
};
