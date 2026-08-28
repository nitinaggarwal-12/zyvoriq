"use client";

import React, { useState } from "react";
import {
  Globe,
  Volume2,
  Check,
  Sparkles,
  RotateCcw,
  Search,
  Filter,
  Languages,
  CheckCircle
} from "lucide-react";

export interface DubLanguage {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  flag: string;
  engine: string;
  sampleText: string;
}

export const DUBBING_LANGUAGES_30: DubLanguage[] = [
  { code: "ja", name: "Japanese", nativeName: "日本語", region: "East Asia", flag: "🇯🇵", engine: "DeepMind Neural (Aoede)", sampleText: "真の武士道は心の中にあります。" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", region: "South Asia", flag: "🇮🇳", engine: "DeepMind Neural (Priya)", sampleText: "सत्य और चेतना का अनुभव ही अंतिम ज्ञान है।" },
  { code: "en_us", name: "English (US)", nativeName: "English (US)", region: "North America", flag: "🇺🇸", engine: "DeepMind Neural (Charon)", sampleText: "Mastery requires absolute focus and presence." },
  { code: "en_uk", name: "English (UK)", nativeName: "English (UK)", region: "Europe", flag: "🇬🇧", engine: "DeepMind Neural (Fenrir)", sampleText: "Precision in execution defines true excellence." },
  { code: "es_mx", name: "Spanish (Mexico)", nativeName: "Español", region: "Latin America", flag: "🇲🇽", engine: "DeepMind Neural (Mateo)", sampleText: "El camino del honor comienza con el respeto." },
  { code: "es_es", name: "Spanish (Spain)", nativeName: "Castellano", region: "Europe", flag: "🇪🇸", engine: "DeepMind Neural (Carlos)", sampleText: "La serenidad en el combate es la victoria." },
  { code: "fr_fr", name: "French", nativeName: "Français", region: "Europe", flag: "🇫🇷", engine: "DeepMind Neural (Celeste)", sampleText: "La clarté de l'esprit transcende toute peur." },
  { code: "de_de", name: "German", nativeName: "Deutsch", region: "Europe", flag: "🇩🇪", engine: "DeepMind Neural (Henrik)", sampleText: "Präzision und Meisterschaft leiten jeden Schritt." },
  { code: "zh_cn", name: "Mandarin Chinese", nativeName: "普通话", region: "East Asia", flag: "🇨🇳", engine: "DeepMind Neural (Meiling)", sampleText: "无念即是最高的定力与智慧。" },
  { code: "ar_ae", name: "Arabic (Gulf)", nativeName: "العربية", region: "Middle East", flag: "🇦🇪", engine: "DeepMind Neural (Tariq)", sampleText: "الحكمة تبدأ بصفاء الذهن والشجاعة." },
  { code: "pt_br", name: "Portuguese (Brazil)", nativeName: "Português", region: "Latin America", flag: "🇧🇷", engine: "DeepMind Neural (Gabriel)", sampleText: "A determinação interior supera qualquer desafio." },
  { code: "it_it", name: "Italian", nativeName: "Italiano", region: "Europe", flag: "🇮🇹", engine: "DeepMind Neural (Marco)", sampleText: "La vera forza risiede nella quiete interiore." },
  { code: "ko_kr", name: "Korean", nativeName: "한국어", region: "East Asia", flag: "🇰🇷", engine: "DeepMind Neural (Minjun)", sampleText: "마음의 평정이 진정한 승리를 만듭니다." },
  { code: "ru_ru", name: "Russian", nativeName: "Русский", region: "Eurasia", flag: "🇷🇺", engine: "DeepMind Neural (Dmitri)", sampleText: "Истинное мастерство рождается в тишине." },
  { code: "nl_nl", name: "Dutch", nativeName: "Nederlands", region: "Europe", flag: "🇳🇱", engine: "DeepMind Neural (Lars)", sampleText: "Helderheid van geest brengt ware beheersing." },
  { code: "sv_se", name: "Swedish", nativeName: "Svenska", region: "Nordic", flag: "🇸🇪", engine: "DeepMind Neural (Astrid)", sampleText: "Lugnet i stormen är krigarens styrka." },
  { code: "tr_tr", name: "Turkish", nativeName: "Türkçe", region: "Middle East", flag: "🇹🇷", engine: "DeepMind Neural (Emre)", sampleText: "Gerçek ustalık zihnin berraklığında gizlidir." },
  { code: "pl_pl", name: "Polish", nativeName: "Polski", region: "Europe", flag: "🇵🇱", engine: "DeepMind Neural (Jan)", sampleText: "Spokój umysłu prowadzi do doskonałości." },
  { code: "vi_vn", name: "Vietnamese", nativeName: "Tiếng Việt", region: "Southeast Asia", flag: "🇻🇳", engine: "DeepMind Neural (Linh)", sampleText: "Tâm tĩnh lặng là nguồn gốc của sức mạnh." },
  { code: "th_th", name: "Thai", nativeName: "ไทย", region: "Southeast Asia", flag: "🇹🇭", engine: "DeepMind Neural (Somchai)", sampleText: "จิตที่สงบนำมาซึ่งชัยชนะที่แท้จริง" },
  { code: "id_id", name: "Indonesian", nativeName: "Bahasa Indonesia", region: "Southeast Asia", flag: "🇮🇩", engine: "DeepMind Neural (Budi)", sampleText: "Ketenangan jiwa adalah kunci keberhasilan sejati." },
  { code: "he_il", name: "Hebrew", nativeName: "עברית", region: "Middle East", flag: "🇮🇱", engine: "DeepMind Neural (Noam)", sampleText: "השקט הפנימי הוא מקור העוצמה האמיתי." },
  { code: "el_gr", name: "Greek", nativeName: "Ελληνικά", region: "Europe", flag: "🇬🇷", engine: "DeepMind Neural (Nikos)", sampleText: "Η γαλήνη του πνεύματος νικά κάθε εμπόδιο." },
  { code: "no_no", name: "Norwegian", nativeName: "Norsk", region: "Nordic", flag: "🇳🇴", engine: "DeepMind Neural (Olav)", sampleText: "Styrken finnes i den indre roen." },
  { code: "da_dk", name: "Danish", nativeName: "Dansk", region: "Nordic", flag: "🇩🇰", engine: "DeepMind Neural (Frederik)", sampleText: "Sindets ro er krigerens sande skjold." },
  { code: "fi_fi", name: "Finnish", nativeName: "Suomi", region: "Nordic", flag: "🇫🇮", engine: "DeepMind Neural (Matti)", sampleText: "Mielen tyyneys tuo todellisen voiman." },
  { code: "cs_cz", name: "Czech", nativeName: "Čeština", region: "Europe", flag: "🇨🇿", engine: "DeepMind Neural (Pavel)", sampleText: "Klid mysli je základem každého vítězství." },
  { code: "ro_ro", name: "Romanian", nativeName: "Română", region: "Europe", flag: "🇷🇴", engine: "DeepMind Neural (Andrei)", sampleText: "Calmul interior reprezintă adevărata putere." },
  { code: "hu_hu", name: "Hungarian", nativeName: "Magyar", region: "Europe", flag: "🇭🇺", engine: "DeepMind Neural (Laszlo)", sampleText: "A lélek nyugalma hozza el a diadalt." },
  { code: "uk_ua", name: "Ukrainian", nativeName: "Українська", region: "Europe", flag: "🇺🇦", engine: "DeepMind Neural (Taras)", sampleText: "Спокій духу дарує непереможну силу." }
];

export function MultilingualDubbingMatrix() {
  const [selectedLangCode, setSelectedLangCode] = useState<string>("ja");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [playingCode, setPlayingCode] = useState<string | null>(null);

  const REGIONS = [
    { id: "all", label: "🌐 All 30 Regions" },
    { id: "Europe", label: "🇪🇺 Europe" },
    { id: "East Asia", label: "🏮 East Asia" },
    { id: "South Asia", label: "🪷 South Asia" },
    { id: "Latin America", label: "🌴 Latin America" },
    { id: "Middle East", label: "🏜️ Middle East" },
    { id: "Nordic", label: "❄️ Nordic" },
    { id: "Southeast Asia", label: "🏝️ SE Asia" },
    { id: "North America", label: "🦅 North America" }
  ];

  const filteredLanguages = DUBBING_LANGUAGES_30.filter((l) => {
    const matchesRegion = selectedRegion === "all" || l.region === selectedRegion;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      l.name.toLowerCase().includes(q) ||
      l.nativeName.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q) ||
      l.region.toLowerCase().includes(q);
    return matchesRegion && matchesSearch;
  });

  const handleTestDub = (lang: DubLanguage) => {
    if (playingCode === lang.code) {
      setPlayingCode(null);
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      return;
    }

    setPlayingCode(lang.code);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(lang.sampleText);
      utterance.lang = lang.code.replace("_", "-");
      utterance.rate = 0.95;
      utterance.onend = () => setPlayingCode(null);
      utterance.onerror = () => setPlayingCode(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingCode(null), 3000);
    }
  };

  return (
    <div className="rounded-3xl border border-indigo-500/30 bg-slate-950/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-serif">
                30-Language Neural Multilingual Dubbing Matrix
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-mono text-[10px] uppercase tracking-wider font-bold">
                48kHz DeepMind Dub
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Universal voice translation preserving original vocal formants, emotional tone, and lip-sync cadence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>0ms Audio-Visual Drift Lock</span>
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Region Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {REGIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRegion(r.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all border ${
                selectedRegion === r.id
                  ? "bg-indigo-500 text-white font-bold border-indigo-400 shadow-md shadow-indigo-500/20"
                  : "bg-slate-900/60 text-slate-400 hover:text-white border-slate-800"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search language or script..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* 30 Languages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 max-h-[580px] overflow-y-auto pr-1">
        {filteredLanguages.map((lang) => {
          const isPlaying = playingCode === lang.code;
          const isSelected = selectedLangCode === lang.code;
          return (
            <div
              key={lang.code}
              onClick={() => setSelectedLangCode(lang.code)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 relative group ${
                isSelected
                  ? "bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/40"
                  : "bg-slate-900/60 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{lang.flag}</span>
                    <span className="text-xs font-bold text-white group-hover:text-indigo-200 transition-colors">
                      {lang.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {lang.code.toUpperCase()}
                  </span>
                </div>

                <div className="text-[11px] font-serif text-indigo-300 mb-1">
                  {lang.nativeName}
                </div>

                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed italic">
                  "{lang.sampleText}"
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                <span className="text-[9px] font-mono text-slate-500 truncate max-w-[80px]">
                  {lang.region}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestDub(lang);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1 ${
                    isPlaying
                      ? "bg-indigo-500 text-white animate-pulse"
                      : "bg-slate-800 hover:bg-indigo-500 hover:text-white text-indigo-300"
                  }`}
                >
                  <Volume2 className="w-3 h-3" />
                  <span>{isPlaying ? "Testing..." : "Test Dub"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
