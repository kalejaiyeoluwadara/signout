"use client";

import dynamic from "next/dynamic";

const ShirtBoardLazy = dynamic(() => import("./ShirtBoard"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full animate-pulse rounded-3xl bg-slate-200/60"
      style={{ aspectRatio: "1000 / 1000" }}
    />
  ),
});

export default ShirtBoardLazy;
