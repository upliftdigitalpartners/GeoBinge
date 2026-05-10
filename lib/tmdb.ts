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

export function getWatchProviders(type: MediaType, id: number) {
  return tmdbFetch<WatchProvidersResponse>(`/${type}/${id}/watch/providers`, {
    revalidate: 21600, // 6 hours
  });
}

export function discoverByNetflix(
  type: MediaType,
  region: string,
  page = 1,
  sort: "popularity.desc" | "vote_average.desc" | "primary_release_date.desc" = "popularity.desc",
) {
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
