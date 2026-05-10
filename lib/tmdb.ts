export const NETFLIX_PROVIDER_ID = 8;
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

const TMDB_BASE = "https://api.themoviedb.org/3";

function getCredential(): { key: string; isV4: boolean } {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error(
      "TMDB_API_KEY is not set. Add it to .env.local — get one free at themoviedb.org → settings → API.",
    );
  }
  // v4 read-access tokens are JWTs (start with "eyJ"); v3 keys are 32-char hex.
  return { key, isV4: key.startsWith("eyJ") };
}

type FetchOptions = {
  query?: Record<string, string | number | boolean | undefined>;
  /** Seconds to cache. Defaults to 1 hour. */
  revalidate?: number;
};

async function tmdbFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { key, isV4 } = getCredential();
  const url = new URL(`${TMDB_BASE}${path}`);
  if (!isV4) url.searchParams.set("api_key", key);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    }
  }

  const res = await fetch(url.toString(), {
    headers: isV4
      ? { Authorization: `Bearer ${key}`, accept: "application/json" }
      : { accept: "application/json" },
    next: { revalidate: opts.revalidate ?? 3600 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`TMDB ${res.status} ${res.statusText} — ${path} — ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

// ---------- Types ----------

export type MediaType = "movie" | "tv";

export type SearchHit = {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  popularity?: number;
};

export type DiscoverItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
};

export type WatchProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string;
};

export type CountryProviders = {
  link: string;
  flatrate?: WatchProvider[];
  free?: WatchProvider[];
  ads?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
};

export type WatchProvidersResponse = {
  id: number;
  results: Record<string, CountryProviders>;
};

export type TitleDetails = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  genres: { id: number; name: string }[];
  tagline?: string;
  status?: string;
  original_language: string;
};

export type CastMember = {
  id: number;
  name: string;
  character?: string;
  profile_path: string | null;
  order: number;
};

export type CrewMember = {
  id: number;
  name: string;
  job: string;
  department: string;
};

export type Credits = { cast: CastMember[]; crew: CrewMember[] };

export type Video = {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
};

export type SimilarItem = DiscoverItem;

export type ExpandedTitleDetails = TitleDetails & {
  credits?: Credits;
  videos?: { results: Video[] };
  similar?: { results: SimilarItem[] };
};

export type Genre = { id: number; name: string };

// ---------- API methods ----------

export function searchMulti(query: string, page = 1) {
  return tmdbFetch<{ results: SearchHit[]; total_results: number; total_pages: number }>(
    "/search/multi",
    {
      query: { query, page, include_adult: false, language: "en-US" },
      revalidate: 600,
    },
  );
}

export function getTitleDetails(type: MediaType, id: number) {
  return tmdbFetch<TitleDetails>(`/${type}/${id}`, {
    query: { language: "en-US" },
    revalidate: 86400,
  });
}

export function getTitleDetailsExpanded(type: MediaType, id: number) {
  return tmdbFetch<ExpandedTitleDetails>(`/${type}/${id}`, {
    query: {
      language: "en-US",
      append_to_response: "credits,videos,similar",
    },
    revalidate: 86400,
  });
}

export function getGenres(type: MediaType) {
  return tmdbFetch<{ genres: Genre[] }>(`/genre/${type}/list`, {
    query: { language: "en-US" },
    revalidate: 60 * 60 * 24 * 7, // 1 week — genre list almost never changes
  });
}

export function getWatchProviders(type: MediaType, id: number) {
  return tmdbFetch<WatchProvidersResponse>(`/${type}/${id}/watch/providers`, {
    revalidate: 21600, // 6 hours
  });
}

export type DiscoverOptions = {
  page?: number;
  sort?: "popularity.desc" | "vote_average.desc" | "primary_release_date.desc";
  withGenres?: number | string;
  yearMin?: number;
  yearMax?: number;
};

export function discoverByNetflix(
  type: MediaType,
  region: string,
  optsOrPage: number | DiscoverOptions = 1,
  legacySort: "popularity.desc" | "vote_average.desc" | "primary_release_date.desc" = "popularity.desc",
) {
  // Backward-compatible: callers may pass (page) or (page, sort) or an options object.
  const opts: DiscoverOptions =
    typeof optsOrPage === "number"
      ? { page: optsOrPage, sort: legacySort }
      : optsOrPage;

  const page = opts.page ?? 1;
  const sort = opts.sort ?? "popularity.desc";

  const dateField =
    type === "movie" ? "primary_release_date" : "first_air_date";

  return tmdbFetch<{ results: DiscoverItem[]; total_results: number; total_pages: number }>(
    `/discover/${type}`,
    {
      query: {
        with_watch_providers: NETFLIX_PROVIDER_ID,
        watch_region: region,
        sort_by: sort,
        page,
        language: "en-US",
        include_adult: false,
        with_genres: opts.withGenres,
        [`${dateField}.gte`]: opts.yearMin ? `${opts.yearMin}-01-01` : undefined,
        [`${dateField}.lte`]: opts.yearMax ? `${opts.yearMax}-12-31` : undefined,
      },
      revalidate: 21600,
    },
  );
}

export function trendingOnNetflix(region: string, page = 1) {
  // Combine trending feel with Netflix filter — discover sorted by popularity
  return discoverByNetflix("movie", region, page, "popularity.desc");
}

// ---------- Helpers ----------

export function tmdbImage(
  path: string | null | undefined,
  size: "w92" | "w185" | "w342" | "w500" | "w780" | "original" = "w500",
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function titleOf(item: { title?: string; name?: string }): string {
  return item.title ?? item.name ?? "Untitled";
}

export function yearOf(item: {
  release_date?: string;
  first_air_date?: string;
}): string | null {
  const date = item.release_date ?? item.first_air_date;
  if (!date) return null;
  return date.slice(0, 4);
}

/**
 * Filter the watch-providers map down to countries where Netflix is on flatrate.
 * Returns sorted ISO-3166-1 alpha-2 country codes.
 */
export function netflixCountries(
  providers: WatchProvidersResponse,
): { code: string; link: string }[] {
  const out: { code: string; link: string }[] = [];
  for (const [code, entry] of Object.entries(providers.results)) {
    const hasNetflix = entry.flatrate?.some(
      (p) => p.provider_id === NETFLIX_PROVIDER_ID,
    );
    if (hasNetflix) {
      out.push({ code, link: entry.link });
    }
  }
  return out.sort((a, b) => a.code.localeCompare(b.code));
}
