"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slugify = (v: string) =>
    v.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 20);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = slugify(username);
    if (clean.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Check if the shirt exists before navigating
      const res = await fetch(`/api/shirts/${clean}/signatures`);
      if (!res.ok) {
        setError("No shirt found with that username.");
        setLoading(false);
        return;
      }
      router.push(`/${clean}/dashboard`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm"
    >
      <h3 className="text-sm font-bold text-slate-900">
        Already have a shirt? 👋
      </h3>
      <p className="mt-0.5 text-xs text-slate-500">
        Enter your username to view your dashboard.
      </p>

      <div className="mt-3 flex gap-2">
        <input
          value={username}
          onChange={(e) => {
            setUsername(slugify(e.target.value));
            setError(null);
          }}
          required
          minLength={3}
          maxLength={20}
          placeholder="your username"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 font-mono text-sm outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
        <button
          type="submit"
          disabled={loading || username.length < 3}
          className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <Spinner className="text-base" />
          ) : (
            "View my shirt →"
          )}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
      )}
    </form>
  );
}
