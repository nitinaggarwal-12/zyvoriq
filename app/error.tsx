"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[zyvoriq:error-boundary]", error);
  }, [error]);

  return (
    <main className="min-h-[70vh] bg-[#F7F8FC] px-6 py-20 text-slate-900">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Something interrupted this workspace</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Your project data is preserved where possible. Retry this screen, or return home and reopen the project from Projects.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
            <RotateCcw className="h-4 w-4" /> Retry
          </button>
          <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Home className="h-4 w-4" /> Home
          </Link>
        </div>
        {error.digest && <p className="mt-5 text-xs text-slate-400">Reference: {error.digest}</p>}
      </div>
    </main>
  );
}
