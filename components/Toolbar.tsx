"use client";

import { INK_COLORS, BRUSH_SIZES, type Tool } from "@/lib/types";

type Props = {
  color: string;
  setColor: (c: string) => void;
  size: number;
  setSize: (s: number) => void;
  tool: Tool;
  setTool: (t: Tool) => void;
  onUndo: () => void;
  canUndo: boolean;
  textRotation: number;
  setTextRotation: (r: number) => void;
};

export default function Toolbar({
  color,
  setColor,
  size,
  setSize,
  tool,
  setTool,
  onUndo,
  canUndo,
  textRotation,
  setTextRotation,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:flex lg:flex-col lg:gap-5">
      {/* Color picker */}
      <div>
        <p className="mb-2.5 text-sm font-semibold text-slate-800">Pick a color</p>
        <div className="flex flex-wrap items-center gap-2.5">
          {INK_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`Ink color ${c}`}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110 sm:h-9 sm:w-9 ${
                color === c ? "ring-2 ring-slate-900 ring-offset-2" : ""
              }`}
              style={{ backgroundColor: c }}
            >
              {color === c && <span className="text-xs text-white">✓</span>}
            </button>
          ))}
          <label className="relative flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 hover:border-violet-300">
            <span
              className="h-4 w-4 rounded-full"
              style={{
                background:
                  "conic-gradient(#f43f5e,#f59e0b,#22c55e,#3b82f6,#a855f7,#f43f5e)",
              }}
            />
            More
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>
        </div>
      </div>

      {/* Brush size */}
      <div>
        <p className="mb-2.5 text-sm font-semibold text-slate-800">Brush size</p>
        <div className="flex gap-2.5">
          {BRUSH_SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              aria-label={`Brush size ${s}`}
              className={`flex h-12 w-12 items-center justify-center rounded-full border bg-white transition-all hover:scale-105 ${
                size === s
                  ? "border-violet-500 ring-2 ring-violet-200"
                  : "border-slate-200"
              }`}
            >
              <span
                className="rounded-full bg-slate-900"
                style={{ width: s + 3, height: s + 3 }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="sm:col-span-2 lg:col-span-1">
        <p className="mb-2.5 text-sm font-semibold text-slate-800">Tools</p>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row lg:flex-col">
          <ToolButton
            active={tool === "draw"}
            onClick={() => setTool("draw")}
            icon="✍️"
            label="Draw"
            className="flex-1"
          />
          <ToolButton
            active={tool === "text"}
            onClick={() => setTool("text")}
            icon="🔤"
            label="Add Text"
            className="flex-1"
          />
          <ToolButton
            active={tool === "eraser"}
            onClick={() => setTool("eraser")}
            icon="🧽"
            label="Eraser"
            className="flex-1"
          />
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex flex-1 items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-violet-300 disabled:cursor-not-allowed disabled:opacity-40 lg:justify-between"
          >
            <span className="flex items-center gap-2.5">
              <span aria-hidden>↩️</span> Undo
            </span>
            <kbd className="hidden rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500 lg:inline-block">
              Ctrl + Z
            </kbd>
          </button>
        </div>
      </div>

      {/* Text rotation controls */}
      {tool === "text" && (
        <div
          className="rounded-2xl border border-slate-150 bg-slate-50/50 p-4 shadow-xs sm:col-span-2 lg:col-span-1"
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-800">Text rotation</p>
            <span className="font-mono text-xs font-bold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded">
              {textRotation}°
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="-90"
              max="90"
              value={textRotation}
              onChange={(e) => setTextRotation(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-violet-600 focus:outline-none"
            />
            <button
              onClick={() => setTextRotation(0)}
              className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 shadow-xs"
            >
              Reset
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[-45, -15, 0, 15, 45].map((angle) => (
              <button
                key={angle}
                onClick={() => setTextRotation(angle)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  textRotation === angle
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {angle > 0 ? `+${angle}°` : `${angle}°`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="hidden rounded-2xl bg-violet-50 p-3.5 text-sm text-violet-900 sm:col-span-2 sm:block lg:col-span-1">
        <p className="font-semibold">💡 Tip</p>
        <p className="mt-0.5 text-violet-800/80">
          Draw your signature or write a message — the eraser only clears your
          own unsaved strokes.
        </p>
      </div>
    </div>
  );
}

function ToolButton({
  active,
  onClick,
  icon,
  label,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center lg:justify-start gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "border-violet-500 bg-violet-50 text-violet-700 ring-2 ring-violet-100"
          : "border-slate-200 bg-white text-slate-700 hover:border-violet-300"
      } ${className}`}
    >
      <span aria-hidden>{icon}</span> {label}
    </button>
  );
}
