"use client";

import { useState } from "react";
import { toast } from "@/components/toast/Toaster";

export default function CopyLinkButton({
  username,
  variant = "solid",
}: {
  username: string;
  variant?: "solid" | "outline";
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const link = `${window.location.origin}/${username}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      toast.success("Link copied! 🔗", "Share it with friends so they can sign your shirt.");
    } catch {
      toast.error("Couldn't copy the link", `Copy it manually: ${link}`);
    }
  };

  const base =
    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-95";
  const styles =
    variant === "solid"
      ? "bg-violet-600 text-white shadow-md shadow-violet-600/25 hover:bg-violet-700"
      : "border border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:text-violet-700";

  return (
    <button onClick={copy} className={`${base} ${styles}`}>
      <span aria-hidden>{copied ? "✓" : ""}</span>
      {copied ? "Copied!" : "Copy Link"}
    </button>
  );
}
