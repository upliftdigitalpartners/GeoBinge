import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GeoBinge — Where can I watch this on Netflix?",
    template: "%s · GeoBinge",
  },
  description:
    "Search any movie or show and instantly see every country where Netflix has it. Pick your VPN, hit play.",
  applicationName: "GeoBinge",
  appleWebApp: {
    capable: true,
    title: "GeoBinge",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="glow-orb absolute -top-40 -left-40 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.18),transparent_60%)]" />
          <div
            className="glow-orb absolute -bottom-40 -right-40 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(80,40,200,0.18),transparent_60%)]"
            style={{ animationDelay: "-7s" }}
          />
        </div>
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border mt-24 py-8 text-center text-xs text-foreground-muted">
          Data from{" "}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-foreground"
          >
            TMDB
          </a>
          . This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </footer>
      </body>
    </html>
  );
}
