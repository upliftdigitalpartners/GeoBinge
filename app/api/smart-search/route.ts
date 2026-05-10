import { NextResponse } from "next/server";
import { groqJSON } from "@/lib/groq";
import {
  discoverByNetflix,
  searchMulti,
  titleOf,
  yearOf,
  type DiscoverItem,
  type MediaType,
  type SearchHit,
} from "@/lib/tmdb";
import { genreNamesToIds } from "@/lib/genres";
import { isKnownNetflixCountry } from "@/lib/countries";
import type { TitleCardItem } from "@/components/TitleCard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LLMInterpretation = {
  mediaType?: "movie" | "tv";
  country?: string;
  genres?: string[];
  year_min?: number;
  year_max?: number;
  keywords?: string;
  explanation?: string;
};

const SYSTEM_PROMPT = `You convert natural-language requests for Netflix titles into structured search filters.
Return JSON with these optional fields (omit any that don't apply):
- "mediaType": "movie" or "tv"
- "country": ISO 3166-1 alpha-2 code where the user wants to watch (e.g. "JP" Japan, "KR" Korea, "IN" India, "GB" UK, "DE" Germany, "FR" France, "ES" Spain, "MX" Mexico, "BR" Brazil, "US" United States). Default to "US" if unspecified.
- "genres": array using EXACTLY these names — Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, "Science Fiction", Thriller, War, Western, "Action & Adventure", "Sci-Fi & Fantasy", Kids, Reality, "War & Politics"
- "year_min" / "year_max": years if user mentioned a decade or era ("90s" → 1990/1999, "recent" → last 3 years from 2026)
- "keywords": ONLY if the user named a specific title, franchise, or person (e.g. "like Ozark", "with Ryan Gosling"). Otherwise omit.
- "explanation": ONE sentence saying what you understood, friendly tone, max 18 words.

Rules:
- If user says "Korean drama" → country: "KR", mediaType: "tv", genres: ["Drama"]
- If user says "anime" → mediaType: "tv", genres: ["Animation"], country: "JP"
- If user says "Bollywood" → country: "IN"
- If user says "feel-good" or "cozy" → genres: ["Comedy", "Romance"]
- If user says "dark" or "gritty" → genres: ["Thriller", "Crime"]

Return JSON only.`;

type SmartResult = {
  interpretation: LLMInterpretation;
  results: TitleCardItem[];
  warning?: string;
};

export async function POST(req: Request) {
  let query: string;
  try {
    const body = (await req.json()) as { query?: string };
    query = (body.query ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!query) {
    return NextResponse.json({ error: "Empty query" }, { status: 400 });
  }
  if (query.length > 300) {
    return NextResponse.json(
      { error: "Query too long (max 300 chars)" },
      { status: 400 },
    );
  }

  let interpretation: LLMInterpretation;
  try {
    interpretation = await groqJSON<LLMInterpretation>(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: query },
      ],
      { temperature: 0.1 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Smart search failed: ${message}` },
      { status: 500 },
    );
  }

  // Defaults & normalization
  const mediaType: MediaType = interpretation.mediaType === "tv" ? "tv" : "movie";
  const country = (interpretation.country ?? "US").toUpperCase();
  const validCountry = /^[A-Z]{2}$/.test(country) ? country : "US";

  let results: TitleCardItem[] = [];
  let warning: string | undefined;

  // Path A: keyword search (user named a specific title/person)
  if (interpretation.keywords && interpretation.keywords.length > 0) {
    try {
      const data = await searchMulti(interpretation.keywords);
      results = data.results
        .filter(
          (r): r is SearchHit & { media_type: MediaType } =>
            (r.media_type === "movie" || r.media_type === "tv") &&
            Boolean(r.poster_path),
        )
        .slice(0, 24)
        .map((r) => ({
          id: r.id,
          type: r.media_type,
          title: titleOf(r),
          year: yearOf(r),
          poster_path: r.poster_path,
          vote_average: r.vote_average,
        }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        { error: `TMDB search failed: ${message}` },
        { status: 500 },
      );
    }
  } else {
    // Path B: discover by Netflix in country with filters
    const genreIds = genreNamesToIds(
      interpretation.genres ?? [],
      mediaType,
    );
    try {
      const data = await discoverByNetflix(mediaType, validCountry, {
        page: 1,
        withGenres: genreIds.length > 0 ? genreIds.join(",") : undefined,
        yearMin: interpretation.year_min,
        yearMax: interpretation.year_max,
      });
      results = data.results
        .filter((r) => r.poster_path)
        .slice(0, 24)
        .map((r: DiscoverItem) => ({
          id: r.id,
          type: mediaType,
          title: titleOf(r),
          year: yearOf(r),
          poster_path: r.poster_path,
          vote_average: r.vote_average,
        }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        { error: `TMDB discover failed: ${message}` },
        { status: 500 },
      );
    }
  }

  if (!isKnownNetflixCountry(validCountry)) {
    warning = `Heads up: ${validCountry} isn't in our verified Netflix-country list. Results may be sparse.`;
  }

  const payload: SmartResult = {
    interpretation: { ...interpretation, country: validCountry, mediaType },
    results,
    ...(warning ? { warning } : {}),
  };
  return NextResponse.json(payload);
}
