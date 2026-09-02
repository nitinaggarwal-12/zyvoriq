import type { Metadata } from "next";
import "./globals.css";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { AppFooter } from "@/components/AppFooter";

export const metadata: Metadata = {
  title: "Zyvoriq — AI Reel Studio for Social Content",
  description:
    "Create Instagram Reels and short-form social content from one idea: hooks, scripts, scenes, voice direction, captions, covers, localization and platform-ready variants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <body
        className="bg-obsidian-950 text-slate-100 antialiased min-h-screen flex flex-col selection:bg-pink-500/30 selection:text-pink-100"
        suppressHydrationWarning
      >
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <AppFooter />
        <CookieConsentBanner />
      </body>
    </html>
  );
}

