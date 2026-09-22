"use client";

import Link from "next/link";
import { FolderOpen, Layers3, Lock, Mail, Plus, ShieldCheck } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-500">
      <div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8 lg:px-12">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-sm font-black text-white">
                Z
              </div>
              <span className="text-lg font-bold tracking-[-0.03em] text-slate-900">Zyvoriq</span>
            </div>
            <p className="mt-3 max-w-md text-sm leading-6">
              A project-based creative workspace for building, reviewing, and publishing AI-assisted media.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Workspace</h4>
            <div className="mt-3 grid gap-2 text-sm">
              <Link href="/create" className="inline-flex items-center gap-2 hover:text-violet-600"><Plus className="h-4 w-4" />Create</Link>
              <Link href="/my-reels" className="inline-flex items-center gap-2 hover:text-violet-600"><FolderOpen className="h-4 w-4" />Projects</Link>
              <Link href="/assets" className="inline-flex items-center gap-2 hover:text-violet-600"><Layers3 className="h-4 w-4" />Assets</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Trust & legal</h4>
            <div className="mt-3 grid gap-2 text-sm">
              <Link href="/privacy" className="inline-flex items-center gap-2 hover:text-violet-600"><Lock className="h-4 w-4" />Privacy</Link>
              <Link href="/terms" className="inline-flex items-center gap-2 hover:text-violet-600"><ShieldCheck className="h-4 w-4" />Terms</Link>
              <Link href="/dmca" className="hover:text-violet-600">Copyright / DMCA</Link>
              <Link href="/contact" className="inline-flex items-center gap-2 hover:text-violet-600"><Mail className="h-4 w-4" />Support</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Zyvoriq. All rights reserved.</span>
          <span>AI-generated content should be reviewed before publishing.</span>
        </div>
      </div>
    </footer>
  );
}
