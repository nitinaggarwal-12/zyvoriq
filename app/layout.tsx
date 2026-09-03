import type { Metadata } from "next";
import "./globals.css";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { AppFooter } from "@/components/AppFooter";
import { LiveSupportConcierge } from "@/components/LiveSupportConcierge";
import { ThemeProvider } from "@/components/ThemeProvider";

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
        className="bg-obsidian-950 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 antialiased min-h-screen flex flex-col selection:bg-teal-500/30 selection:text-teal-900 dark:selection:text-teal-100 transition-colors duration-200"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <AppFooter />
          <CookieConsentBanner />
          <LiveSupportConcierge />
        </ThemeProvider>
      </body>
    </html>
  );
}

