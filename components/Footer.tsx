"use client";

import React from "react";
import Link from "next/link";
import { Github, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#07090d] py-14 text-slate-400">
      <div className="mx-auto max-w-[1500px] px-6 md:px-10">
        <div className="grid gap-10 border-b border-white/5 pb-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-300 via-orange-200 to-teal-300 font-black text-slate-950">Z</div>
              <div>
                <div className="text-lg font-black tracking-[-0.03em]">Zyvoriq</div>
                <div className="text-xs text-slate-500">AI Reel Studio</div>
              </div>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-500">Create short-form social content from one idea: hooks, scripts, scenes, voice direction, captions, covers and platform-ready variants.</p>
          </div>

          <div>
            <div className="text-sm font-bold text-white">Create</div>
            <div className="mt-4 space-y-3 text-sm">
              <Link href="/studio" className="block hover:text-white">Reel Studio</Link>
              <a href="#multimodal" className="block hover:text-white">Workflow</a>
              <a href="#use-cases" className="block hover:text-white">Use cases</a>
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-white">Platform</div>
            <div className="mt-4 space-y-3 text-sm">
              <Link href="/veritas" className="block hover:text-white">Trust & review</Link>
              <Link href="/governance" className="block hover:text-white">Enterprise controls</Link>
              <a href="https://github.com/nitinaggarwal-12/zyvoriq" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white"><Github className="h-4 w-4" /> GitHub</a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div>© 2026 Zyvoriq. Short-form social creation, rethought.</div>
          <div className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Idea → Hook → Story → Reel → Variants</div>
        </div>
      </div>
    </footer>
  );
}
