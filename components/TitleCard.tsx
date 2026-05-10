"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { tmdbImage, type MediaType } from "@/lib/tmdb";

export type TitleCardItem = {
  id: number;
  type: MediaType;
  title: string;
  year: string | null;
  poster_path: string | null;
  vote_average?: number;
};

export function TitleCard({
  item,
  index = 0,
  priority = false,
}: {
  item: TitleCardItem;
  index?: number;
  priority?: boolean;
}) {
  const poster = tmdbImage(item.poster_path, "w342");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(index * 0.025, 0.4),
      }}
    >
      <Link
        href={`/title/${item.type}/${item.id}`}
        className="group block focus:outline-none"
      >
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border bg-background-elevated shadow-lg shadow-black/40 transition-shadow group-hover:shadow-2xl group-hover:shadow-black/60"
        >
          {poster ? (
            <Image
              src={poster}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              priority={priority}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-4 text-center text-xs text-foreground-muted">
              {item.title}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 pt-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="line-clamp-2 text-sm font-semibold leading-tight text-white">
              {item.title}
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-white/70">
              {item.year && <span>{item.year}</span>}
              {typeof item.vote_average === "number" && item.vote_average > 0 && (
                <span className="inline-flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-yellow-400 stroke-yellow-400" />
                  {item.vote_average.toFixed(1)}
                </span>
              )}
              <span className="ml-auto rounded bg-white/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                {item.type}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="mt-2 px-0.5">
          <div className="line-clamp-1 text-sm font-medium text-foreground">
            {item.title}
          </div>
          {item.year && (
            <div className="text-xs text-foreground-muted">{item.year}</div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export function TitleCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[2/3] rounded-xl" />
      <div className="skeleton mt-2 h-4 w-3/4 rounded" />
      <div className="skeleton mt-1 h-3 w-1/3 rounded" />
    </div>
  );
}
