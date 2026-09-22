import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { AppFooter } from "@/components/AppFooter";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Zyvoriq — AI Creative Studio",
  description:
    "Create, direct, edit and publish video, audio, images and social content with Zyvoriq.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                window.addEventListener('error', function(e) {
                  var msg = (e && e.message) ? String(e.message) : '';
                  var file = (e && e.filename) ? String(e.filename) : '';
                  if (
                    file.indexOf('share-modal') !== -1 ||
                    msg.indexOf('startTime') !== -1 ||
                    msg.indexOf('reportAllChanges') !== -1 ||
                    (msg.indexOf('addEventListener') !== -1 && file.indexOf('share-modal') !== -1)
                  ) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return false;
                  }
                }, true);
                window.addEventListener('unhandledrejection', function(e) {
                  var reason = (e && e.reason && e.reason.message) ? String(e.reason.message) : String(e && e.reason || '');
                  if (reason.indexOf('Receiving end does not exist') !== -1 || reason.indexOf('startTime') !== -1) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return false;
                  }
                }, true);
              })();
            `,
          }}
        />
      </head>
      <body
        className="bg-[#f7f8fb] text-slate-900 dark:bg-obsidian-950 dark:text-slate-100 antialiased min-h-screen flex flex-col selection:bg-violet-200 selection:text-violet-950 dark:selection:bg-violet-500/30 dark:selection:text-violet-100 transition-colors duration-200"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <AppFooter />
          <CookieConsentBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}

