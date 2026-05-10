import { Suspense } from "react";
import Link from "next/link";
import { Hero } from "@/components/Hero";
import { TitleGrid, TitleGridSkeleton } from "@/components/TitleGrid";
import {
  searchMulti,
  discoverByNetflix,
  titleOf,
  yearOf,
  type SearchHit,
  type DiscoverItem,
  type MediaType,
} from "@/lib/tmdb";
import { allNetflixCountries, flagEmoji } from "@/lib/countries";
import type { TitleCardItem } from "@/components/TitleCard";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string }>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  return (
    <div>
      <Hero />

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        {query ? (
          <Suspense
            key={`search-${query}`}
            fallback={<SectionShell title={`Searching for "${query}"…`}><TitleGridSkeleton /></SectionShell>}
          >
            <SearchResults query={query} />
          </Suspense>
        ) : (
          <Suspense
            fallback={<SectionShell title="Trending on Netflix"><TitleGridSkeleton /></SectionShell>}
          >
            <DiscoverSections />
          </Suspense>
        )}
      </section>
    </div>
  );
}

function SectionShell({
  title,
  subtitle,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-14">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && (
          <div className="text-sm text-foreground-muted">{subtitle}</div>
        )}
      </div>
      {children}
    </section>
  );
}

async function SearchResults({ query }: { query: string }) {
  const data = await searchMulti(query);
  const items: TitleCardItem[] = data.results
    .filter(
      (r): r is SearchHit & { media_type: MediaType } =>
        (r.media_type === "movie" || r.media_type === "tv") &&
        Boolean(r.poster_path),
    )
    .slice(0, 30)
    .map((r) => ({
      id: r.id,
      type: r.media_type,
      title: titleOf(r),
      year: yearOf(r),
      poster_path: r.poster_path,
      vote_average: r.vote_average,
    }));

  return (
    <SectionShell
      title={
        <>
          Results for <span className="text-accent">&ldquo;{query}&rdquo;</span>
        </>
      }
      subtitle={`${items.length} ${items.length === 1 ? "title" : "titles"}`}
    >
      {items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-background-elevated/50 p-12 text-center">
          <div className="text-foreground">No movies or shows match that.</div>
          <div className="mt-1 text-sm text-foreground-muted">
            Try a different spelling or a shorter query.
          </div>
        </div>
      ) : (
        <TitleGrid items={items} priorityCount={6} />
      )}
    </SectionShell>
  );
}

async function DiscoverSections() {
  // Pull a few flagship regions in parallel
  const regions = ["US", "JP", "KR", "IN"] as const;
  const [movies, ...byRegion] = await Promise.all([
    discoverByNetflix("movie", "US"),
    ...regions.map((r) => discoverByNetflix("tv", r)),
  ]);

  const moviesItems: TitleCardItem[] = movies.results
    .filter((r) => r.poster_path)
    .slice(0, 18)
    .map((r: DiscoverItem) => ({
      id: r.id,
      type: "movie" as const,
      title: titleOf(r),
      year: yearOf(r),
      poster_path: r.poster_path,
      vote_average: r.vote_average,
    }));

  return (
    <>
      <SectionShell
        title={
          <>
            Trending movies on{" "}
            <span className="bg-gradient-to-br from-accent to-rose-400 bg-clip-text text-transparent">
              Netflix US
            </span>
          </>
        }
        subtitle={
          <Link
            href="/country/US"
            className="rounded-full border border-border px-3 py-1 hover:border-border-strong"
          >
            Browse all →
          </Link>
        }
      >
        <TitleGrid items={moviesItems} priorityCount={6} />
      </SectionShell>

      {regions.map((region, idx) => {
        const items: TitleCardItem[] = byRegion[idx].results
          .filter((r) => r.poster_path)
          .slice(0, 12)
          .map((r: DiscoverItem) => ({
            id: r.id,
            type: "tv" as const,
            title: titleOf(r),
            year: yearOf(r),
            poster_path: r.poster_path,
            vote_average: r.vote_average,
          }));
        return (
          <SectionShell
            key={region}
            title={
              <span className="inline-flex items-center gap-2">
                <span className="text-2xl leading-none" aria-hidden>
                  {flagEmoji(region)}
                </span>
                Hot TV in {countryNameQuick(region)}
              </span>
            }
            subtitle={
              <Link
                href={`/country/${region}`}
                className="rounded-full border border-border px-3 py-1 hover:border-border-strong"
              >
                Browse all →
              </Link>
            }
          >
            <TitleGrid items={items} />
          </SectionShell>
        );
      })}
    </>
  );
}

function countryNameQuick(code: string): string {
  const found = allNetflixCountries().find((c) => c.code === code);
  return found?.name ?? code;
}
