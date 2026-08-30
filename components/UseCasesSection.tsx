"use client";

import React from "react";
import { Camera, Store, Users, GraduationCap, ArrowUpRight } from "lucide-react";

const USE_CASES = [
  { icon: Camera, label: "Creators", title: "Turn ideas into a repeatable Reel engine", body: "Go from rough thought to hook, script, scene plan, voice direction, captions, cover and multiple cuts without losing your personal style.", examples: ["Personal brand", "Education", "Lifestyle", "Storytelling"] },
  { icon: Store, label: "Brands", title: "Make social creative that feels native", body: "Convert product launches, offers and customer stories into short-form concepts designed for feeds—not resized ads with AI copy pasted on top.", examples: ["Product demos", "UGC concepts", "Campaign variants", "Launch teasers"] },
  { icon: Users, label: "Social teams", title: "Create more without flattening the brand", body: "Give teams a shared creative system for ideation, adaptation, approvals and reusable brand context across recurring social content.", examples: ["Content calendars", "A/B hooks", "Approvals", "Repurposing"] },
  { icon: GraduationCap, label: "Experts", title: "Turn knowledge into watchable short-form", body: "Transform expertise, lessons, FAQs and long-form material into concise visual stories that are easier to understand and easier to share.", examples: ["How-tos", "Explainers", "Myth vs fact", "Series"] },
];

export function UseCasesSection() {
  return (
    <section id="use-cases" className="border-y border-white/5 bg-white/[0.015]">
      <div className="mx-auto max-w-[1500px] px-6 py-20 md:px-10 lg:py-28">
        <div className="max-w-3xl">
          <div className="text-sm font-bold text-teal-300">BUILT FOR THE FEED</div>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">Different creators. One short-form workflow.</h2>
          <p className="mt-5 text-lg leading-8 text-slate-400">The output changes with the audience, channel and brand—not just the prompt.</p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {USE_CASES.map(({ icon: Icon, label, title, body, examples }) => (
            <div key={label} className="group rounded-[28px] border border-white/8 bg-[#0b0f15] p-6 sm:p-8 transition hover:border-white/15 hover:bg-[#0d1219]">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.055] text-teal-200"><Icon className="h-5 w-5" /></div>
                <ArrowUpRight className="h-5 w-5 text-slate-700 transition group-hover:text-slate-400" />
              </div>
              <div className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-pink-300">{label}</div>
              <h3 className="mt-2 max-w-xl text-2xl font-black tracking-[-0.025em] text-white">{title}</h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">{body}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {examples.map((example) => <span key={example} className="rounded-full bg-white/[0.045] px-3 py-1.5 text-xs font-medium text-slate-400">{example}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
