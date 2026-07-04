"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ShirtBoard from "@/components/canvas/ShirtBoardLazy";
import Toolbar from "@/components/Toolbar";
import CopyLinkButton from "@/components/CopyLinkButton";
import Logo from "@/components/Logo";
import Spinner from "@/components/Spinner";
import { toast } from "@/components/toast/Toaster";
import { INK_COLORS, BRUSH_SIZES, type Mark, type Tool } from "@/lib/types";
import type { StampId } from "@/lib/stamps";

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
  const MAX_SIGNS_PER_USER = 2;
  const storageKey = `signout_sigs_${username}`;

  const [savedMarks, setSavedMarks] = useState<Mark[]>(initialMarks);
  const [currentMarks, setCurrentMarks] = useState<Mark[]>([]);
  const [count, setCount] = useState(initialCount);
  const [color, setColor] = useState<string>(INK_COLORS[0]);
  const [size, setSize] = useState<number>(BRUSH_SIZES[1]);
  const [tool, setTool] = useState<Tool>("draw");
  const [stamp, setStamp] = useState<StampId>("heart");
  const [textRotation, setTextRotation] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [mySignCount, setMySignCount] = useState(0);
  const stageRef = useRef<import("konva").default.Stage | null>(null);

  // Read this user's signature count from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setMySignCount(parseInt(stored, 10) || 0);
    } catch { /* localStorage unavailable */ }
  }, [storageKey]);

  const reachedLimit = mySignCount >= MAX_SIGNS_PER_USER;
  const remainingSigns = MAX_SIGNS_PER_USER - mySignCount;

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
    if (currentMarks.length === 0 || saving || reachedLimit) return;
    setSaving(true);
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
      const newSignCount = mySignCount + 1;
      setMySignCount(newSignCount);
      try { localStorage.setItem(storageKey, String(newSignCount)); } catch { /* noop */ }
      toast.success(
        "Your mark is on the shirt! 🎉",
        `It's now part of ${displayName}'s memories — forever.`
      );
    } catch (err) {
      toast.error(
        "Couldn't save your signature",
        err instanceof Error ? err.message : "Please try again in a moment."
      );
    } finally {
      setSaving(false);
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-3">
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

      <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-4 pb-28 sm:px-6 sm:py-6 lg:pb-6">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[260px_minmax(0,1fr)_290px]">
          {/* Left sidebar */}
          <aside className="order-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:order-1 lg:flex lg:flex-col">
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
              <div className="rounded-3xl bg-violet-50 p-5 sm:col-span-2 lg:col-span-1">
                <p className="text-sm font-semibold text-violet-900">
                  💜 This is your space
                </p>
                <p className="mt-1 text-sm text-violet-800/80">
                  Share your link with friends and let them leave their mark! 😊
                </p>
                <button
                  onClick={() => {
                    const stage = stageRef.current;
                    if (!stage) return;
                    const uri = stage.toDataURL({ pixelRatio: 2 });
                    const link = document.createElement("a");
                    link.download = `${username}-signout-shirt.png`;
                    link.href = uri;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-600/20 transition-all hover:bg-violet-700 active:scale-[0.98]"
                >
                  ⬇️ Download Shirt
                </button>
              </div>
            ) : (
              <div></div>
            )}
          </aside>

          {/* Shirt */}
          <section className="order-1 lg:order-2">
            <div className="mb-2 flex items-center justify-center gap-2 px-2 text-center text-slate-600 sm:mb-3">
              <p className="text-xs font-medium sm:text-sm">
                <span className="font-semibold text-slate-800">Add your signature</span>{" "}
                ✍️ — draw or type anywhere on the shirt!
              </p>
            </div>
            <div className="-mx-3 bg-linear-to-b from-white to-slate-100/60 p-1 shadow-[0_20px_60px_-20px_rgba(80,70,180,0.25)] sm:mx-0 sm:rounded-4xl sm:p-6">
              <ShirtBoard
                savedMarks={savedMarks}
                currentMarks={currentMarks}
                setCurrentMarks={setCurrentMarks}
                tool={tool}
                color={color}
                size={size}
                stamp={stamp}
                textRotation={textRotation}
                setTextRotation={setTextRotation}
                onStageRef={(node) => { stageRef.current = node; }}
              />
            </div>
            <div className="mt-4 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-100/80 px-4 py-2 text-sm font-semibold text-violet-800">
                {count} signature{count === 1 ? "" : "s"} so far
              </span>
            </div>
          </section>

          {/* Tools */}
          <aside className="order-2 flex flex-col gap-4 lg:order-3">
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
                stamp={stamp}
                setStamp={setStamp}
                textRotation={textRotation}
                setTextRotation={setTextRotation}
              />
              <div className="hidden lg:block">
                {reachedLimit ? (
                  <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-center">
                    <p className="text-sm font-semibold text-amber-800">You’ve used your 2 signatures ✨</p>
                    <p className="mt-0.5 text-xs text-amber-600">Thanks for leaving your mark!</p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={save}
                      disabled={currentMarks.length === 0 || saving}
                      className="mt-5 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {saving ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <Spinner className="text-base" /> Saving…
                        </span>
                      ) : (
                        "✓ Save Signature"
                      )}
                    </button>
                    <p className="mt-2.5 text-center text-xs text-slate-400">
                      {remainingSigns} signature{remainingSigns === 1 ? "" : "s"} remaining · 🔒 saved permanently
                    </p>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile action bar: Undo + Save always within thumb reach */}
      <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
        {reachedLimit ? (
          <div
            className="border-t border-amber-200 bg-amber-50/95 px-4 py-3 text-center backdrop-blur"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
          >
            <p className="text-sm font-semibold text-amber-800">You’ve used your 2 signatures ✨</p>
            <p className="mt-0.5 text-xs text-amber-600">Thanks for leaving your mark!</p>
          </div>
        ) : (
          <div
            className="flex items-center gap-3 border-t border-slate-200/80 bg-white/95 px-4 pt-3 backdrop-blur"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
          >
            <button
              onClick={undo}
              disabled={currentMarks.length === 0}
              aria-label="Undo"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg transition-colors active:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ↩️
            </button>
            <button
              onClick={save}
              disabled={currentMarks.length === 0 || saving}
              className="h-12 flex-1 rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Spinner className="text-base" /> Saving…
                </span>
              ) : (
                `✓ Save (${remainingSigns} left)`
              )}
            </button>
          </div>
        )}
      </div>

      <footer className="hidden px-4 py-6 text-center text-sm text-slate-400 lg:block">
        Made with 💜 by Dara and Rex for memories —{" "}
        <span className="font-hand text-base text-slate-500">
          “The best memories are the ones we create together.”
        </span>
      </footer>
    </div>
  );
}
