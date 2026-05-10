"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-10 pt-16 text-center sm:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-background-elevated/60 px-3 py-1 text-xs text-foreground-muted backdrop-blur"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-accent/70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
        Live Netflix availability across 60+ countries
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
      >
        Where can I watch this on{" "}
        <span className="bg-gradient-to-br from-accent via-accent to-rose-400 bg-clip-text text-transparent">
          Netflix
        </span>
        ?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-4 max-w-2xl text-balance text-base text-foreground-muted sm:text-lg"
      >
        Search any movie or show — see every country where Netflix has it.
        Pick the right VPN. Hit play.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="mt-7"
      >
        <Link
          href="/smart"
          className="group inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent/15"
        >
          <Sparkles className="h-4 w-4 text-accent transition group-hover:rotate-12" />
          Try smart search — describe a vibe in plain English
        </Link>
      </motion.div>
    </section>
  );
}
