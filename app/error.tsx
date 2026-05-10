"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const msg = error.message ?? "";
  const isMissingKey = msg.includes("TMDB_API_KEY is not set");
  const isAuth = /TMDB 401/.test(msg);
  const isFatal = isMissingKey || isAuth;

  let title = "Something broke.";
  let body = "The page failed to load. Try again, or refresh.";
  if (isMissingKey) {
    title = "Missing TMDB API key";
    body =
      "Add TMDB_API_KEY to .env.local (or your Vercel project env vars). Get one free at themoviedb.org → Settings → API.";
  } else if (isAuth) {
    title = "TMDB rejected the API key";
    body =
      "The key is invalid, revoked, or rotated. Generate a new one at themoviedb.org → Settings → API and update your env var.";
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-foreground-muted">{body}</p>
      {!isFatal && (
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      )}
    </div>
  );
}
