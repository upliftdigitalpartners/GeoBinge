"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Genre } from "@/lib/tmdb";

export function GenreFilter({
  genres,
  active,
  buildHref,
}: {
  genres: Genre[];
  active: number | null;
  buildHref: (genreId: number | null) => string;
}) {
  return (
    <div className="scroll-hide -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      <Chip href={buildHref(null)} active={active === null}>
        All
      </Chip>
      {genres.map((g) => (
        <Chip key={g.id} href={buildHref(g.id)} active={active === g.id}>
          {g.name}
        </Chip>
      ))}
    </div>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`relative shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition ${
        active
          ? "border-accent/40 bg-accent/15 text-foreground"
          : "border-border bg-background-elevated/60 text-foreground-muted hover:border-border-strong hover:text-foreground"
      }`}
    >
      {active && (
        <motion.span
          layoutId="genre-pill"
          className="absolute inset-0 -z-10 rounded-full bg-accent/15"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      {children}
    </Link>
  );
}
