import { TitleGridSkeleton } from "@/components/TitleGrid";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-32 sm:px-6">
      <div className="skeleton mb-8 h-10 w-72 rounded-lg" />
      <TitleGridSkeleton />
    </div>
  );
}
