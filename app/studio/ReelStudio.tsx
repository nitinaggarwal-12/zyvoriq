"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, WandSparkles, Clapperboard, Captions, Mic2, Image as ImageIcon, Copy, Check, RotateCcw, Smartphone, Instagram, Youtube, ChevronDown } from "lucide-react";

const hooks = [
  "Most people get this wrong—and it costs them attention.",
  "If I had to start from zero today, I would do these 3 things first.",
  "The third mistake looks productive, but it quietly kills your results.",
];

function buildScript(topic: string) {
  const subject = topic.trim() || "your topic";
  return [
    `Hook: ${hooks[0]}`,
    `Beat 1: Name the common problem around ${subject} in one clear sentence.`,
    `Beat 2: Show the surprising insight or contrast with a concrete example.`,
    `Beat 3: Give the viewer one practical action they can try today.`,
    `Payoff: Reframe ${subject} in a memorable way.`,
    `CTA: Save this and send it to someone who needs it.`,
  ];
}

export function ReelStudio() {
  const [topic, setTopic] = useState("3 habits quietly killing your focus");
  const [tone, setTone] = useState("Confident & conversational");
  const [duration, setDuration] = useState("30 sec");
  const [platform, setPlatform] = useState("Instagram Reels");
  const [activeTab, setActiveTab] = useState("Script");
  const [copied, setCopied] = useState(false);

  const script = useMemo(() => buildScript(topic), [topic]);
  const scenes = [
    "0–2s · Tight talking-head opener with large on-screen hook",
    "2–8s · Fast cut to relatable distraction / phone / open tabs",
    "8–16s · Return to creator; reveal mistake #1 and #2 with punch-in cuts",
    "16–24s · Pattern interrupt; show mistake #3 with contrasting b-roll",
    "24–30s · Clean payoff + save/share CTA; hold final frame for readability",
  ];
  const captions = ["MOST PEOPLE GET THIS WRONG", "#1 CONSTANT CONTEXT SWITCHING", "#2 BUSY ≠ FOCUSED", "#3 THE PRODUCTIVE-LOOKING TRAP", "SAVE THIS FOR YOUR NEXT DEEP-WORK SESSION"];

  const copyText = async () => {
    const text = script.join("\n");
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#07090d]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white" aria-label="Back home"><ArrowLeft className="h-5 w-5" /></Link>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-300 via-orange-200 to-teal-300 font-black text-slate-950">Z</div>
              <div><div className="font-black tracking-[-0.02em] text-white">Reel Studio</div><div className="text-[11px] text-slate-600">Zyvoriq creative workspace</div></div>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs font-medium text-slate-500 sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Draft saved locally</div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-5 px-5 py-6 md:px-8 lg:grid-cols-[360px_1fr_360px]">
        <aside className="h-fit rounded-[26px] border border-white/8 bg-white/[0.025] p-5 lg:sticky lg:top-24">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-pink-300">Creative brief</div>
          <h1 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">What do you want to post?</h1>

          <label className="mt-6 block text-xs font-bold text-slate-500">IDEA OR TOPIC</label>
          <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={5} className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-slate-700 focus:border-pink-300/35" placeholder="e.g. 3 things nobody tells you about starting a business" />

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Field label="Tone" value={tone} onChange={setTone} options={["Confident & conversational", "Warm & relatable", "Fast & energetic", "Expert & credible", "Playful & witty"]} />
            <Field label="Length" value={duration} onChange={setDuration} options={["15 sec", "30 sec", "45 sec", "60 sec"]} />
            <Field label="Platform" value={platform} onChange={setPlatform} options={["Instagram Reels", "YouTube Shorts", "TikTok"]} />
          </div>

          <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-black text-slate-950 transition hover:scale-[1.01] active:scale-[0.99]">
            <Sparkles className="h-4 w-4" /> Build reel plan
          </button>
          <p className="mt-3 text-center text-[11px] leading-5 text-slate-600">Adjust the creative direction first. Generation stays editable at every step.</p>
        </aside>

        <section className="min-w-0 rounded-[26px] border border-white/8 bg-[#0a0d12]">
          <div className="flex flex-wrap items-center gap-1 border-b border-white/5 p-3">
            {["Script", "Scenes", "Captions", "Cover"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${activeTab === tab ? "bg-white text-slate-950" : "text-slate-500 hover:bg-white/5 hover:text-white"}`}>{tab}</button>
            ))}
          </div>

          <div className="p-5 sm:p-8">
            {activeTab === "Script" && <ScriptPanel script={script} copied={copied} onCopy={copyText} />}
            {activeTab === "Scenes" && <ListPanel icon={Clapperboard} eyebrow="SHOT PLAN" title="A vertical story, beat by beat" items={scenes} />}
            {activeTab === "Captions" && <ListPanel icon={Captions} eyebrow="ON-SCREEN TEXT" title="Readable without sound" items={captions} />}
            {activeTab === "Cover" && <CoverPanel topic={topic} />}
          </div>
        </section>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="rounded-[30px] border border-white/8 bg-[#0a0d12] p-3">
            <div className="relative aspect-[9/16] overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_70%_20%,rgba(244,114,182,0.32),transparent_28%),radial-gradient(circle_at_30%_75%,rgba(45,212,191,0.22),transparent_28%),linear-gradient(160deg,#19111d,#0b1016_58%,#0a1515)]">
              <div className="absolute inset-x-5 top-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/50"><span>Preview</span><span>{duration}</span></div>
              <div className="absolute inset-x-5 top-[26%] text-center">
                <div className="text-3xl font-black leading-none tracking-[-0.05em] text-white">{topic || "Your Reel hook"}</div>
                <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-pink-300" />
              </div>
              <div className="absolute inset-x-5 bottom-20 rounded-2xl bg-black/35 p-4 backdrop-blur-md"><div className="text-sm font-bold text-white">The third one looks productive—but isn’t.</div><div className="mt-2 text-[10px] text-white/50">Caption safe zone</div></div>
              <div className="absolute inset-x-5 bottom-5 flex items-center justify-between text-[10px] text-white/40"><span>@yourhandle</span><span>9:16</span></div>
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-white/8 bg-white/[0.025] p-5">
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-600">Output</div>
            <div className="mt-4 space-y-3 text-sm">
              <Status icon={Instagram} label="Instagram Reel" value="9:16" />
              <Status icon={Captions} label="Captions" value="Prepared" />
              <Status icon={Mic2} label="Voice direction" value={tone.split(" ")[0]} />
              <Status icon={Youtube} label="Shorts variant" value="Ready to adapt" />
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return <label className="block"><span className="text-xs font-bold text-slate-500">{label.toUpperCase()}</span><div className="relative mt-2"><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none rounded-xl border border-white/8 bg-black/20 px-3 py-3 pr-9 text-sm text-slate-200 outline-none focus:border-pink-300/30">{options.map((o) => <option key={o}>{o}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-600" /></div></label>;
}

function ScriptPanel({ script, copied, onCopy }: { script: string[]; copied: boolean; onCopy: () => void }) {
  return <div><div className="flex items-start justify-between gap-4"><div><div className="text-xs font-bold uppercase tracking-[0.16em] text-pink-300">REEL SCRIPT</div><h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-white">Retention-first, not paragraph-first.</h2></div><button onClick={onCopy} className="flex shrink-0 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-400 hover:text-white">{copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}{copied ? "Copied" : "Copy"}</button></div><div className="mt-8 space-y-3">{script.map((line, i) => <div key={i} className="rounded-2xl border border-white/7 bg-white/[0.025] p-4 text-sm leading-7 text-slate-300"><span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.05] text-[10px] font-black text-slate-500">{i + 1}</span>{line}</div>)}</div></div>;
}

function ListPanel({ icon: Icon, eyebrow, title, items }: { icon: any; eyebrow: string; title: string; items: string[] }) {
  return <div><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] text-pink-200"><Icon className="h-5 w-5" /></div><div className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-pink-300">{eyebrow}</div><h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-white">{title}</h2><div className="mt-8 space-y-3">{items.map((item, i) => <div key={item} className="flex gap-4 rounded-2xl border border-white/7 bg-white/[0.025] p-4"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-xs font-black text-slate-500">{i + 1}</div><div className="text-sm leading-7 text-slate-300">{item}</div></div>)}</div></div>;
}

function CoverPanel({ topic }: { topic: string }) {
  return <div><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] text-pink-200"><ImageIcon className="h-5 w-5" /></div><div className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-pink-300">COVER FRAME</div><h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-white">Make the grid earn the tap.</h2><div className="mt-8 grid gap-4 md:grid-cols-3">{["3 HABITS KILLING YOUR FOCUS", "YOU'RE NOT LAZY. YOU'RE DISTRACTED.", "STOP DOING #3"].map((title, i) => <div key={title} className="aspect-[4/5] rounded-[22px] border border-white/8 bg-[radial-gradient(circle_at_70%_20%,rgba(244,114,182,0.24),transparent_25%),linear-gradient(150deg,#17111b,#0b1015)] p-5"><div className="text-xs font-bold text-slate-500">OPTION {i + 1}</div><div className="mt-20 text-xl font-black leading-tight tracking-[-0.035em] text-white">{title}</div></div>)}</div></div>;
}

function Status({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-slate-400"><Icon className="h-4 w-4" /><span>{label}</span></div><span className="text-xs font-semibold text-slate-600">{value}</span></div>;
}
