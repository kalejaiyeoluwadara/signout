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
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2.5 text-sm font-semibold text-slate-800">Pick a color</p>
        <div className="flex flex-wrap items-center gap-2.5">
          {INK_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`Ink color ${c}`}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110 ${
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
50:                   "conic-gradient(#f43f5e,#f59e0b,#22c55e,#3b82f6,#a855f7,#f43f5e)",
51:               }}
52:             />
53:             More
54:             <input
55:               type="color"
56:               value={color}
57:               onChange={(e) => setColor(e.target.value)}
58:               className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
59:             />
60:           </label>
61:         </div>
62:       </div>
63: 
64:       <div>
65:         <p className="mb-2.5 text-sm font-semibold text-slate-800">Brush size</p>
66:         <div className="flex gap-2.5">
67:           {BRUSH_SIZES.map((s) => (
68:             <button
69:               key={s}
70:               onClick={() => setSize(s)}
71:               aria-label={`Brush size ${s}`}
72:               className={`flex h-12 w-12 items-center justify-center rounded-full border bg-white transition-all hover:scale-105 ${
73:                 size === s
74:                   ? "border-violet-500 ring-2 ring-violet-200"
75:                   : "border-slate-200"
76:               }`}
77:             >
78:               <span
79:                 className="rounded-full bg-slate-900"
80:                 style={{ width: s + 3, height: s + 3 }}
81:               />
82:             </button>
83:           ))}
84:         </div>
85:       </div>
86: 
87:       <div>
88:         <p className="mb-2.5 text-sm font-semibold text-slate-800">Tools</p>
89:         <div className="flex flex-col gap-2">
90:           <ToolButton
91:             active={tool === "draw"}
92:             onClick={() => setTool("draw")}
93:             icon="✍️"
94:             label="Draw"
95:           />
96:           <ToolButton
97:             active={tool === "text"}
98:             onClick={() => setTool("text")}
99:             icon="🔤"
100:             label="Add Text"
101:           />
102:           <ToolButton
103:             active={tool === "eraser"}
104:             onClick={() => setTool("eraser")}
105:             icon="🧽"
106:             label="Eraser"
107:           />
108:           <button
109:             onClick={onUndo}
110:             disabled={!canUndo}
111:             className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
112:           >
113:             <span className="flex items-center gap-2.5">
114:               <span aria-hidden>↩️</span> Undo
115:             </span>
116:             <kbd className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
117:               Ctrl + Z
118:             </kbd>
119:           </button>
120:         </div>
121:       </div>
122: 
123:       {tool === "text" && (
124:         <div
125:           className="rounded-2xl border border-slate-150 bg-slate-50/50 p-4 shadow-xs"
126:           onMouseDown={(e) => e.preventDefault()}
127:           onTouchStart={(e) => e.preventDefault()}
128:         >
129:           <div className="flex items-center justify-between mb-2">
130:             <p className="text-sm font-semibold text-slate-800">Text rotation</p>
131:             <span className="font-mono text-xs font-bold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded">
132:               {textRotation}°
133:             </span>
134:           </div>
135:           <div className="flex items-center gap-3">
136:             <input
137:               type="range"
138:               min="-90"
139:               max="90"
140:               value={textRotation}
141:               onChange={(e) => setTextRotation(Number(e.target.value))}
142:               className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-violet-600 focus:outline-none"
143:             />
144:             <button
145:               onClick={() => setTextRotation(0)}
146:               className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 shadow-xs"
147:             >
148:               Reset
149:             </button>
150:           </div>
151:           <div className="mt-3 flex flex-wrap gap-1.5">
152:             {[-45, -15, 0, 15, 45].map((angle) => (
153:               <button
154:                 key={angle}
155:                 onClick={() => setTextRotation(angle)}
156:                 className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
157:                   textRotation === angle
158:                     ? "bg-violet-600 text-white shadow-sm"
159:                     : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
160:                 }`}
161:               >
162:                 {angle > 0 ? `+${angle}°` : `${angle}°`}
163:               </button>
164:             ))}
165:           </div>
166:         </div>
167:       )}

      <div className="rounded-2xl bg-violet-50 p-3.5 text-sm text-violet-900">
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
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "border-violet-500 bg-violet-50 text-violet-700 ring-2 ring-violet-100"
          : "border-slate-200 bg-white text-slate-700 hover:border-violet-300"
      }`}
    >
      <span aria-hidden>{icon}</span> {label}
    </button>
  );
}
