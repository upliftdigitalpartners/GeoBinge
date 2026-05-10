import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-foreground">
        <Compass className="h-6 w-6" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">Lost in the catalog</h2>
      <p className="mt-2 text-sm text-foreground-muted">
        That page doesn&apos;t exist. Maybe Netflix pulled it.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
      >
        Back home
      </Link>
    </div>
  );
}
