import { TitleCard, type TitleCardItem, TitleCardSkeleton } from "./TitleCard";

export function TitleGrid({
  items,
  priorityCount = 0,
}: {
  items: TitleCardItem[];
  priorityCount?: number;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-background-elevated/50 p-12 text-center text-foreground-muted">
        Nothing here yet.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item, i) => (
        <TitleCard
          key={`${item.type}-${item.id}`}
          item={item}
          index={i}
          priority={i < priorityCount}
        />
      ))}
    </div>
  );
}

export function TitleGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <TitleCardSkeleton key={i} />
      ))}
    </div>
  );
}
