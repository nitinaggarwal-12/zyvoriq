import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function LegalPageShell({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#F7F8FC] text-slate-900">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <div className="mt-6 grid gap-5 border-b border-slate-200 pb-7 md:grid-cols-[minmax(0,1fr)_220px] md:items-stretch">
          <div className="flex flex-col justify-end">
            <p className="text-sm font-semibold text-violet-600">{eyebrow}</p>
            <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em]">{title}</h1>
            <p className="mt-2 text-sm text-slate-500">Last updated: {updated}</p>
          </div>
          <div className="relative min-h-32 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <img src="/assets/stills/cosmic_nebula.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
          </div>
        </div>
        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-600">
          {children}
        </div>
      </div>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
