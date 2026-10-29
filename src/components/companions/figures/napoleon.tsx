import { FACES, GOLD, INK, WHITE, line } from "./parts";
import type { Figure } from "./types";

/** Napoléon: the forelock, the bicorne worn sideways, the grey redingote, the hand in the waistcoat. */
export const napoleon: Figure = {
  skin: "#f2d3b3",
  skinShade: "#ddb08b",
  iris: "#5b7fa6",
  face: FACES.round,
  cheeks: true,
  brow: { color: "#3a2418" },
  lips: "#c27766",
  nose: (
    <g fill="none" {...line}>
      <path d="M101 86 L98 101 Q101 104 105 101" />
    </g>
  ),
  torso: "#8f939b",
  torsoShade: "#747881",
  outfit: (
    <g>
      {/* Green chasseur coat with its red collar, and the white waistcoat, under the open redingote. */}
      <path d="M84 142 L100 152 L116 142 L122 208 Q100 214 78 208 Z" fill="#2f5a3e" {...line} />
      <path d="M90 148 L100 154 L110 148 L112 200 Q100 204 88 200 Z" fill={WHITE} {...line} />
      <path d="M86 140 L100 150 L114 140 L110 134 L100 144 L90 134 Z" fill="#b5312a" {...line} />
      <g fill={GOLD}>
        {[164, 176, 188].map((y) => (
          <circle key={y} cx={100} cy={y} r={1.8} />
        ))}
      </g>
      {/* The Légion d'honneur on the redingote. */}
      <rect x={124} y={158} width={6} height={7} fill="#c8302a" />
      <path d="M127 166 l2.4 4.6 5 .7 -3.6 3.5 .9 5 -4.7 -2.4 -4.7 2.4 .9 -5 -3.6 -3.5 5 -.7 Z" fill="#e8e8ee" {...line} strokeWidth={1} />
      {/* Boots over the white breeches. */}
      <path d="M76 222 L96 222 L96 240 L76 240 Z M104 222 L124 222 L124 240 L104 240 Z" fill="#1c1a20" {...line} />
    </g>
  ),
  sleeves: ["#8f939b", "#8f939b"],
  legs: "#efe9dc",
  feet: "#1c1a20",
  hair: (
    <g>
      <path
        d="M60 90 Q54 52 78 44 Q100 36 122 44 Q146 52 140 90 Q136 72 126 64 Q112 68 104 62 Q92 68 80 66 Q66 72 62 90 Z"
        fill="#3a2418"
        {...line}
      />
      {/* The famous forelock. */}
      <path d="M106 60 Q86 64 92 80 Q95 71 102 71 Q98 66 106 60 Z" fill="#3a2418" {...line} />
      {/* Bicorne, worn sideways "en bataille", with the tricolour cockade. */}
      <path d="M16 62 Q38 20 100 18 Q162 20 184 62 Q150 46 100 50 Q50 46 16 62 Z" fill="#1c1a22" {...line} />
      <path d="M24 58 Q60 44 100 47 Q140 44 176 58" stroke={GOLD} strokeWidth={2.5} fill="none" />
      <circle cx={80} cy={34} r={8} fill="#24427a" {...line} strokeWidth={1.5} />
      <circle cx={80} cy={34} r={5} fill={WHITE} />
      <circle cx={80} cy={34} r={2.4} fill="#c8302a" />
    </g>
  ),
  pose: {
    left: { d: "M70 148 Q58 172 62 198", hand: [62, 200] },
    // The hand tucked in the waistcoat.
    right: { d: "M130 148 Q142 172 112 172", hand: [110, 172], hidden: true },
    held: <path d="M104 166 L116 166 L114 178 L104 178 Z" fill="#2f5a3e" stroke={INK} strokeWidth={1.5} />,
  },
};
