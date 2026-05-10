import Link from "next/link";
import { Suspense } from "react";
import { Globe2, Sparkles } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="group flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white shadow-[0_0_24px_rgba(229,9,20,0.55)] transition-transform group-hover:scale-105">
            <Globe2 className="h-4 w-4" />
          </span>
          <span>
            Geo<span className="text-accent">Binge</span>
          </span>
        </Link>

        <div className="flex-1 max-w-xl">
          <Suspense fallback={<div className="h-9 rounded-full border border-border bg-background-elevated/80" />}>
            <SearchBar />
          </Suspense>
        </div>

        <nav className="hidden sm:flex items-center gap-1 text-sm">
          <Link
            href="/smart"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-foreground-muted transition hover:bg-white/5 hover:text-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Smart
          </Link>
          <Link
            href="/country/US"
            className="rounded-full px-3 py-1.5 text-foreground-muted transition hover:bg-white/5 hover:text-foreground"
          >
            Browse
          </Link>
        </nav>
      </div>
    </header>
  );
}
