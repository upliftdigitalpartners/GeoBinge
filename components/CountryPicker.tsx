"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Search } from "lucide-react";
import { allNetflixCountries, countryName, flagEmoji } from "@/lib/countries";

export function CountryPicker({ current }: { current: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const all = useMemo(() => allNetflixCountries(), []);
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [all, filter]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-background-elevated px-4 py-2 text-sm font-medium transition hover:border-border-strong"
      >
        <span className="text-lg leading-none" aria-hidden>
          {flagEmoji(current)}
        </span>
        <span>{countryName(current)}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 z-40 mt-2 w-[320px] overflow-hidden rounded-xl border border-border bg-background-elevated shadow-2xl shadow-black/60 backdrop-blur-xl"
            >
              <div className="relative border-b border-border p-2">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                <input
                  autoFocus
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter countries…"
                  className="w-full rounded-md bg-transparent py-2 pl-8 pr-2 text-sm outline-none placeholder:text-foreground-muted"
                />
              </div>
              <ul className="max-h-80 overflow-y-auto py-1">
                {filtered.map((c) => {
                  const active = c.code === current;
                  return (
                    <li key={c.code}>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          router.push(`/country/${c.code}`);
                        }}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition hover:bg-white/5 ${
                          active ? "bg-white/5" : ""
                        }`}
                      >
                        <span className="text-lg leading-none" aria-hidden>
                          {c.flag}
                        </span>
                        <span className="flex-1 truncate">{c.name}</span>
                        <span className="font-mono text-[11px] text-foreground-muted">
                          {c.code}
                        </span>
                        {active && (
                          <Check className="h-4 w-4 text-accent" />
                        )}
                      </button>
                    </li>
                  );
                })}
                {filtered.length === 0 && (
                  <li className="px-3 py-6 text-center text-sm text-foreground-muted">
                    No matches.
                  </li>
                )}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
