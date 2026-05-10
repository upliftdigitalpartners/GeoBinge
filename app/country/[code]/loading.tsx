import { TitleGridSkeleton } from "@/components/TitleGrid";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14">
      <div className="mb-8">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton mt-3 h-12 w-2/3 rounded-lg" />
      </div>
      <div className="skeleton mb-8 h-9 w-48 rounded-full" />
      <TitleGridSkeleton />
    </div>
  );
}
