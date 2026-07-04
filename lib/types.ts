export type Stroke = {
  points: number[];
  color: string;
  size: number;
};

export type TextItem = {
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  rotate: number;
};

export type Mark =
  | { kind: "stroke"; stroke: Stroke }
  | { kind: "text"; item: TextItem };

export type Tool = "draw" | "text" | "stamp" | "eraser";

export const INK_COLORS = [
  "#1a1a1a",
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#7c3aed",
] as const;

export const BRUSH_SIZES = [4, 8, 13] as const;
