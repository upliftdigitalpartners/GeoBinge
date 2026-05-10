import { notFound } from "next/navigation";
import Link from "next/link";
import {
  discoverByNetflix,
  getGenres,
  titleOf,
  yearOf,
  type DiscoverItem,
} from "@/lib/tmdb";
import { TitleGrid } from "@/components/TitleGrid";
import { CountryPicker } from "@/components/CountryPicker";
import { GenreFilter } from "@/components/GenreFilter";
import { countryName, flagEmoji, isKnownNetflixCountry } from "@/lib/countries";
import type { TitleCardItem } from "@/components/TitleCard";

export const revalidate = 21600;

type Params = Promise<{ code: string }>;
type Search = Promise<{ tab?: string; page?: string; genre?: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { code } = await params;
  const c = code.toUpperCase();
  return {
    title: `What's on Netflix in ${countryName(c)} | GeoBinge`,
    description: `Browse the popular movies and TV shows on Netflix ${countryName(
      c,
    )}.`,
  };
}

export default async function CountryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { code: rawCode } = await params;
  const { tab, page, genre } = await searchParams;
  const code = rawCode.toUpperCase();

  if (!/^[A-Z]{2}$/.test(code)) notFound();

  const activeTab: "movie" | "tv" = tab === "tv" ? "tv" : "movie";
  const pageNum = Math.max(1, Math.min(500, Number(page) || 1));
  const activeGenre = genre ? Number(genre) : null;

  const [data, genreList] = await Promise.all([
    discoverByNetflix(activeTab, code, {
      page: pageNum,
      withGenres: activeGenre ?? undefined,
    }),
    getGenres(activeTab),
  ]);

  const items: TitleCardItem[] = data.results
    .filter((r) => r.poster_path)
    .map((r: DiscoverItem) => ({
      id: r.id,
      type: activeTab,
      title: titleOf(r),
      year: yearOf(r),
      poster_path: r.poster_path,
      vote_average: r.vote_average,
    }));

  const totalPages = Math.min(data.total_pages ?? 1, 500);
  const knownCountry = isKnownNetflixCountry(code);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm uppercase tracking-wider text-foreground-muted">
            Browsing
          </div>
          <h1 className="mt-1 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="mr-3 text-4xl sm:text-5xl" aria-hidden>
              {flagEmoji(code)}
            </span>
            Netflix {countryName(code)}
          </h1>
          {!knownCountry && (
            <div className="mt-2 text-xs text-foreground-muted">
              Heads up: {code} isn&apos;t in our verified Netflix-country list.
              Results may be empty.
            </div>
          )}
        </div>

        <CountryPicker current={code} />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Tabs activeTab={activeTab} code={code} />
      </div>

      <div className="mb-8">
        <GenreFilter
          genres={genreList.genres}
          active={activeGenre}
          countryCode={code}
          tab={activeTab}
        />
      </div>

      <div className="mt-2">
        {items.length > 0 ? (
          <TitleGrid items={items} priorityCount={6} />
        ) : (
          <div className="rounded-2xl border border-border bg-background-elevated/50 p-12 text-center">
            <div className="text-foreground">
              No {activeTab === "movie" ? "movies" : "shows"} found here.
            </div>
            <div className="mt-1 text-sm text-foreground-muted">
              Try a different genre, the other tab, or another country.
            </div>
          </div>
        )}
      </div>

      {items.length > 0 && totalPages > 1 && (
        <Pagination
          code={code}
          tab={activeTab}
          genre={activeGenre}
          page={pageNum}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}

function Tabs({
  activeTab,
  code,
}: {
  activeTab: "movie" | "tv";
  code: string;
}) {
  const tabs = [
    { key: "movie", label: "Movies" },
    { key: "tv", label: "TV Shows" },
  ] as const;
  return (
    <div className="inline-flex rounded-full border border-border bg-background-elevated/60 p-1">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={`/country/${code}?tab=${t.key}`}
          scroll={false}
          className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition ${
            activeTab === t.key
              ? "bg-accent text-white shadow shadow-accent/30"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

function Pagination({
  code,
  tab,
  genre,
  page,
  totalPages,
}: {
  code: string;
  tab: "movie" | "tv";
  genre: number | null;
  page: number;
  totalPages: number;
}) {
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const link = (p: number) => {
    const sp = new URLSearchParams();
    sp.set("tab", tab);
    if (genre !== null) sp.set("genre", String(genre));
    sp.set("page", String(p));
    return `/country/${code}?${sp.toString()}`;
  };
  return (
    <div className="mt-12 flex items-center justify-center gap-3">
      <PaginationLink href={prev ? link(prev) : null}>← Previous</PaginationLink>
      <div className="text-sm text-foreground-muted">
        Page <span className="text-foreground">{page}</span> of {totalPages}
      </div>
      <PaginationLink href={next ? link(next) : null}>Next →</PaginationLink>
    </div>
  );
}

function PaginationLink({
  href,
  children,
}: {
  href: string | null;
  children: React.ReactNode;
}) {
  if (!href) {
    return (
      <span className="cursor-not-allowed rounded-full border border-border px-4 py-1.5 text-sm text-foreground-muted/50">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-full border border-border px-4 py-1.5 text-sm transition hover:border-border-strong hover:bg-background-elevated"
    >
      {children}
    </Link>
  );
}
