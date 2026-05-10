"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ExternalLink, Globe } from "lucide-react";
import { countryName, flagEmoji } from "@/lib/countries";

export function CountryAvailability({
  countries,
}: {
  countries: { code: string; link: string }[];
}) {
  if (countries.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-background-elevated/60 p-8 text-center">
        <Globe className="mx-auto mb-3 h-8 w-8 text-foreground-muted" />
        <div className="text-foreground">Not on Netflix anywhere right now.</div>
        <div className="mt-1 text-sm text-foreground-muted">
          (Could be on another streamer — this app only tracks Netflix.)
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">
          On Netflix in{" "}
          <span className="text-accent">{countries.length}</span>{" "}
          {countries.length === 1 ? "country" : "countries"}
        </h2>
        <div className="text-xs text-foreground-muted">
          Pick one → switch your VPN → enjoy.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((c, i) => (
          <motion.div
            key={c.code}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: Math.min(i * 0.018, 0.5),
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="group flex items-center gap-3 rounded-xl border border-border bg-background-elevated/60 p-3 transition hover:border-border-strong hover:bg-background-elevated">
              <span className="text-2xl leading-none" aria-hidden>
                {flagEmoji(c.code)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">
                  {countryName(c.code)}
                </div>
                <div className="text-xs text-foreground-muted">{c.code}</div>
              </div>

              <div className="flex items-center gap-1.5">
                <Link
                  href={`/country/${c.code}`}
                  className="rounded-md px-2 py-1 text-xs text-foreground-muted hover:bg-white/10 hover:text-foreground"
                  aria-label={`Browse Netflix ${countryName(c.code)}`}
                >
                  Browse
                </Link>
                <a
                  href={c.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-accent/90 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-accent"
                  aria-label={`Open on Netflix ${countryName(c.code)}`}
                >
                  Open
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
