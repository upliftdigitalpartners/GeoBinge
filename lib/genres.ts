/**
 * Canonical TMDB genre name → ID lookup.
 * Used by smart search to convert LLM-extracted genre names back to TMDB IDs.
 * Frozen list — TMDB has changed these maybe twice in a decade.
 */

import type { MediaType } from "./tmdb";

const MOVIE_GENRES: Record<string, number> = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  "Science Fiction": 878,
  "TV Movie": 10770,
  Thriller: 53,
  War: 10752,
  Western: 37,
};

const TV_GENRES: Record<string, number> = {
  "Action & Adventure": 10759,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Kids: 10762,
  Mystery: 9648,
  News: 10763,
  Reality: 10764,
  "Sci-Fi & Fantasy": 10765,
  Soap: 10766,
  Talk: 10767,
  "War & Politics": 10768,
  Western: 37,
};

// Common synonyms users type → canonical genre name
const ALIASES: Record<string, string> = {
  scifi: "Science Fiction",
  "sci-fi": "Science Fiction",
  "sci fi": "Science Fiction",
  romcom: "Romance",
  "rom-com": "Romance",
  thriller: "Thriller",
  doc: "Documentary",
  docs: "Documentary",
  cartoon: "Animation",
  cartoons: "Animation",
  anime: "Animation",
  kid: "Family",
  kids: "Family",
};

export function genreNameToId(name: string, type: MediaType): number | null {
  const table = type === "movie" ? MOVIE_GENRES : TV_GENRES;
  const direct = table[name];
  if (direct) return direct;
  // case-insensitive lookup
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(table)) {
    if (k.toLowerCase() === lower) return v;
  }
  // alias lookup
  const aliased = ALIASES[lower];
  if (aliased && table[aliased]) return table[aliased];
  return null;
}

export function genreNamesToIds(names: string[], type: MediaType): number[] {
  return names
    .map((n) => genreNameToId(n, type))
    .filter((id): id is number => id !== null);
}
