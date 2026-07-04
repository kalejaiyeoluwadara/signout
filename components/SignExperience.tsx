"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ShirtBoard from "@/components/canvas/ShirtBoardLazy";
import Toolbar from "@/components/Toolbar";
import CopyLinkButton from "@/components/CopyLinkButton";
import Logo from "@/components/Logo";
import { INK_COLORS, BRUSH_SIZES, type Mark, type Tool } from "@/lib/types";

type Props = {
  mode: "owner" | "visitor";
  username: string;
  displayName: string;
  createdAt: string;
  initialMarks: Mark[];
  initialCount: number;
};

export default function SignExperience({
  mode,
  username,
  displayName,
  createdAt,
  initialMarks,
  initialCount,
}: Props) {
  const [savedMarks, setSavedMarks] = useState<Mark[]>(initialMarks);
  const [currentMarks, setCurrentMarks] = useState<Mark[]>([]);
  const [count, setCount] = useState(initialCount);
  const [color, setColor] = useState<string>(INK_COLORS[0]);
  const [size, setSize] = useState<number>(BRUSH_SIZES[1]);
  const [tool, setTool] = useState<Tool>("draw");
  const [textRotation, setTextRotation] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const undo = useCallback(() => {
    setCurrentMarks((prev) => prev.slice(0, -1));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo]);

  const save = async () => {
    if (currentMarks.length === 0 || saving) return;
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/shirts/${username}/signatures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strokes: currentMarks.filter((m) => m.kind === "stroke").map((m) => m.stroke),
          texts: currentMarks.filter((m) => m.kind === "text").map((m) => m.item),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save your signature.");
      setSavedMarks((prev) => [...prev, ...currentMarks]);
      setCurrentMarks([]);
      setCount(data.count ?? count + 1);
      setNotice({ kind: "ok", text: "Your mark is on the shirt — forever! 🎉" });
    } catch (err) {
      setNotice({
        kind: "err",
        text: err instanceof Error ? err.message : "Could not save your signature.",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const sinceLabel = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-4">
            <Link
              href="/#how-it-works"
              className="hidden text-sm font-medium text-slate-600 hover:text-violet-700 sm:block"
            >
              How it works
            </Link>
            <CopyLinkButton username={username} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_290px]">
          {/* Left sidebar */}
          <aside className="order-2 flex flex-col gap-4 lg:order-1">
            <div className="rounded-3xl border border-slate-200/70 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-2xl font-bold text-violet-700">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <h1 className="mt-3 text-xl font-bold text-slate-900">
                {displayName} <span aria-hidden>✨</span>
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">Class of {new Date(createdAt).getFullYear()}</p>
              {mode === "owner" && (
                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-left">
                  <p className="text-xs font-medium text-slate-500">Your unique link</p>
                  <p className="mt-1 truncate font-mono text-sm font-semibold text-violet-700">
                    signout.app/{username}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
              <p className="text-4xl font-extrabold text-violet-700">{count}</p>
              <p className="text-sm font-medium text-slate-600">
                Signature{count === 1 ? "" : "s"}
              </p>
              <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-400">
                Since {sinceLabel}
              </p>
            </div>

            {mode === "owner" ? (
              <div className="rounded-3xl bg-violet-50 p-5">
                <p className="text-sm font-semibold text-violet-900">
                  💜 This is your space
                </p>
                <p className="mt-1 text-sm text-violet-800/80">
                  Share your link with friends and let them leave their mark! 😊
                </p>
              </div>
            ) : (
              <div className="rounded-3xl bg-violet-50 p-5">
                <p className="text-sm font-semibold text-violet-900">
                  ✍️ Leave your mark
                </p>
                <p className="mt-1 text-sm text-violet-800/80">
                  Drop your messages, doodles and good vibes for {displayName}!
                </p>
              </div>
            )}
          </aside>

          {/* Shirt */}
          <section className="order-1 lg:order-2">
            <div className="mb-3 flex items-center justify-center gap-2 text-slate-600">
              <p className="text-sm font-medium">
                <span className="font-semibold text-slate-800">Add your signature</span>{" "}
                ✍️ — draw or type anywhere on the shirt!
              </p>
            </div>
            <div className="rounded-4xl bg-linear-to-b from-white to-slate-100/60 p-3 shadow-[0_20px_60px_-20px_rgba(80,70,180,0.25)] sm:p-6">
              <ShirtBoard
                savedMarks={savedMarks}
                currentMarks={currentMarks}
                setCurrentMarks={setCurrentMarks}
                tool={tool}
                color={color}
                size={size}
                textRotation={textRotation}
                setTextRotation={setTextRotation}
              />
            </div>
            <div className="mt-4 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-100/80 px-4 py-2 text-sm font-semibold text-violet-800">
                👥 {count} signature{count === 1 ? "" : "s"} so far
              </span>
            </div>
          </section>

          {/* Tools */}
          <aside className="order-3 flex flex-col gap-4">
            <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm lg:sticky lg:top-20">
              <Toolbar
                color={color}
                setColor={setColor}
                size={size}
                setSize={setSize}
                tool={tool}
                setTool={setTool}
                onUndo={undo}
                canUndo={currentMarks.length > 0}
                textRotation={textRotation}
                setTextRotation={setTextRotation}
              />
              <button
                onClick={save}
                disabled={currentMarks.length === 0 || saving}
                className="mt-5 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? "Saving…" : "✓ Save Signature"}
              </button>
              <p className="mt-2.5 text-center text-xs text-slate-400">
                🔒 Your signature will be added to the shirt permanently.
              </p>
              {notice && (
                <p
                  className={`mt-2 text-center text-xs font-medium ${
                    notice.kind === "ok" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {notice.text}
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-slate-400">
        Made with 💜 by Dara and Rex for memories —{" "}
        <span className="font-hand text-base text-slate-500">
          “The best memories are the ones we create together.”
        </span>
      </footer>
    </div>
  );
}
