import { useId } from "react";
import { cn } from "@/lib/utils";
import type { CompanionId } from "@/components/companions/ids";
import { FIGURES } from "@/components/companions/figures";
import { INK, line } from "@/components/companions/figures/parts";
import type { Arm, Figure, Pose } from "@/components/companions/figures/types";

/*
 * The companions: ten historical figures drawn in SVG, chibi-sized but with
 * adult faces. This renderer draws what they share (body, arms, hands, the
 * face's expression, outlines and shadows); each figure (figures/) brings what
 * makes it recognisable: face shape, nose, hair, headwear, clothes, props and
 * its own pose. Blink and bounce are in index.css, the wave is SMIL, and all
 * of it stays still with prefers-reduced-motion.
 */

export type CompanionMood = "happy" | "cheer" | "sad" | "sleepy" | "think" | "wave";

const SHOULDER_L = "M70 148";
const SHOULDER_R = "M130 148";

/** Arms for each mood; "happy" uses the figure's own pose when it has one. */
const POSES: Record<CompanionMood, Pose> = {
  happy: {
    left: { d: `${SHOULDER_L} Q58 172 62 198`, hand: [62, 200] },
    right: { d: `${SHOULDER_R} Q142 172 138 198`, hand: [138, 200] },
  },
  cheer: {
    left: { d: `${SHOULDER_L} Q48 134 44 106`, hand: [44, 102] },
    right: { d: `${SHOULDER_R} Q152 134 156 106`, hand: [156, 102] },
  },
  sad: {
    left: { d: "M72 150 Q68 178 72 202", hand: [72, 204] },
    right: { d: "M128 150 Q132 178 128 202", hand: [128, 204] },
    headTilt: 4,
  },
  sleepy: {
    left: { d: "M72 150 Q68 178 72 202", hand: [72, 204] },
    right: { d: "M128 150 Q132 178 128 202", hand: [128, 204] },
    headTilt: 9,
  },
  think: {
    left: { d: `${SHOULDER_L} Q58 172 62 198`, hand: [62, 200] },
    // Hand on the chin, drawn over the face.
    right: { d: `${SHOULDER_R} Q160 168 118 134`, hand: [116, 132] },
  },
  wave: {
    left: { d: `${SHOULDER_L} Q58 172 62 198`, hand: [62, 200] },
    right: { d: `${SHOULDER_R} Q154 128 158 100`, hand: [158, 96] },
  },
};

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** An arm: an outlined sleeve and a hand (with its index finger raised for Socrate). */
const ArmShape = ({ arm, sleeve, skin }: { arm: Arm; sleeve: string; skin: string }) => (
  <g>
    <path d={arm.d} stroke={INK} strokeWidth={18} strokeLinecap="round" fill="none" />
    <path d={arm.d} stroke={sleeve} strokeWidth={14} strokeLinecap="round" fill="none" />
    {!arm.hidden && (
      <g>
        {arm.finger && <rect x={arm.hand[0] - 3} y={arm.hand[1] - 20} width={6} height={16} rx={3} fill={skin} {...line} />}
        <ellipse cx={arm.hand[0]} cy={arm.hand[1]} rx={7.5} ry={8} fill={skin} {...line} />
      </g>
    )}
  </g>
);

const EYE_L = 84;
const EYE_R = 116;
const EYE_Y = 88;

/** Eyes, brows and mouth, as the mood wants them. */
const Expression = ({ figure, mood, blink, uid }: { figure: Figure; mood: CompanionMood; blink: boolean; uid: string }) => {
  const scale = figure.eyes?.scale ?? 1;
  const kohl = figure.eyes?.kohl;
  const w = 10 * scale;
  const h = 6.5 * scale;
  const [lookX, lookY] = mood === "think" ? [3, -2] : mood === "sad" ? [0, 2] : [0, 0];
  const browWidth = figure.brow.width ?? 3.5;

  const eye = (cx: number, side: -1 | 1) => {
    const shape = `M${cx - w} ${EYE_Y} Q${cx} ${EYE_Y - h * 1.35} ${cx + w} ${EYE_Y} Q${cx} ${EYE_Y + h} ${cx - w} ${EYE_Y} Z`;
    const clip = `eye-${uid}-${side}`;
    if (mood === "cheer" || mood === "sleepy") {
      // Closed: smiling arcs, or heavy lids.
      const d =
        mood === "cheer"
          ? `M${cx - w} ${EYE_Y + 1} Q${cx} ${EYE_Y - h * 1.3} ${cx + w} ${EYE_Y + 1}`
          : `M${cx - w} ${EYE_Y} Q${cx} ${EYE_Y + h * 0.9} ${cx + w} ${EYE_Y}`;
      return <path key={`eye-${cx}`} d={d} fill="none" stroke={INK} strokeWidth={kohl ? 3.4 : 2.8} strokeLinecap="round" />;
    }
    return (
      <g key={`eye-${cx}`}>
        <clipPath id={clip}>
          <path d={shape} />
        </clipPath>
        <path d={shape} fill="#fff" />
        <g clipPath={`url(#${clip})`}>
          <circle cx={cx + lookX} cy={EYE_Y + lookY} r={4.8 * scale} fill={figure.iris} />
          <circle cx={cx + lookX} cy={EYE_Y + lookY} r={2.3 * scale} fill={INK} />
          <circle cx={cx + lookX + 1.6} cy={EYE_Y + lookY - 1.8} r={1.3} fill="#fff" />
        </g>
        {/* Upper lid line, heavier with kohl, with its wing. */}
        <path
          d={`M${cx - w} ${EYE_Y} Q${cx} ${EYE_Y - h * 1.35} ${cx + w} ${EYE_Y}`}
          fill="none"
          stroke={INK}
          strokeWidth={kohl ? 3.4 : 2.4}
          strokeLinecap="round"
        />
        <path d={`M${cx - w + 2} ${EYE_Y + 2} Q${cx} ${EYE_Y + h} ${cx + w - 2} ${EYE_Y + 2}`} fill="none" stroke={INK} strokeWidth={kohl ? 2 : 1} opacity={kohl ? 1 : 0.5} />
        {kohl && <path d={`M${side < 0 ? cx - w : cx + w} ${EYE_Y} l${side * 7} -3`} stroke={INK} strokeWidth={2.6} strokeLinecap="round" />}
        {blink && <path d={shape} fill={figure.skin} className="companion-lid" />}
      </g>
    );
  };

  const brow = (cx: number, side: -1 | 1) => {
    // side -1: the left brow (as seen); its inner end is on the right.
    const inner = cx - side * 9;
    const outer = cx + side * 9;
    const y = 74 - (mood === "cheer" ? 4 : 0) - (mood === "think" && side > 0 ? 5 : 0);
    const d =
      mood === "sad"
        ? `M${outer} ${y + 3} Q${cx} ${y + 1} ${inner} ${y - 4}`
        : mood === "sleepy"
          ? `M${outer} ${y + 3} Q${cx} ${y + 1} ${inner} ${y + 3}`
          : `M${outer} ${y + 2} Q${cx} ${y - 4} ${inner} ${y + 1}`;
    return <path key={`brow-${cx}`} d={d} fill="none" stroke={figure.brow.color} strokeWidth={browWidth} strokeLinecap="round" />;
  };

  const mouth =
    mood === "cheer" || mood === "wave" ? (
      <g>
        <path d={`M88 112 Q100 ${mood === "cheer" ? 112 : 113} 112 112 Q109 ${mood === "cheer" ? 128 : 123} 100 ${mood === "cheer" ? 128 : 123} Q91 ${mood === "cheer" ? 128 : 123} 88 112 Z`} fill="#7a2a24" {...line} />
        <path d="M91 113 L109 113 L108 116 L92 116 Z" fill="#fff" />
      </g>
    ) : mood === "sad" ? (
      <path d="M90 119 Q100 112 110 119" fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
    ) : mood === "sleepy" ? (
      <ellipse cx={100} cy={116} rx={3.5} ry={2.8} fill="#7a2a24" {...line} strokeWidth={1.4} />
    ) : mood === "think" ? (
      <path d="M93 117 Q101 115 108 112" fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
    ) : (
      <g>
        <path d="M89 112 Q100 122 111 112" fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
        <path d="M93 116 Q100 120 107 116" fill="none" stroke={figure.lips} strokeWidth={2} strokeLinecap="round" />
      </g>
    );

  return (
    <g>
      {figure.cheeks && mood !== "sad" && (
        <g fill="#ee8f7f" opacity={0.35}>
          <ellipse cx={72} cy={106} rx={7} ry={4} />
          <ellipse cx={128} cy={106} rx={7} ry={4} />
        </g>
      )}
      {brow(EYE_L, -1)}
      {brow(EYE_R, 1)}
      {eye(EYE_L, -1)}
      {eye(EYE_R, 1)}
      {figure.nose}
      {figure.beard}
      {mouth}
    </g>
  );
};

interface CompanionProps {
  id: CompanionId;
  mood?: CompanionMood;
  /** Off for still pictures (lists, icons). */
  animated?: boolean;
  /** A dark shape: a companion not unlocked yet. */
  silhouette?: boolean;
  /** "head" crops to the head and shoulders, for portraits. */
  framing?: "full" | "head";
  className?: string;
  title?: string;
  /** Position and size when drawn inside another SVG. */
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

/** A historical companion in a mood. */
const Companion = ({
  id,
  mood = "happy",
  animated = true,
  silhouette = false,
  framing = "full",
  className,
  title,
  ...position
}: CompanionProps) => {
  const uid = useId().replace(/:/g, "");
  const figure = FIGURES[id];
  const live = animated && !silhouette;
  const pose = mood === "happy" && figure.pose ? figure.pose : POSES[mood];
  const tilt = pose.headTilt ?? 0;
  const faceClip = `face-${uid}`;
  const torsoClip = `torso-${uid}`;
  const torsoPath = "M64 144 Q100 132 136 144 L144 208 Q100 218 56 208 Z";

  const leftArm = <ArmShape arm={pose.left} sleeve={figure.sleeves[0]} skin={figure.skin} />;
  const rightArm = <ArmShape arm={pose.right} sleeve={figure.sleeves[1]} skin={figure.skin} />;
  const waving = mood === "wave" && live && !reducedMotion();
  const handOnChin = mood === "think";

  return (
    <svg
      {...position}
      viewBox={framing === "head" ? "34 8 132 132" : "0 -12 200 266"}
      className={cn("companion", live && mood === "cheer" && "companion-bounce", silhouette && "companion-silhouette", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <clipPath id={faceClip}>
          <path d={figure.face} />
        </clipPath>
        <clipPath id={torsoClip}>
          <path d={torsoPath} />
        </clipPath>
      </defs>

      {figure.back}

      {/* Legs, feet and torso, with its shadow. */}
      <g {...line}>
        <rect x={78} y={204} width={17} height={34} rx={6} fill={figure.legs} />
        <rect x={105} y={204} width={17} height={34} rx={6} fill={figure.legs} />
        <ellipse cx={85} cy={242} rx={12} ry={6} fill={figure.feet} />
        <ellipse cx={115} cy={242} rx={12} ry={6} fill={figure.feet} />
      </g>
      <path d={torsoPath} fill={figure.torso} {...line} />
      <path d="M112 132 Q150 170 146 222 L160 222 L160 130 Z" fill={figure.torsoShade} clipPath={`url(#${torsoClip})`} />
      <path d={torsoPath} fill="none" {...line} />
      {figure.outfit}

      {pose.behind}
      {leftArm}
      {waving ? (
        <g>
          {rightArm}
          <animateTransform attributeName="transform" type="rotate" values="0 130 148; -14 130 148; 0 130 148" dur="0.9s" repeatCount="indefinite" />
        </g>
      ) : (
        !handOnChin && rightArm
      )}
      {pose.held}

      {/* Neck and head. */}
      <g transform={tilt ? `rotate(${tilt} 100 140)` : undefined}>
        <path d="M90 118 L110 118 L111 142 Q100 146 89 142 Z" fill={figure.skin} {...line} />
        <path d="M90 128 Q100 136 110 128 L110 122 L90 122 Z" fill={figure.skinShade} />
        <g fill={figure.skin} {...line}>
          <ellipse cx={60} cy={92} rx={7} ry={10} />
          <ellipse cx={140} cy={92} rx={7} ry={10} />
        </g>
        <path d={figure.face} fill={figure.skin} />
        {/* One shadow along the right of the face. */}
        <path d="M124 36 Q152 64 148 96 Q142 126 112 138 L170 140 L170 20 Z" fill={figure.skinShade} clipPath={`url(#${faceClip})`} />
        <path d={figure.face} fill="none" {...line} />
        {figure.wrinkles && (
          <path d="M86 62 Q100 58 114 62 M90 67 Q100 64 110 67" fill="none" stroke={figure.skinShade} strokeWidth={2} strokeLinecap="round" />
        )}
        <Expression figure={figure} mood={mood} blink={live} uid={uid} />
        {figure.hair}
      </g>

      {handOnChin && rightArm}

      {mood === "sleepy" && (
        <g fill={INK} fontFamily="Outfit, sans-serif" fontWeight={700} opacity={0.7}>
          <text x={160} y={30} fontSize={22} className={cn(live && "companion-z")}>z</text>
          <text x={176} y={10} fontSize={16} className={cn(live && "companion-z")} style={{ animationDelay: "0.6s" }}>z</text>
        </g>
      )}
    </svg>
  );
};

export default Companion;
