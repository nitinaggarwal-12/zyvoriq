import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zyvoriq — From idea to impact",
  description: "Discover what matters, create humanized multimodal content, publish everywhere, and learn what works.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
