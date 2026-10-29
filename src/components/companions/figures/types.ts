import type { ReactNode } from "react";

export type Point = [number, number];

/** An arm from the shoulder, as an SVG path, and where its hand ends. */
export interface Arm {
  d: string;
  hand: Point;
  /** Hand out of sight: in a waistcoat, in a sleeve. */
  hidden?: boolean;
  /** Index finger raised (Socrate asking a question). */
  finger?: boolean;
}

export interface Pose {
  left: Arm;
  right: Arm;
  /** What the hands hold, drawn over them. */
  held?: ReactNode;
  /** Drawn behind the arms (a staff the arm goes in front of). */
  behind?: ReactNode;
  /** Tilt of the head, in degrees (negative: chin up). */
  headTilt?: number;
}

/**
 * One historical companion: what makes it recognisable. The shared renderer
 * (Companion.tsx) draws the body, the arms, the face's expression, the
 * outlines and the shadows; a figure gives its colours, face shape and
 * features, hair, clothes, and the pose it strikes when all is well.
 *
 * Coordinates: viewBox 0 -12 200 266. Head around (100, 86), eyes at y 88
 * (x 84 and 116), brows at y 74, nose 86–104, mouth at y 114, chin about
 * y 132; shoulders at (70, 148) and (130, 148), hips at y 208, feet at y 242.
 */
export interface Figure {
  skin: string;
  skinShade: string;
  iris: string;
  /** Face outline, ears excluded. */
  face: string;
  eyes?: { kohl?: boolean; scale?: number };
  /** Rosy cheeks, for the younger figures. */
  cheeks?: boolean;
  /** Forehead lines, for the elders. */
  wrinkles?: boolean;
  brow: { color: string; width?: number };
  lips: string;
  nose: ReactNode;
  /** Behind everything: cloaks, long hair. */
  back?: ReactNode;
  /** Torso colour, and its shadow. */
  torso: string;
  torsoShade: string;
  /** Over the torso: collars, belts, sashes, kilts. */
  outfit?: ReactNode;
  /** Sleeve colours (skin for bare arms), left then right as seen. */
  sleeves: [string, string];
  legs: string;
  feet: string;
  /** Over the face, under the mouth: beards and moustaches. */
  beard?: ReactNode;
  /** Hair and headwear, over the face. */
  hair?: ReactNode;
  /** Its own pose for the "happy" mood. */
  pose?: Pose;
}
