import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zyvoriq — Autonomous Idea-to-Impact Lifecycle Intelligence",
  description:
    "Grounded persona memory, PRD & repository deconstruction, multi-modal synthesis, and Veritas claim-level quality auto-repair across channels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-obsidian-950 text-slate-100 antialiased min-h-screen selection:bg-teal-500/30 selection:text-teal-200">
        {children}
      </body>
    </html>
  );
}
