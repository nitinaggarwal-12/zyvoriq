"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Film,
  FolderKanban,
  Images,
  MapPin,
  Menu,
  Music2,
  Search,
  Settings2,
  Sparkles,
  Users,
  X,
} from "lucide-react";

const creatorLinks = [
  { href: "/reels", label: "Social video", icon: Film },
  { href: "/yt", label: "Music video", icon: Music2 },
  { href: "/feature-films", label: "Film", icon: Sparkles },
  { href: "/motion-pictures", label: "Motion picture", icon: Film },
];

const assetLinks = [
  { href: "/characters", label: "Characters", icon: Users },
  { href: "/locations", label: "Locations", icon: MapPin },
];

const labLinks = [
  { href: "/swarm", label: "Swarm Studio" },
  { href: "/swarm-MUI", label: "M3 Studio" },
  { href: "/registry", label: "DB Registry" },
];

export function Navbar() {
  const pathname = usePathname();
  const [livePath, setLivePath] = useState(pathname || "/");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(false);
  const [labsOpen, setLabsOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => setLivePath(pathname || "/"), [pathname]);

  useEffect(() => {
    const syncPath = () => {
      if (typeof window !== "undefined") setLivePath(window.location.pathname);
    };
    window.addEventListener("zyvoriq-route-change", syncPath);
    window.addEventListener("popstate", syncPath);
    return () => {
      window.removeEventListener("zyvoriq-route-change", syncPath);
      window.removeEventListener("popstate", syncPath);
    };
  }, []);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (shellRef.current && !shellRef.current.contains(event.target as Node)) {
        setCreateOpen(false);
        setAssetsOpen(false);
        setLabsOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const isCreate =
    livePath === "/" ||
    livePath === "/reels" ||
    livePath === "/yt" ||
    livePath === "/studio" ||
    livePath === "/music-video" ||
    livePath?.startsWith("/feature-films") ||
    livePath?.startsWith("/motion-pictures");

  const isProjects = livePath?.startsWith("/my-reels") || livePath?.startsWith("/library");
  const isAssets = livePath?.startsWith("/characters") || livePath?.startsWith("/locations");

  const navItem = (active: boolean) =>
    `zy-nav-item ${active ? "zy-nav-item-active" : ""}`;

  return (
    <header className="zy-topbar">
      <div ref={shellRef} className="zy-topbar-inner">
        <Link href="/" className="zy-brand" aria-label="Zyvoriq home">
          <div className="zy-brand-mark">
            <Film className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="zy-brand-name">ZYVORIQ</div>
            <div className="zy-brand-tagline">Create beyond reality</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          <div className="relative">
            <button
              type="button"
              className={navItem(isCreate)}
              onClick={() => {
                setCreateOpen((v) => !v);
                setAssetsOpen(false);
                setLabsOpen(false);
              }}
              aria-expanded={createOpen}
            >
              <Sparkles className="h-4 w-4" />
              Create
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>
            {createOpen && (
              <div className="zy-menu-panel">
                <div className="zy-menu-label">Create</div>
                {creatorLinks.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className="zy-menu-item" onClick={() => setCreateOpen(false)}>
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/my-reels" className={navItem(isProjects)}>
            <FolderKanban className="h-4 w-4" />
            Projects
          </Link>

          <div className="relative">
            <button
              type="button"
              className={navItem(isAssets)}
              onClick={() => {
                setAssetsOpen((v) => !v);
                setCreateOpen(false);
                setLabsOpen(false);
              }}
              aria-expanded={assetsOpen}
            >
              <Images className="h-4 w-4" />
              Assets
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>
            {assetsOpen && (
              <div className="zy-menu-panel">
                <div className="zy-menu-label">Reusable assets</div>
                {assetLinks.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className="zy-menu-item" onClick={() => setAssetsOpen(false)}>
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="ml-auto hidden md:flex items-center gap-2">
          <Link href="/my-reels" className="zy-search-pill">
            <Search className="h-4 w-4" />
            <span>Search projects & assets</span>
            <kbd>⌘K</kbd>
          </Link>

          <div className="relative hidden xl:block">
            <button
              type="button"
              className="zy-icon-button"
              aria-label="Open labs and advanced tools"
              onClick={() => {
                setLabsOpen((v) => !v);
                setCreateOpen(false);
                setAssetsOpen(false);
              }}
            >
              <Settings2 className="h-4 w-4" />
            </button>
            {labsOpen && (
              <div className="zy-menu-panel right-0 left-auto">
                <div className="zy-menu-label">Advanced tools</div>
                {labLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="zy-menu-item" onClick={() => setLabsOpen(false)}>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/reels" className="zy-primary-cta">
            Create video
          </Link>
        </div>

        <button
          type="button"
          className="zy-icon-button ml-auto lg:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((v) => !v)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="zy-mobile-menu lg:hidden">
          <div className="zy-mobile-section-label">Create</div>
          {creatorLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="zy-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}

          <div className="zy-mobile-section-label mt-4">Workspace</div>
          <Link href="/my-reels" className="zy-mobile-link" onClick={() => setMobileMenuOpen(false)}>
            <FolderKanban className="h-4 w-4" />
            Projects
          </Link>
          {assetLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="zy-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}

          <details className="mt-3">
            <summary className="zy-mobile-link cursor-pointer list-none">
              <Settings2 className="h-4 w-4" />
              Advanced tools
            </summary>
            <div className="pl-7 pt-1">
              {labLinks.map((item) => (
                <Link key={item.href} href={item.href} className="zy-mobile-sub-link" onClick={() => setMobileMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </div>
          </details>

          <Link href="/reels" className="zy-primary-cta mt-4 w-full justify-center" onClick={() => setMobileMenuOpen(false)}>
            Create video
          </Link>
        </div>
      )}
    </header>
  );
}
