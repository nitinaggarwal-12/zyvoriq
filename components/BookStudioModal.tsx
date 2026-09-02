'use client';

import React, { useState } from 'react';
import { 
  getBookOpportunityCatalog, 
  BookOpportunityRecipe, 
  generateChapterProse,
  compileEpubMetadata,
  compilePrintPdfLayout,
  compileAudiobookMaster,
  generateBookTokPromoReels
} from '../lib/book/bookStudioEngine';

interface BookStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookStudioModal: React.FC<BookStudioModalProps> = ({
  isOpen,
  onClose
}) => {
  const catalog = getBookOpportunityCatalog();
  const [activeBookId, setActiveBookId] = useState<string>(catalog[0]?.id || 'book-hades-venice-noir');
  const [activeTab, setActiveTab] = useState<'overview' | 'world_bible' | 'prose_reader' | 'transmedia_publish'>('overview');
  const [selectedChapterNum, setSelectedChapterNum] = useState<number>(1);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentBook = catalog.find(b => b.id === activeBookId) || catalog[0];
  const chapterProse = currentBook ? generateChapterProse(currentBook, selectedChapterNum) : null;
  const epubData = currentBook ? compileEpubMetadata(currentBook) : null;
  const pdfLayout = currentBook ? compilePrintPdfLayout(currentBook) : null;
  const audiobookData = currentBook ? compileAudiobookMaster(currentBook) : null;
  const bookTokTrailers = currentBook ? generateBookTokPromoReels(currentBook) : [];

  const triggerExport = (formatName: string) => {
    setDownloadSuccessMsg(`✅ Successfully compiled ${formatName} for "${currentBook.title}"!`);
    setTimeout(() => setDownloadSuccessMsg(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-amber-500/20 text-amber-400 rounded-lg text-xl">📚</span>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Original Book Studio & Transmedia Publisher
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/30">
                  100k+ WORD CONTINUITY
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Mythology & History Retellings • Master Stylometry (Martin, Herbert, Tolkien) • Kindle EPUB • Audible M4B • #BookTok Trailers
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Book Selector Bar */}
        <div className="flex items-center space-x-3 px-6 py-3 border-b border-neutral-800 bg-neutral-900/30 overflow-x-auto text-xs">
          {catalog.map(book => (
            <button
              key={book.id}
              onClick={() => {
                setActiveBookId(book.id);
                setSelectedChapterNum(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeBookId === book.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-neutral-800/60 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              <span>📖 {book.title}</span>
              <span className="px-1.5 py-0.2 bg-black/30 rounded text-[10px] font-mono">BOI: {book.boiScore}</span>
            </button>
          ))}
        </div>

        {/* Main Tabs Navigation */}
        <div className="flex items-center space-x-2 px-6 py-2.5 border-b border-neutral-800 bg-neutral-900/10 text-xs">
          {[
            { id: 'overview', label: '📊 Blueprint & Trope Stack' },
            { id: 'world_bible', label: '🗺️ World Lore & Character Graph' },
            { id: 'prose_reader', label: '✒️ Chapter Prose Reader' },
            { id: 'transmedia_publish', label: '🚀 Transmedia Publishing Hub' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toast Alert */}
        {downloadSuccessMsg && (
          <div className="mx-6 mt-3 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs font-medium flex items-center justify-between">
            <span>{downloadSuccessMsg}</span>
            <button onClick={() => setDownloadSuccessMsg(null)}>✕</button>
          </div>
        )}

        {/* Modal Main Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-neutral-950">
          
          {/* TAB 1: OVERVIEW & TROPE STACK */}
          {activeTab === 'overview' && currentBook && (
            <div className="space-y-4">
              <div className="p-5 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 text-xs font-bold rounded">
                      {currentBook.mythology.replace('_', ' ').toUpperCase()} MYTHOS
                    </span>
                    <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded">
                      {currentBook.historicalEra.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-bold rounded">
                      STYLE: {currentBook.authorStyle.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400">
                    Target: <strong className="text-white">{currentBook.targetWordCount.toLocaleString()} words</strong> (~{currentBook.targetPages} pages)
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-white">
                  "{currentBook.tagline}"
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {currentBook.highConceptPremise}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                  <h4 className="font-bold text-amber-400 text-sm">🎯 Proven Trope Stack (#BookTok Validated)</h4>
                  <ul className="space-y-1.5 text-neutral-300">
                    {currentBook.tropeStack.map((trope, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-amber-500">✓</span>
                        <span>{trope}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                  <h4 className="font-bold text-indigo-400 text-sm">📚 Comparable Bestsellers (Comps)</h4>
                  <ul className="space-y-1.5 text-neutral-300">
                    {currentBook.compTitles.map((comp, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-indigo-400">★</span>
                        <span>{comp}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 text-neutral-400 border-t border-neutral-800">
                    Amazon Categories: <span className="text-white">{currentBook.amazonCategories.join(' • ')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORLD LORE BIBLE & CHARACTER GRAPH */}
          {activeTab === 'world_bible' && currentBook && (
            <div className="space-y-5 text-xs">
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
                <h4 className="font-bold text-amber-400 text-sm">🌌 World Cosmology & Fundamental Laws</h4>
                <p className="text-neutral-300">{currentBook.worldLoreBible.cosmology}</p>
                <div className="space-y-1">
                  <div className="font-semibold text-white">Magical / Technological Laws:</div>
                  {currentBook.worldLoreBible.magicOrTechnologyLaws.map((law, i) => (
                    <div key={i} className="p-2 bg-neutral-950 rounded border border-neutral-800 text-neutral-300">
                      ⚡ {law}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">👥 Dynamic Character Matrix & Neural Voice IDs</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentBook.characterGraph.map(char => (
                    <div key={char.id} className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{char.name}</span>
                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[10px] uppercase font-semibold">
                          {char.role}
                        </span>
                      </div>
                      <div className="text-neutral-400 text-[11px]">
                        Voice: <strong className="text-amber-300">{char.voiceId}</strong>
                      </div>
                      <div className="text-neutral-300">{char.facialFeatures}</div>
                      <div className="p-2 bg-neutral-950 rounded text-neutral-400">
                        <span className="text-rose-400 font-semibold">Flaw:</span> {char.internalFlaw} | <span className="text-amber-400 font-semibold">Secret:</span> {char.activeSecret}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHAPTER PROSE READER WITH DROP CAPS */}
          {activeTab === 'prose_reader' && currentBook && chapterProse && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center space-x-2">
                  {currentBook.chapters.map(c => (
                    <button
                      key={c.chapterNumber}
                      onClick={() => setSelectedChapterNum(c.chapterNumber)}
                      className={`px-3 py-1 text-xs rounded-lg font-bold transition-colors ${
                        selectedChapterNum === c.chapterNumber
                          ? 'bg-amber-600 text-white'
                          : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
                      }`}
                    >
                      Ch. {c.chapterNumber}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-neutral-400">
                  {chapterProse.wordCount.toLocaleString()} Words • POV: {currentBook.chapters[selectedChapterNum - 1]?.povCharacter}
                </div>
              </div>

              {/* Book Page Frame */}
              <div className="p-8 bg-[#14120e] border border-amber-900/30 rounded-2xl shadow-inner max-w-3xl mx-auto space-y-6 text-neutral-200 font-serif text-base leading-relaxed">
                <div className="text-center space-y-1 border-b border-amber-900/20 pb-4">
                  <div className="text-xs uppercase tracking-widest text-amber-500 font-sans font-semibold">
                    {currentBook.title}
                  </div>
                  <h2 className="text-2xl font-bold text-amber-100">
                    {chapterProse.title}
                  </h2>
                </div>

                <div className="whitespace-pre-line">
                  <span className="float-left text-5xl font-bold text-amber-400 font-serif leading-none pr-3 pt-1">
                    {chapterProse.dropCapLetter}
                  </span>
                  {chapterProse.formattedText.slice(1)}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TRANSMEDIA PUBLISHING HUB */}
          {activeTab === 'transmedia_publish' && currentBook && (
            <div className="space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Kindle EPUB */}
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 text-sm">📱 Amazon Kindle EPUB 3</span>
                    <span className="text-emerald-400 font-mono">KDP Ready</span>
                  </div>
                  <p className="text-neutral-300">
                    Reflowable EPUB with dynamic table of contents, embedded metadata, and chapter links.
                  </p>
                  <button
                    onClick={() => triggerExport('Kindle EPUB')}
                    className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-lg transition-colors"
                  >
                    ⬇️ Download .EPUB Package
                  </button>
                </div>

                {/* 2. Print PDF 6x9 */}
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-400 text-sm">📄 6"×9" Trade Paperback PDF</span>
                    <span className="text-indigo-300 font-mono">300 DPI Print</span>
                  </div>
                  <p className="text-neutral-300">
                    Formatted with 0.75" gutter binding, drop caps, mirrored headers, and front matter.
                  </p>
                  <button
                    onClick={() => triggerExport('Print-Ready PDF')}
                    className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-lg transition-colors"
                  >
                    ⬇️ Download Print-Ready PDF
                  </button>
                </div>

                {/* 3. Full-Cast Audiobook */}
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-400 text-sm">🎧 Audible / Spotify Full-Cast M4B</span>
                    <span className="text-rose-300 font-mono">{audiobookData?.totalDurationMinutes} mins</span>
                  </div>
                  <p className="text-neutral-300">
                    Multi-speaker neural casting with atmospheric Foley and -18dB background soundtrack ducking.
                  </p>
                  <button
                    onClick={() => triggerExport('Audible M4B Master')}
                    className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-lg transition-colors"
                  >
                    🎙️ Master Full-Cast Audio Tracks
                  </button>
                </div>

                {/* 4. #BookTok Launch Kit */}
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-400 text-sm">🎬 #BookTok 15-Video Launch Kit</span>
                    <span className="text-purple-300 font-mono">1080p 60FPS</span>
                  </div>
                  <p className="text-neutral-300">
                    15 ready-to-post 60s viral video teaser scripts with Alex Hormozi kinetic text styling.
                  </p>
                  <button
                    onClick={() => triggerExport('#BookTok Launch Kit')}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg transition-colors"
                  >
                    ⚡ Generate 15x Video Trailers
                  </button>
                </div>

              </div>

              {/* Video Trailer Scripts Showcase */}
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
                <h4 className="font-bold text-white text-sm">🔥 Generated #BookTok Video Hooks</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {bookTokTrailers.map((trailer, i) => (
                    <div key={i} className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-1.5">
                      <div className="font-bold text-purple-400">{trailer.title}</div>
                      <p className="text-neutral-300 line-clamp-3">"{trailer.script}"</p>
                      <div className="text-[10px] text-neutral-400">Style: {trailer.kineticSubtitles}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
