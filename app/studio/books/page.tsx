"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Sparkles,
  Scroll,
  Users,
  Feather,
  Headphones,
  Compass,
  Layers,
  ArrowRight,
  Download,
  Share2,
  CheckCircle2,
  Play,
  Volume2,
  Shield,
  Film,
  Zap,
  Globe,
  ChevronRight,
  Flame,
  Award
} from "lucide-react";
import {
  BOOK_OPPORTUNITY_CATALOG,
  BookOpportunityRecipe,
  generateChapterProse,
  compileEpubMetadata,
  compileAudiobookMaster,
  generateBookTokPromoReels
} from "@/lib/book/bookStudioEngine";
import { StudioSidebar } from "@/components/StudioSidebar";

export default function BookStudioPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-amber-400 font-mono text-sm">Loading Book Studio...</div>}>
      <BookStudioContent />
    </Suspense>
  );
}

function BookStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialBookId = searchParams?.get("bookId") || BOOK_OPPORTUNITY_CATALOG[0].id;
  
  const [selectedBook, setSelectedBook] = useState<BookOpportunityRecipe>(() => {
    return BOOK_OPPORTUNITY_CATALOG.find((b: BookOpportunityRecipe) => b.id === initialBookId) || BOOK_OPPORTUNITY_CATALOG[0];
  });
  
  const [activeTab, setActiveTab] = useState<"blueprint" | "lore" | "prose" | "transmedia">("prose");
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  const chapterProseData = generateChapterProse(selectedBook, selectedChapterIndex + 1);
  const bookTokPromos = generateBookTokPromoReels(selectedBook);
  const epubData = compileEpubMetadata(selectedBook);
  const audiobookData = compileAudiobookMaster(selectedBook);

  const handleSelectBook = (recipe: BookOpportunityRecipe) => {
    setSelectedBook(recipe);
    setSelectedChapterIndex(0);
  };

  const handleLaunchInStudio = () => {
    const brief = `${selectedBook.title} - ${selectedBook.tagline}`;
    router.push(`/studio?topic=${encodeURIComponent(brief)}`);
  };

  const handleDownloadFile = (content: string, filename: string, mimeType = "application/json") => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setCopiedAction(filename);
    setTimeout(() => setCopiedAction(null), 2500);
  };

  const handleCopy = (text: string, actionName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAction(actionName);
    setTimeout(() => setCopiedAction(null), 2000);
  };

  return (
    <StudioSidebar currentPath="/studio/books">
      <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 pb-24 md:pb-12">

      {/* Top Breadcrumbs & Stage Header */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="mx-auto w-full max-w-[1720px] px-6 sm:px-8 lg:px-12 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-600 p-[1px] shadow-lg shadow-amber-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-obsidian-950 text-amber-400">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold tracking-tight text-white font-mono">
                  Original Book & Transmedia Studio
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-400 font-mono">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  100K+ WORD CONTINUITY MACHINE
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Mythology & History Retellings · Stylometric Synthesis · Kindle EPUB 3 · Audible M4B Master · #BookTok Trailers
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLaunchInStudio}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-bold text-obsidian-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-500 transition-all active:scale-95"
            >
              <Zap className="w-4 h-4 text-obsidian-950 fill-current" />
              Launch Book Reel in Timeline
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 3-Column Zero-Gutter Workspace */}
      <main className="flex-1 mx-auto w-full max-w-[1720px] px-6 sm:px-8 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Book Library & Universe Configuration (3 cols) */}
          <section className="lg:col-span-3 space-y-6">
            
            {/* Book Selector Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  📚 Active Series Master
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  BOI Score: {selectedBook.boiScore}/100
                </span>
              </div>

              <div className="space-y-2">
                {BOOK_OPPORTUNITY_CATALOG.map((book: BookOpportunityRecipe) => (
                  <button
                    key={book.id}
                    onClick={() => handleSelectBook(book)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      selectedBook.id === book.id
                        ? "border-amber-500/50 bg-amber-500/10 text-white shadow-md shadow-amber-500/5"
                        : "border-slate-800/80 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-100 flex items-center justify-between">
                      <span>{book.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        {book.targetWordCount.toLocaleString()} wds
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-1">{book.tagline}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Universe DNA & Stylometry Matrix */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Feather className="w-4 h-4 text-amber-400" />
                Universe DNA & Stylometry
              </h3>

              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Mythological Pantheon</span>
                  <span className="font-semibold text-amber-300 capitalize">{selectedBook.mythology.replace(/_/g, " ")}</span>
                </div>

                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Historical Setting & Era</span>
                  <span className="font-semibold text-emerald-300 capitalize">{selectedBook.historicalEra.replace(/_/g, " ")}</span>
                </div>

                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Author Stylometric Engine</span>
                  <span className="font-semibold text-cyan-300 capitalize">{selectedBook.authorStyle.replace(/_/g, " ")}</span>
                </div>
              </div>
            </div>

            {/* Chapters Navigation */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Scroll className="w-4 h-4 text-amber-400" />
                Act & Chapter Matrix
              </h3>
              <div className="space-y-1.5">
                {selectedBook.chapters.map((ch, idx) => (
                  <button
                    key={ch.chapterNumber}
                    onClick={() => {
                      setSelectedChapterIndex(idx);
                      setActiveTab("prose");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                      selectedChapterIndex === idx && activeTab === "prose"
                        ? "bg-amber-500/20 text-amber-200 border border-amber-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <span>Ch. {ch.chapterNumber}: {ch.title}</span>
                    <span className="text-[10px] font-mono text-slate-500">{ch.wordCount} w</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* CENTER STAGE: Deep Prose Reader & World-Building Canvas (6 cols) */}
          <section className="lg:col-span-6 space-y-6">
            
            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
              <button
                onClick={() => setActiveTab("prose")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "prose"
                    ? "bg-amber-500 text-obsidian-950 shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Chapter Prose Reader
              </button>
              <button
                onClick={() => setActiveTab("lore")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "lore"
                    ? "bg-amber-500 text-obsidian-950 shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Compass className="w-4 h-4" />
                World Lore Bible & Cast
              </button>
              <button
                onClick={() => setActiveTab("blueprint")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "blueprint"
                    ? "bg-amber-500 text-obsidian-950 shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Layers className="w-4 h-4" />
                Trope Blueprint & Archetypes
              </button>
            </div>

            {/* Tab 1: Prose Reader */}
            {activeTab === "prose" && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-xl shadow-2xl space-y-6">
                
                {/* Chapter Metadata & Audio Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
                      {selectedBook.title}
                    </span>
                    <h2 className="text-2xl font-serif font-bold text-slate-100">
                      {chapterProseData.title}
                    </h2>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 font-mono">
                      <span>POV: {selectedBook.chapters[selectedChapterIndex]?.povCharacter}</span>
                      <span>•</span>
                      <span>{chapterProseData.wordCount.toLocaleString()} Words</span>
                    </div>
                  </div>

                  {/* Audio Narration Trigger */}
                  <button
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isPlayingAudio
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse"
                        : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <Headphones className="w-4 h-4" />
                    {isPlayingAudio ? "Audible Voice: Playing..." : "Audible Preview"}
                  </button>
                </div>

                {/* Prose Body with Drop Cap */}
                <div className="prose prose-invert max-w-none text-slate-300 font-serif leading-relaxed text-base space-y-4">
                  <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/20 shadow-inner whitespace-pre-line">
                    <p className="text-justify text-slate-200 leading-8 text-lg first-letter:float-left first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:text-amber-400 first-letter:mr-3 first-letter:leading-none">
                      {chapterProseData.formattedText}
                    </p>
                  </div>

                  {/* Scene Beats Breakdown */}
                  <div className="mt-8 pt-6 border-t border-slate-800 space-y-3 font-sans">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                      🎬 Scene Beats & Dramatic Pacing
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedBook.chapters[selectedChapterIndex]?.sceneBeats.map((beat: string, bIdx: number) => (
                        <div key={bIdx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                          <span className="font-mono font-bold text-amber-400">0{bIdx + 1}.</span>
                          <span>{beat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: World Lore Bible & Cast Graph */}
            {activeTab === "lore" && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-xl shadow-2xl space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-400" />
                  100k+ Word Lore Bible & Character Graph
                </h3>

                {/* Magic / Technology Laws */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                    ⚡ Fundamental Laws of Magic / Technology
                  </h4>
                  <div className="space-y-2">
                    {selectedBook.worldLoreBible.magicOrTechnologyLaws.map((law: string, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200">
                        {law}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Major Factions */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                    🏛️ Major Factions & Hidden Agendas
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedBook.worldLoreBible.majorFactions.map((f: { name: string; motivation: string; secretAgenda: string }, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
                        <div className="font-bold text-slate-100 text-sm">{f.name}</div>
                        <div className="text-slate-400"><strong className="text-slate-300">Motivation:</strong> {f.motivation}</div>
                        <div className="text-amber-400/90"><strong className="text-amber-300">Secret Agenda:</strong> {f.secretAgenda}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Character Graph */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                    👥 Dynamic Character Cast & Internal Flaws
                  </h4>
                  <div className="space-y-3">
                    {selectedBook.characterGraph.map((char) => (
                      <div key={char.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-100 text-sm">{char.name}</span>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 uppercase">{char.role}</span>
                        </div>
                        <div className="text-slate-400">{char.facialFeatures}</div>
                        <div className="text-rose-300"><strong className="text-rose-200">Flaw:</strong> {char.internalFlaw}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Trope Blueprint */}
            {activeTab === "blueprint" && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-xl shadow-2xl space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  Viral Trope Stacks & Market Validation
                </h3>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
                  <strong>Core Premise:</strong> {selectedBook.highConceptPremise}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    🏷️ Primary Trope Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBook.tropeStack.map((trope: string, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300">
                        #{trope}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* RIGHT COLUMN: Omni-Modal Transmedia Publishing Hub (3 cols) */}
          <section className="lg:col-span-3 space-y-6">
            
            {/* Transmedia Master Outputs Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Omni-Modal Transmedia Master
              </h3>

              <div className="space-y-3">
                {/* 1. Kindle EPUB 3 */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      Kindle EPUB 3 Package
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">Ready</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Valid OPF XML + Nav XHTML with dynamic metadata.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleDownloadFile(epubData.opfManifestXml, `${selectedBook.id}_epub_package.opf`, "application/oebps-package+xml")}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-obsidian-950 hover:opacity-95 text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {copiedAction === `${selectedBook.id}_epub_package.opf` ? "Downloaded!" : "Download .opf"}
                    </button>
                    <button
                      onClick={() => handleCopy(epubData.opfManifestXml, "epub")}
                      className="text-center py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all cursor-pointer"
                    >
                      {copiedAction === "epub" ? "✓ Copied XML" : "Copy XML"}
                    </button>
                  </div>
                </div>

                {/* 2. Audible Multi-Cast M4B Master */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                      <Headphones className="w-3.5 h-3.5 text-cyan-400" />
                      Audible Full-Cast M4B
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">-18dB Ducking</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{audiobookData.trackList.length} multi-cast character tracks synced to orchestral score.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleDownloadFile(JSON.stringify(audiobookData, null, 2), `${selectedBook.id}_audible_cue.json`, "application/json")}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-obsidian-950 hover:opacity-95 text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {copiedAction === `${selectedBook.id}_audible_cue.json` ? "Downloaded!" : "Download .json"}
                    </button>
                    <button
                      onClick={() => handleCopy(JSON.stringify(audiobookData, null, 2), "audible")}
                      className="text-center py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all cursor-pointer"
                    >
                      {copiedAction === "audible" ? "✓ Copied" : "Copy Tracklist"}
                    </button>
                  </div>
                </div>

                {/* 3. #BookTok 15-Video Launch Kit */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-rose-400" />
                      #BookTok 15-Video Kit
                    </span>
                    <span className="text-[10px] font-mono text-rose-400">15 Prompts</span>
                  </div>
                  <p className="text-[11px] text-slate-400">AI Veo storyboard prompts & high-hook viral scripts.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleDownloadFile(JSON.stringify(bookTokPromos, null, 2), `${selectedBook.id}_booktok_kit.json`, "application/json")}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-obsidian-950 hover:opacity-95 text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {copiedAction === `${selectedBook.id}_booktok_kit.json` ? "Downloaded!" : "Download .json"}
                    </button>
                    <button
                      onClick={() => handleCopy(JSON.stringify(bookTokPromos, null, 2), "booktok")}
                      className="text-center py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all cursor-pointer"
                    >
                      {copiedAction === "booktok" ? "✓ Copied" : "Copy Prompts"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Timeline Bridge */}
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-slate-900/60 to-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-3">
              <h4 className="font-bold text-xs text-amber-300 uppercase tracking-wider font-mono">
                🎬 Production Stage Bridge
              </h4>
              <p className="text-xs text-slate-400">
                Populate this book's hook, cinematic shots, and neural voiceover directly into the Master Studio Timeline.
              </p>
              <button
                onClick={handleLaunchInStudio}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-bold text-xs text-obsidian-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-500 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                Launch in Studio Timeline
              </button>
            </div>
          </section>

        </div>
      </main>
    </div>
    </StudioSidebar>
  );
}
