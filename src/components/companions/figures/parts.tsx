/** Colours and small drawings shared by the figures. */

export const INK = "#2b1a10";
export const WHITE = "#fbf6ec";
export const LINEN = "#f3ead6";
export const GOLD = "#e0a82e";
export const GOLD_DARK = "#a8770f";
export const LAPIS = "#2552a0";
export const CARNELIAN = "#b8432e";

/** The ink outline every shape gets. */
export const line = { stroke: INK, strokeWidth: 2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** The face shapes, reused by several figures. */
export const FACES = {
  round: "M60 86 Q60 40 100 38 Q140 40 140 86 Q140 112 124 124 Q112 132 100 132 Q88 132 76 124 Q60 112 60 86 Z",
  long: "M64 84 Q64 36 100 34 Q136 36 136 84 Q136 114 120 128 Q110 136 100 136 Q90 136 80 128 Q64 114 64 84 Z",
  oval: "M62 84 Q62 38 100 36 Q138 38 138 84 Q138 114 122 126 Q110 134 100 134 Q90 134 78 126 Q62 114 62 84 Z",
  angular: "M62 84 Q62 38 100 36 Q138 38 138 84 Q138 106 130 118 Q120 132 100 134 Q80 132 70 118 Q62 106 62 84 Z",
  broad: "M56 86 Q56 40 100 38 Q144 40 144 86 Q144 116 124 128 Q112 134 100 134 Q88 134 76 128 Q56 116 56 86 Z",
  heart: "M62 82 Q62 38 100 36 Q138 38 138 82 Q138 104 122 120 Q110 132 100 134 Q90 132 78 120 Q62 104 62 82 Z",
  square: "M62 82 Q62 36 100 34 Q138 36 138 82 Q138 108 130 120 Q118 132 100 132 Q82 132 70 120 Q62 108 62 82 Z",
};

/** A straight nose, with a little shadow. */
export const straightNose = (
  <g fill="none" {...line}>
    <path d="M100 88 Q99 98 96 102 Q100 105 104 102" />
  </g>
);

/** A broad Egyptian collar (usekh), in bands of gold, lapis and carnelian. */
export const usekh = (
  <g fill="none" strokeLinecap="butt">
    <path d="M76 140 Q100 182 124 140" stroke={INK} strokeWidth={20} />
    <path d="M76 140 Q100 182 124 140" stroke={GOLD} strokeWidth={17} />
    <path d="M78 141 Q100 176 122 141" stroke={LAPIS} strokeWidth={4.5} />
    <path d="M80 141 Q100 168 120 141" stroke={CARNELIAN} strokeWidth={3} />
    <path d="M73 143 Q100 188 127 143" stroke={LAPIS} strokeWidth={3} strokeDasharray="2 5" />
  </g>
);

/** An Egyptian white kilt (shendyt) with its gold belt and pleated apron. */
export const kilt = (
  <g>
    <path d="M56 188 Q100 196 144 188 L148 216 Q100 226 52 216 Z" fill={WHITE} {...line} />
    <path d="M90 194 L88 222 L112 222 L110 194 Z" fill="#efe6d2" {...line} strokeWidth={1.5} />
    <path d="M94 200 L93 220 M100 200 L100 222 M106 200 L107 220" stroke="#cdbf9f" strokeWidth={1.5} />
    <path d="M56 188 Q100 196 144 188" stroke={GOLD} strokeWidth={5} fill="none" />
  </g>
);

/** Leaves along an arc, for laurel wreaths. */
export const laurelLeaves = (cy: number, rx: number, ry: number, fill: string, from = 0.08, to = 0.92) =>
  Array.from({ length: 16 }, (_, i) => {
    const side = i < 8 ? -1 : 1;
    const t = from + (((i % 8) + 0.5) / 8) * (to - from);
    // From each temple (t = 0) up to the top of the head (t = 1).
    const a = Math.PI - t * (Math.PI / 2);
    const x = 100 + side * rx * Math.cos(a);
    const y = cy - ry * Math.sin(a);
    const angle = side * (90 - t * 90) + (i % 2 ? 35 : -35);
    return <ellipse key={i} cx={x} cy={y} rx={8} ry={3.6} fill={fill} {...line} strokeWidth={1.2} transform={`rotate(${angle} ${x} ${y})`} />;
  });
