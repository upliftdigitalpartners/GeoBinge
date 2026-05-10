"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { tmdbImage, type CastMember } from "@/lib/tmdb";

export function CastRow({ cast }: { cast: CastMember[] | undefined }) {
  if (!cast || cast.length === 0) return null;
  const top = cast.slice(0, 18);
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-semibold tracking-tight">Cast</h2>
      <div className="scroll-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
        {top.map((p, i) => {
          const img = tmdbImage(p.profile_path, "w185");
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: Math.min(i * 0.025, 0.4),
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-[120px] shrink-0 snap-start"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border bg-background-elevated">
                {img ? (
                  <Image
                    src={img}
                    alt={p.name}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl text-foreground-muted">
                    {p.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
              </div>
              <div className="mt-2 line-clamp-1 text-sm font-medium">
                {p.name}
              </div>
              {p.character && (
                <div className="line-clamp-1 text-xs text-foreground-muted">
                  {p.character}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
