"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { useState, useTransition } from "react";
import { TitleGrid, TitleGridSkeleton } from "@/components/TitleGrid";
import { flagEmoji } from "@/lib/countries";
import type { TitleCardItem } from "@/components/TitleCard";

type Interpretation = {
  mediaType?: "movie" | "tv";
  country?: string;
  genres?: string[];
  year_min?: number;
  year_max?: number;
  keywords?: string;
  explanation?: string;
};

type SmartResult = {
  interpretation: Interpretation;
  results: TitleCardItem[];
  warning?: string;
};

const EXAMPLES = [
  "feel-good Korean dramas under 2 hours",
  "dark crime thrillers like Ozark but Spanish",
  "90s sci-fi movies on Netflix Japan",
  "Bollywood romcoms from the 2010s",
  "cozy British baking shows",
];

export function SmartSearchForm() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<SmartResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(q: string) {
    if (!q.trim() || pending) return;
    setError(null);
    setQuery(q);
    startTransition(async () => {
      try {
        const res = await fetch("/api/smart-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "Smart search failed");
          setData(null);
          return;
        }
        setData(json as SmartResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
        setData(null);
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(query);
        }}
        className="group relative flex items-center"
      >
        <Sparkles className="pointer-events-none absolute left-4 h-5 w-5 text-accent" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe what you want to watch in plain English…"
          aria-label="Smart search"
          className="w-full rounded-full border border-border-strong bg-background-elevated/80 py-4 pl-12 pr-32 text-base text-foreground placeholder:text-foreground-muted outline-none backdrop-blur-xl transition focus:border-accent/40 focus:bg-background-elevated"
        />
        <button
          type="submit"
          disabled={pending || !query.trim()}
          className="absolute right-2 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Search <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {!data && !pending && (
        <div className="mt-6">
          <div className="mb-2 text-xs uppercase tracking-wider text-foreground-muted">
            Try one
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => run(ex)}
                className="rounded-full border border-border bg-background-elevated/60 px-3 py-1.5 text-sm text-foreground-muted transition hover:border-border-strong hover:text-foreground"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm text-foreground"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {(pending || data) && (
        <div className="mt-10">
          {data && <Interpretation interp={data.interpretation} />}

          <div className="mt-6">
            {pending ? (
              <TitleGridSkeleton count={12} />
            ) : data ? (
              <>
                {data.warning && (
                  <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-200">
                    {data.warning}
                  </div>
                )}
                <TitleGrid items={data.results} priorityCount={6} />
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function Interpretation({ interp }: { interp: Interpretation }) {
  const chips: React.ReactNode[] = [];
  if (interp.country) {
    chips.push(
      <Chip key="country">
        <span className="mr-1.5" aria-hidden>
          {flagEmoji(interp.country)}
        </span>
        {interp.country}
      </Chip>,
    );
  }
  if (interp.mediaType) {
    chips.push(
      <Chip key="type">
        {interp.mediaType === "movie" ? "Movies" : "TV"}
      </Chip>,
    );
  }
  if (interp.genres && interp.genres.length > 0) {
    interp.genres.forEach((g) => chips.push(<Chip key={`g-${g}`}>{g}</Chip>));
  }
  if (interp.year_min || interp.year_max) {
    chips.push(
      <Chip key="years">
        {interp.year_min ?? "?"}–{interp.year_max ?? "?"}
      </Chip>,
    );
  }
  if (interp.keywords) {
    chips.push(<Chip key="kw">&ldquo;{interp.keywords}&rdquo;</Chip>);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-border bg-background-elevated/50 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          <div className="text-sm text-foreground">
            {interp.explanation ?? "Here's what I found."}
          </div>
          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">{chips}</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
      {children}
    </span>
  );
}
