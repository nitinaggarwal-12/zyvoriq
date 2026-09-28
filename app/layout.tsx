import type { Metadata } from "next";
import "./globals.css";
import { LeftIconRail } from "@/components/LeftIconRail";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Stitch Studio — 60s AI Cinema",
  description: "Minimalist 4-step AI video studio powered by Gemini Omni 1.1 Flash.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className="bg-[#09090b] text-zinc-100 antialiased min-h-screen w-full max-w-none overflow-x-hidden selection:bg-white/20 selection:text-white"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <LeftIconRail />
          <div
            style={{ paddingLeft: "var(--left-nav-width, 200px)" }}
            className="min-h-screen w-full max-w-none flex flex-col transition-all duration-200"
          >
            <main className="flex-1 w-full max-w-none">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
