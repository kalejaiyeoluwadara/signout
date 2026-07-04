"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Text, Image as KonvaImage } from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Mark, TextItem, Tool } from "@/lib/types";
import { STAMPS, stampToStrokes, type StampId } from "@/lib/stamps";
import { toast } from "@/components/toast/Toaster";

export const BASE_W = 1000;
export const BASE_H = 1000;

/* Canvas intelligence knobs */
const MAX_STROKE_LEN = 1400; // logical px — stops shirt-crossing lines
const CROWD_FLOOR = 0.6; // new marks never shrink below 60%
const CROWD_FULL_AT = 450; // marks on the shirt at which shrink bottoms out

type Props = {
  savedMarks: Mark[];
  currentMarks: Mark[];
  setCurrentMarks: React.Dispatch<React.SetStateAction<Mark[]>>;
  tool: Tool;
  color: string;
  size: number;
  stamp: StampId;
  textRotation: number;
  setTextRotation: (r: number) => void;
  onStageRef?: (stage: Konva.Stage | null) => void;
};

/* Marker-ink look: multiply blending sinks the ink into the fabric shading,
   a soft same-color shadow gives a slight bleed like a real marker. */
const inkProps = (points: number[], color: string, size: number) => ({
  points,
  stroke: color,
  strokeWidth: size,
  lineCap: "round" as const,
  lineJoin: "round" as const,
  tension: 0.45,
  opacity: 0.92,
  globalCompositeOperation: "multiply" as const,
  shadowColor: color,
  shadowBlur: size * 0.45,
  shadowOpacity: 0.28,
  perfectDrawEnabled: false,
  listening: false,
});

const textProps = (t: TextItem, fontFamily: string) => ({
  x: t.x,
  y: t.y - t.fontSize * 0.8,
  text: t.text,
  fontSize: t.fontSize,
  fontFamily,
  fill: t.color,
  rotation: t.rotate,
  opacity: 0.92,
  globalCompositeOperation: "multiply" as const,
  shadowColor: t.color,
  shadowBlur: t.fontSize * 0.12,
  shadowOpacity: 0.2,
  perfectDrawEnabled: false,
  listening: false,
});

const MarksLayer = memo(function MarksLayer({
  marks,
  fontFamily,
}: {
  marks: Mark[];
  fontFamily: string;
}) {
  return (
    <>
      {marks.map((m, i) =>
        m.kind === "stroke" ? (
          <Line key={i} {...inkProps(m.stroke.points, m.stroke.color, m.stroke.size)} />
        ) : (
          <Text key={i} {...textProps(m.item, fontFamily)} />
        )
      )}
    </>
  );
});

export default function ShirtBoard({
  savedMarks,
  currentMarks,
  setCurrentMarks,
  tool,
  color,
  size,
  stamp,
  textRotation,
  setTextRotation,
  onStageRef,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const savedLayerRef = useRef<Konva.Layer>(null);
  const liveLayerRef = useRef<Konva.Layer>(null);
  const drawingRef = useRef(false);
  const strokeLenRef = useRef(0);
  const warnedLongStrokeRef = useRef(false);
  const [width, setWidth] = useState(0);
  const [shirtImg, setShirtImg] = useState<HTMLImageElement | null>(null);
  const [fontFamily] = useState(() => {
    if (typeof document === "undefined") return "cursive";
    const val = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-caveat")
      .trim();
    return val ? `${val}, cursive` : "cursive";
  });
  const [pendingText, setPendingText] = useState<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const [draft, setDraft] = useState("");

  /* Crowding intelligence: the fuller the shirt, the smaller new marks
     become, so late signers still find room without burying early ones. */
  const crowd = Math.max(
    CROWD_FLOOR,
    1 - (savedMarks.length + currentMarks.length) / CROWD_FULL_AT
  );
  const effBrush = size * crowd;
  const effFont = size * 3.2 * crowd;
  const stampScale = (13 + size * 2) * crowd;
  const stampWidth = Math.max(2, size * 0.5 * crowd);

  const handleBlur = (e: React.FocusEvent) => {
    if (e.relatedTarget && editorRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    commitDraft();
  };

  useEffect(() => {
    const img = new window.Image();
    img.src = "/shirt.png";
    img.onload = () => setShirtImg(img);
  }, []);

  useEffect(() => {
    document.fonts?.ready?.then(() => {
      savedLayerRef.current?.batchDraw();
      liveLayerRef.current?.batchDraw();
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Blend the ink layers' canvases with the shirt layer beneath them,
  // so strokes pick up the fabric's wrinkles and shading in real time.
  useEffect(() => {
    for (const ref of [savedLayerRef, liveLayerRef]) {
      const canvas = ref.current?.getCanvas()._canvas;
      if (canvas) canvas.style.mixBlendMode = "multiply";
    }
  }, [shirtImg, width]);

  const scale = width / BASE_W;

  const getPos = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const p = e.target.getStage()?.getPointerPosition();
    return p ? { x: p.x / scale, y: p.y / scale } : null;
  };

  const eraseAt = (pos: { x: number; y: number }) => {
    setCurrentMarks((prev) =>
      prev.filter((m) => {
        if (m.kind === "stroke") {
          const r = Math.max(16, m.stroke.size * 1.5);
          for (let i = 0; i < m.stroke.points.length; i += 2) {
            const dx = m.stroke.points[i] - pos.x;
            const dy = m.stroke.points[i + 1] - pos.y;
            if (dx * dx + dy * dy < r * r) return false;
          }
          return true;
        }
        const t = m.item;
        const halfW = (t.text.length * t.fontSize * 0.28) / 2;
        const cx = t.x + halfW;
        const cy = t.y - t.fontSize * 0.3;
        const dx = cx - pos.x;
        const dy = cy - pos.y;
        const r = halfW + 20;
        return dx * dx + dy * dy > r * r;
      })
    );
  };

  const placeStamp = (id: StampId, cx: number, cy: number) => {
    const strokes = stampToStrokes(id, cx, cy, stampScale, color, stampWidth);
    setCurrentMarks((prev) => [
      ...prev,
      ...strokes.map((s): Mark => ({ kind: "stroke", stroke: s })),
    ]);
  };

  const commitDraft = (withStamp?: StampId) => {
    const text = draft.trim();
    if (text && pendingText) {
      setCurrentMarks((prev) => [
        ...prev,
        {
          kind: "text",
          item: {
            x: pendingText.x,
            y: pendingText.y,
            text,
            color,
            fontSize: effFont,
            rotate: textRotation,
          },
        },
      ]);
      if (withStamp) {
        // drop the sticker right after the text, following its rotation
        const textW = text.length * effFont * 0.42;
        const rad = (textRotation * Math.PI) / 180;
        const offset = textW + stampScale * 0.9;
        placeStamp(
          withStamp,
          pendingText.x + Math.cos(rad) * offset,
          pendingText.y - effFont * 0.35 + Math.sin(rad) * offset
        );
      }
    }
    setPendingText(null);
    setDraft("");
  };

  const handleDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.evt.preventDefault();
    if (pendingText) return;
    const pos = getPos(e);
    if (!pos) return;

    if (tool === "text") {
      const screenPos = e.target.getStage()?.getPointerPosition();
      if (!screenPos) return;
      setPendingText({
        x: pos.x,
        y: pos.y,
        left: screenPos.x,
        top: screenPos.y,
      });
      return;
    }

    if (tool === "stamp") {
      placeStamp(stamp, pos.x, pos.y);
      return;
    }

    drawingRef.current = true;
    strokeLenRef.current = 0;
    if (tool === "eraser") {
      eraseAt(pos);
    } else {
      setCurrentMarks((prev) => [
        ...prev,
        {
          kind: "stroke",
          stroke: { points: [pos.x, pos.y, pos.x + 0.01, pos.y + 0.01], color, size: effBrush },
        },
      ]);
    }
  };

  const handleMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!drawingRef.current) return;
    e.evt.preventDefault();
    const pos = getPos(e);
    if (!pos) return;
    if (tool === "eraser") {
      eraseAt(pos);
      return;
    }
    setCurrentMarks((prev) => {
      const lastIdx = prev.length - 1;
      const last = prev[lastIdx];
      if (!last || last.kind !== "stroke") return prev;
      const pts = last.stroke.points;

      const lastX = pts[pts.length - 2];
      const lastY = pts[pts.length - 1];

      // Skip if the pointer barely moved (avoids flooding with redundant points)
      const dx = pos.x - lastX;
      const dy = pos.y - lastY;
      const distSq = dx * dx + dy * dy;
      if (distSq < 9) return prev;

      // Stroke-length guard: end runaway lines before they cross
      // everyone else's signatures.
      const dist = Math.sqrt(distSq);
      if (strokeLenRef.current + dist > MAX_STROKE_LEN) {
        drawingRef.current = false;
        if (!warnedLongStrokeRef.current) {
          warnedLongStrokeRef.current = true;
          toast.info(
            "That's one long stroke! ✋",
            "We cap stroke length so everyone's marks stay safe. Lift and keep drawing."
          );
        }
        return prev;
      }
      strokeLenRef.current += dist;

      const updated: Mark = {
        kind: "stroke",
        stroke: { ...last.stroke, points: [...pts, pos.x, pos.y] },
      };
      return [...prev.slice(0, lastIdx), updated];
    });
  };

  const handleUp = () => {
    drawingRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none"
      style={{ touchAction: "none", aspectRatio: `${BASE_W} / ${BASE_H}` }}
    >
      {width > 0 && (
        <Stage
          ref={(node) => {
            stageRef.current = node;
            onStageRef?.(node);
          }}
          width={width}
          height={width * (BASE_H / BASE_W)}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={handleDown}
          onMouseMove={handleMove}
          onMouseUp={handleUp}
          onMouseLeave={handleUp}
          onTouchStart={handleDown}
          onTouchMove={handleMove}
          onTouchEnd={handleUp}
          style={{
            cursor:
              tool === "eraser"
                ? "cell"
                : tool === "text"
                  ? "text"
                  : tool === "stamp"
                    ? "copy"
                    : "crosshair",
          }}
        >
          <Layer listening={false}>
            {shirtImg && (
              <KonvaImage image={shirtImg} width={BASE_W} height={BASE_H} />
            )}
          </Layer>
          <Layer ref={savedLayerRef} listening={false}>
            <MarksLayer marks={savedMarks} fontFamily={fontFamily} />
          </Layer>
          <Layer ref={liveLayerRef} listening={false}>
            <MarksLayer marks={currentMarks} fontFamily={fontFamily} />
          </Layer>
        </Stage>
      )}

      {pendingText && (
        <div
          ref={editorRef}
          className="absolute z-10 flex flex-col gap-2"
          style={{
            // Keep the editor inside the canvas even when tapping near an edge
            left: Math.max(4, Math.min(pendingText.left, width - 184)),
            top: Math.max(
              4,
              Math.min(
                pendingText.top - effFont * scale * 0.8,
                width * (BASE_H / BASE_W) - 110
              )
            ),
          }}
        >
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitDraft();
              if (e.key === "Escape") {
                setPendingText(null);
                setDraft("");
              }
            }}
            maxLength={140}
            placeholder="Type your message…"
            className="font-hand rounded-md border border-violet-300 bg-white/95 px-2.5 py-1.5 shadow-md outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            style={{
              fontSize: Math.max(16, effFont * scale),
              color,
              transform: `rotate(${textRotation}deg)`,
              transformOrigin: "left center",
              minWidth: "160px",
              maxWidth: Math.max(160, width - 24),
              transition: "transform 0.1s ease",
            }}
          />

          <div
            className="flex items-center gap-1 self-start rounded-full border border-slate-200/80 bg-white/95 px-2 py-1 text-xs font-semibold text-slate-600 shadow-md"
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
          >
            <button
              onClick={() => setTextRotation(Math.max(-90, textRotation - 15))}
              className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold transition-all hover:bg-slate-100 active:scale-95"
              title="Rotate counter-clockwise 15°"
            >
              ↺
            </button>
            <span className="min-w-8 select-none text-center font-mono text-[9px] font-bold text-violet-600">
              {textRotation}°
            </span>
            <button
              onClick={() => setTextRotation(Math.min(90, textRotation + 15))}
              className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold transition-all hover:bg-slate-100 active:scale-95"
              title="Rotate clockwise 15°"
            >
              ↻
            </button>
            <div className="mx-0.5 h-3 w-px bg-slate-200" />
            <button
              onClick={() => setTextRotation(0)}
              className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 hover:bg-slate-200"
            >
              0°
            </button>
            <div className="mx-0.5 h-3 w-px bg-slate-200" />
            {/* One-tap: commit the text with a hand-drawn sticker after it */}
            {(["heart", "star", "sparkle"] as StampId[]).map((id) => (
              <button
                key={id}
                onClick={() => commitDraft(id)}
                disabled={!draft.trim()}
                className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] transition-all hover:bg-violet-50 active:scale-95 disabled:opacity-35"
                title={`Add text with a ${id}`}
              >
                {STAMPS.find((s) => s.id === id)?.icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
