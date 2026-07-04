"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";
import { toast } from "@/components/toast/Toaster";

const slugify = (v: string) =>
  v.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 20);

export default function CreateShirtForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onNameChange = (v: string) => {
    setDisplayName(v);
    if (!touched) setUsername(slugify(v));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (username.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/shirts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim(), username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      toast.success(
        "Your shirt is ready! 👕",
        "Copy your link and start collecting signatures."
      );
      router.push(`/${data.username}/dashboard`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      toast.error("Couldn't create your shirt", message);
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white p-7 shadow-xl shadow-violet-200/40"
    >
      <h2 className="text-lg font-bold text-slate-900">Create your shirt 👕</h2>
      <p className="mt-1 text-sm text-slate-500">
        Free forever. No account needed.
      </p>

      <label className="mt-5 block">
        <span className="text-sm font-medium text-slate-700">Display name</span>
        <input
          value={displayName}
          onChange={(e) => onNameChange(e.target.value)}
          required
          maxLength={50}
          placeholder="e.g. Akara"
          className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-base outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:text-sm"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-700">Username</span>
        <input
          value={username}
          onChange={(e) => {
            setTouched(true);
            setUsername(slugify(e.target.value));
          }}
          required
          minLength={3}
          maxLength={20}
          placeholder="e.g. akara"
          className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 font-mono text-base outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:text-sm"
        />
      </label>

      <div className="mt-3 rounded-xl bg-violet-50 px-4 py-2.5 text-sm">
        <span className="text-violet-600/70">Your shareable link: </span>
        <span className="font-mono font-semibold text-violet-800">
          signout.app/{username || "username"}
        </span>
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-700 active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Spinner className="text-base" /> Creating your shirt…
          </span>
        ) : (
          "Get my shirt →"
        )}
      </button>
    </form>
  );
}
