import type { Stroke } from "@/lib/types";

export type StampId = "heart" | "star" | "balloon" | "smiley" | "sparkle";

export type StampDef = {
  id: StampId;
  label: string;
  icon: string;
  /* Each stamp is one or more polylines in unit space (roughly -1..1). */
  strokes: number[][];
};

const TAU = Math.PI * 2;

function heart(): number[][] {
  const pts: number[] = [];
  for (let i = 0; i <= 36; i++) {
    const t = (i / 36) * TAU;
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    pts.push(x / 17, y / 17);
  }
  return [pts];
}

function star(): number[][] {
  const pts: number[] = [];
  for (let i = 0; i <= 10; i++) {
    const r = i % 2 === 0 ? 1 : 0.45;
    const a = (i / 10) * TAU - Math.PI / 2;
    pts.push(Math.cos(a) * r, Math.sin(a) * r);
  }
  return [pts];
}

function balloon(): number[][] {
  const pts: number[] = [];
  // body: ellipse traced from the bottom, all the way around
  const cx = 0, cy = -0.45, rx = 0.5, ry = 0.62;
  for (let i = 0; i <= 32; i++) {
    const a = Math.PI / 2 + (i / 32) * TAU;
    pts.push(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry);
  }
  // knot
  pts.push(-0.07, 0.24, 0.07, 0.3);
  // wavy string
  for (let i = 1; i <= 12; i++) {
    const t = i / 12;
    pts.push(0.07 * Math.sin(t * Math.PI * 3), 0.3 + t * 0.9);
  }
  return [pts];
}

function smiley(): number[][] {
  const face: number[] = [];
  for (let i = 0; i <= 28; i++) {
    const a = (i / 28) * TAU;
    face.push(Math.cos(a), Math.sin(a));
  }
  const mouth: number[] = [];
  for (let i = 0; i <= 12; i++) {
    const a = (Math.PI * (30 + (i / 12) * 120)) / 180;
    mouth.push(Math.cos(a) * 0.55, Math.sin(a) * 0.55);
  }
  const eyeL = [-0.35, -0.3, -0.33, -0.12];
  const eyeR = [0.35, -0.3, 0.33, -0.12];
  return [face, mouth, eyeL, eyeR];
}

function sparkle(): number[][] {
  const pts: number[] = [];
  const spikes: [number, number][] = [
    [0, -1], [0.16, -0.16], [1, 0], [0.16, 0.16],
    [0, 1], [-0.16, 0.16], [-1, 0], [-0.16, -0.16],
  ];
  for (const [x, y] of spikes) pts.push(x, y);
  pts.push(0, -1);
  return [pts];
}

export const STAMPS: StampDef[] = [
  { id: "heart", label: "Heart", icon: "❤️", strokes: heart() },
  { id: "star", label: "Star", icon: "⭐", strokes: star() },
  { id: "balloon", label: "Balloon", icon: "🎈", strokes: balloon() },
  { id: "smiley", label: "Smiley", icon: "😊", strokes: smiley() },
  { id: "sparkle", label: "Sparkle", icon: "✨", strokes: sparkle() },
];

/* Instantiate a stamp as real ink strokes at a canvas position.
   A touch of rotation + per-point jitter keeps it looking hand-drawn. */
export function stampToStrokes(
  id: StampId,
  cx: number,
  cy: number,
  scale: number,
  color: string,
  strokeWidth: number
): Stroke[] {
  const def = STAMPS.find((s) => s.id === id);
  if (!def) return [];
  const rot = ((Math.random() - 0.5) * 16 * Math.PI) / 180;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const jitter = scale * 0.025;

  return def.strokes.map((unit) => {
    const points: number[] = [];
    for (let i = 0; i < unit.length; i += 2) {
      const x = unit[i] * scale + (Math.random() - 0.5) * jitter;
      const y = unit[i + 1] * scale + (Math.random() - 0.5) * jitter;
      points.push(cx + x * cos - y * sin, cy + x * sin + y * cos);
    }
    return { points, color, size: strokeWidth };
  });
}
