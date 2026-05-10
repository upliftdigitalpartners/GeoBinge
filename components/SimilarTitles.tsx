import { TitleGrid } from "./TitleGrid";
import { titleOf, yearOf, type DiscoverItem, type MediaType } from "@/lib/tmdb";
import type { TitleCardItem } from "./TitleCard";

export function SimilarTitles({
  type,
  items,
}: {
  type: MediaType;
  items: DiscoverItem[] | undefined;
}) {
  if (!items || items.length === 0) return null;
  const cards: TitleCardItem[] = items
    .filter((r) => r.poster_path)
    .slice(0, 12)
    .map((r) => ({
      id: r.id,
      type,
      title: titleOf(r),
      year: yearOf(r),
      poster_path: r.poster_path,
      vote_average: r.vote_average,
    }));
  if (cards.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-5 text-xl font-semibold tracking-tight">
        More like this
      </h2>
      <TitleGrid items={cards} />
    </section>
  );
}
