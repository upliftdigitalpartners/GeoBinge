import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, Clock, Calendar } from "lucide-react";
import {
  getTitleDetails,
  getTitleDetailsExpanded,
  getWatchProviders,
  netflixCountries,
  tmdbImage,
  titleOf,
  yearOf,
  type MediaType,
} from "@/lib/tmdb";
import { CountryAvailability } from "@/components/CountryAvailability";
import { TrailerButton } from "@/components/TrailerHero";
import { CastRow } from "@/components/CastRow";
import { SimilarTitles } from "@/components/SimilarTitles";

export const revalidate = 21600;

type Params = Promise<{ type: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { type, id } = await params;
  if (type !== "movie" && type !== "tv") return { title: "Not found" };
  try {
    const details = await getTitleDetails(type as MediaType, Number(id));
    const t = titleOf(details);
    return {
      title: `${t} — Where to watch on Netflix | GeoBinge`,
      description: details.overview?.slice(0, 160) ?? undefined,
    };
  } catch {
    return { title: "GeoBinge" };
  }
}

export default async function TitlePage({ params }: { params: Params }) {
  const { type: rawType, id: rawId } = await params;
  if (rawType !== "movie" && rawType !== "tv") notFound();
  const type = rawType as MediaType;
  const id = Number(rawId);
  if (!Number.isFinite(id)) notFound();

  const [details, providers] = await Promise.all([
    getTitleDetailsExpanded(type, id).catch(() => null),
    getWatchProviders(type, id).catch(() => null),
  ]);

  if (!details) notFound();

  const title = titleOf(details);
  const year = yearOf(details);
  const backdrop = tmdbImage(details.backdrop_path, "original");
  const poster = tmdbImage(details.poster_path, "w500");
  const countries = providers ? netflixCountries(providers) : [];

  const runtime =
    type === "movie"
      ? details.runtime
      : details.episode_run_time?.[0];

  return (
    <div className="relative">
      {/* Backdrop hero */}
      <div className="relative h-[55vh] min-h-[380px] w-full overflow-hidden">
        {backdrop ? (
          <Image
            src={backdrop}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-60"
          />
        ) : (
          <div className="h-full w-full bg-background-elevated" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />
      </div>

      <div className="mx-auto -mt-56 max-w-7xl px-4 pb-24 sm:px-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          {/* Poster */}
          <div className="relative mx-auto aspect-[2/3] w-48 shrink-0 overflow-hidden rounded-2xl border border-border-strong shadow-2xl shadow-black/70 md:mx-0 md:w-full">
            {poster ? (
              <Image
                src={poster}
                alt={title}
                fill
                sizes="260px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-background-elevated text-foreground-muted">
                {title}
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-foreground-muted">
              <span className="rounded bg-white/10 px-2 py-0.5 font-semibold text-foreground">
                {type === "movie" ? "Movie" : "TV Series"}
              </span>
              {details.original_language && (
                <span className="font-mono">
                  {details.original_language.toUpperCase()}
                </span>
              )}
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              {title}
            </h1>
            {details.tagline && (
              <p className="mt-2 italic text-foreground-muted">
                {details.tagline}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-foreground-muted">
              {year && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {year}
                </span>
              )}
              {runtime ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {runtime} min{type === "tv" ? "/ep" : ""}
                </span>
              ) : null}
              {details.vote_average > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
                  {details.vote_average.toFixed(1)}{" "}
                  <span className="text-foreground-muted/80">
                    ({details.vote_count.toLocaleString()})
                  </span>
                </span>
              )}
              {type === "tv" && details.number_of_seasons ? (
                <span>
                  {details.number_of_seasons} season
                  {details.number_of_seasons > 1 ? "s" : ""}
                  {details.number_of_episodes
                    ? ` · ${details.number_of_episodes} eps`
                    : ""}
                </span>
              ) : null}
            </div>

            {details.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {details.genres.map((g) => (
                  <span
                    key={g.id}
                    className="rounded-full border border-border bg-background-elevated/60 px-2.5 py-1 text-xs text-foreground-muted"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {details.overview && (
              <p className="mt-6 max-w-3xl text-balance leading-relaxed text-foreground/90">
                {details.overview}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <TrailerButton videos={details.videos?.results} />
            </div>
          </div>
        </div>

        <div className="mt-14">
          <CountryAvailability countries={countries} />
        </div>

        <CastRow cast={details.credits?.cast} />

        <SimilarTitles type={type} items={details.similar?.results} />
      </div>
    </div>
  );
}
