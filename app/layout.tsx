import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Zyvoriq Content Studio — Calm, Precise Multi-Platform Social & 60s Cinema Studio",
  description:
    "Create, preview, edit in place, check & fix across 6 categories, compare variations, and publish multi-platform social & 60s 35mm video content.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        style={{
          backgroundColor: "var(--color-bg)",
          color: "var(--color-text)",
        }}
        className="antialiased min-h-screen w-full max-w-none overflow-x-hidden"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <div className="min-h-screen w-full max-w-none flex flex-col">
            <div className="flex-1 w-full max-w-none">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
