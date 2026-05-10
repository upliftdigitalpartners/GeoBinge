"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import { useState } from "react";
import type { Video } from "@/lib/tmdb";

function pickBestTrailer(videos: Video[] | undefined): Video | null {
  if (!videos || videos.length === 0) return null;
  const yt = videos.filter((v) => v.site === "YouTube");
  // Preference: official trailer > trailer > teaser > clip
  const score = (v: Video) =>
    (v.type === "Trailer" ? 10 : v.type === "Teaser" ? 5 : v.type === "Clip" ? 2 : 0) +
    (v.official ? 3 : 0);
  return yt.sort((a, b) => score(b) - score(a))[0] ?? null;
}

export function TrailerButton({ videos }: { videos: Video[] | undefined }) {
  const trailer = pickBestTrailer(videos);
  const [open, setOpen] = useState(false);

  if (!trailer) return null;

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-black/40 transition hover:bg-white/90"
      >
        <Play className="h-4 w-4 fill-black" />
        Play trailer
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border border-border-strong bg-black shadow-2xl"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black"
                aria-label="Close trailer"
              >
                <X className="h-4 w-4" />
              </button>
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`}
                title={trailer.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
