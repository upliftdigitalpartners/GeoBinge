"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [value, setValue] = useState(initial);
  const [lastSyncedInitial, setLastSyncedInitial] = useState(initial);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep input in sync if URL changes externally (back button, link click).
  // Pattern: derive on render rather than calling setState in an effect.
  if (initial !== lastSyncedInitial) {
    setLastSyncedInitial(initial);
    setValue(initial);
  }

  // Cmd/Ctrl-K to focus
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Debounced live search → push /?q=
  useEffect(() => {
    const trimmed = value.trim();
    const t = setTimeout(() => {
      const target = trimmed
        ? `/?q=${encodeURIComponent(trimmed)}`
        : pathname === "/"
          ? "/"
          : pathname;
      const current =
        pathname + (params.toString() ? `?${params.toString()}` : "");
      if (target !== current) {
        startTransition(() => router.replace(target, { scroll: false }));
      }
    }, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = value.trim();
        if (trimmed) router.push(`/?q=${encodeURIComponent(trimmed)}`);
      }}
      className="group relative flex items-center"
    >
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-foreground-muted transition group-focus-within:text-foreground" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search a movie or show…"
        aria-label="Search Netflix titles"
        className="w-full rounded-full border border-border bg-background-elevated/80 py-2 pl-9 pr-20 text-sm text-foreground placeholder:text-foreground-muted outline-none ring-0 backdrop-blur transition focus:border-border-strong focus:bg-background-elevated"
        autoComplete="off"
        spellCheck={false}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="absolute right-12 inline-flex h-6 w-6 items-center justify-center rounded-full text-foreground-muted hover:bg-white/10 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      <kbd className="absolute right-3 hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-foreground-muted sm:inline-block">
        ⌘K
      </kbd>
    </form>
  );
}
