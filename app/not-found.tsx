import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] bg-[#F7F8FC] px-6 py-20 text-slate-900">
      <div className="mx-auto max-w-xl text-center">
        <div className="text-sm font-semibold text-violet-600">404</div>
        <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em]">This page isn’t part of the current workspace</h1>
        <p className="mt-4 text-sm leading-6 text-slate-500">
          Some older Zyvoriq routes have been consolidated into the unified Studio, Projects, and Assets experience.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white">
            <Home className="h-4 w-4" /> Home
          </Link>
          <Link href="/swarm" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
            <ArrowLeft className="h-4 w-4" /> Open Studio
          </Link>
        </div>
      </div>
    </main>
  );
}
