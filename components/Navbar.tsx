"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, Music2, Clapperboard, Smartphone, Menu, X } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [livePath, setLivePath] = useState(pathname || "/");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setLivePath(pathname || "/");
  }, [pathname]);

  useEffect(() => {
    const syncPath = () => {
      if (typeof window !== "undefined") {
        setLivePath(window.location.pathname);
      }
    };
    window.addEventListener("zyvoriq-route-change", syncPath);
    window.addEventListener("popstate", syncPath);
    return () => {
      window.removeEventListener("zyvoriq-route-change", syncPath);
      window.removeEventListener("popstate", syncPath);
    };
  }, []);

  const isReels = livePath === "/" || livePath === "/reels";
  const isMusicVideo =
    livePath === "/yt" ||
    livePath === "/studio" ||
    livePath === "/music-video";
  const isFeatureFilms = livePath?.startsWith("/feature-films");
  const isMotionPictures = livePath?.startsWith("/motion-pictures");
  const isCharacters = livePath?.startsWith("/characters");
  const isLocations = livePath?.startsWith("/locations");
  const isLibrary = livePath?.startsWith("/my-reels");

  return (
    <header className="sticky top-0 z-50 w-full bg-[#07090E]/95 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 h-16 md:h-18 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 p-[1px] shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#07090E] rounded-[11px] flex items-center justify-center">
                <Film className="w-4 h-4 text-teal-400" />
              </div>
            </div>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              ZYVORIQ
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/40 text-teal-300 whitespace-nowrap">
                Omni 1.1 Studio
              </span>
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
          <Link
            href="/reels"
            className={`hover:text-teal-400 transition-colors flex items-center gap-1.5 ${
              isReels ? "text-teal-300 font-bold" : "text-slate-300"
            }`}
          >
            <Smartphone className="w-4 h-4 text-teal-400" />
            <span>Reels</span>
          </Link>
          <Link
            href="/yt"
            className={`hover:text-teal-400 transition-colors flex items-center gap-1.5 ${
              isMusicVideo ? "text-teal-300 font-bold" : "text-slate-300"
            }`}
          >
            <Music2 className="w-4 h-4 text-teal-400" />
            <span>Music Video Studio</span>
          </Link>
          <Link
            href="/feature-films"
            className={`hover:text-amber-400 transition-colors flex items-center gap-1.5 ${
              isFeatureFilms ? "text-amber-300 font-bold" : "text-slate-300"
            }`}
          >
            <Clapperboard className="w-4 h-4 text-amber-400" />
            <span>Feature Films</span>
          </Link>
          <Link
            href="/motion-pictures"
            className={`hover:text-amber-400 transition-colors flex items-center gap-1.5 ${
              isMotionPictures ? "text-amber-300 font-bold" : "text-slate-300"
            }`}
          >
            <Film className="w-4 h-4 text-amber-400" />
            <span>Motion Pictures</span>
          </Link>
          <Link
            href="/characters"
            className={`hover:text-teal-400 transition-colors ${
              isCharacters ? "text-teal-300 font-bold" : "text-slate-300"
            }`}
          >
            Characters
          </Link>
          <Link
            href="/locations"
            className={`hover:text-amber-400 transition-colors ${
              isLocations ? "text-amber-300 font-bold" : "text-slate-300"
            }`}
          >
            Locations
          </Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/swarm"
            className={`text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl border transition-colors min-h-[38px] flex items-center ${
              livePath === "/swarm"
                ? "bg-amber-400/20 border-amber-400/50 text-amber-200"
                : "text-amber-300 hover:text-white bg-white/5 hover:bg-white/10 border-white/10"
            }`}
          >
            🎬 Swarm Studio
          </Link>
          <Link
            href="/swarm-MUI"
            className={`text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl border transition-colors min-h-[38px] flex items-center ${
              livePath?.startsWith("/swarm-MUI")
                ? "bg-sky-400/20 border-sky-400/50 text-sky-200"
                : "text-sky-300 hover:text-white bg-white/5 hover:bg-white/10 border-white/10"
            }`}
          >
            🎨 M3 Studio
          </Link>
          <Link
            href="/registry"
            className={`text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl border transition-colors min-h-[38px] flex items-center ${
              livePath?.startsWith("/registry")
                ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-200"
                : "text-emerald-300 hover:text-white bg-white/5 hover:bg-white/10 border-white/10"
            }`}
          >
            🗄️ DB Registry
          </Link>
          <Link
            href="/my-reels"
            className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-xl border transition-colors min-h-[38px] flex items-center ${
              isLibrary || livePath?.startsWith("/library")
                ? "bg-teal-500/20 border-teal-500/40 text-teal-200"
                : "text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border-white/10"
            }`}
          >
            My Library
          </Link>

          <button
            type="button"
            className="md:hidden p-2 rounded-xl text-slate-300 hover:bg-white/10 min-h-[38px] min-w-[38px] flex items-center justify-center"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#07090E] px-4 py-4 space-y-2">
          <Link
            href="/reels"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-teal-300 hover:bg-white/5 min-h-[44px]"
          >
            <Smartphone className="w-4 h-4 text-teal-400" />
            <span>Reels</span>
          </Link>
          <Link
            href="/yt"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-teal-300 hover:bg-white/5 min-h-[44px]"
          >
            <Music2 className="w-4 h-4 text-teal-400" />
            <span>Music Video Studio</span>
          </Link>
          <Link
            href="/feature-films"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/5 min-h-[44px]"
          >
            <Clapperboard className="w-4 h-4 text-amber-400" />
            <span>Feature Films</span>
          </Link>
          <Link
            href="/motion-pictures"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/5 min-h-[44px]"
          >
            <Film className="w-4 h-4 text-amber-400" />
            <span>Motion Pictures</span>
          </Link>
          <Link
            href="/characters"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/5 min-h-[44px]"
          >
            <span>Characters</span>
          </Link>
          <Link
            href="/locations"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/5 min-h-[44px]"
          >
            <span>Locations</span>
          </Link>
        </div>
      )}
    </header>
  );
}

