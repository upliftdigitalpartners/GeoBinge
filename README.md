# GeoBinge

Search any movie or TV show and instantly see every country where Netflix has it. Built for the "let me just switch my VPN real quick" workflow.

- Live search with debounced URL state (`?q=...`) and `⌘K` focus
- **Smart search** at `/smart` — describe a vibe in plain English (*"feel-good Korean dramas"*, *"90s sci-fi on Netflix Japan"*) → Groq's Llama 3.3 70B parses it into structured filters → TMDB returns matches
- Title detail page with **trailer modal**, **cast row**, **similar titles**, and a country grid showing every Netflix region carrying the title — flag, name, "Browse" and direct "Open on Netflix" deep link
- Browse-by-country page with Movies / TV tabs, **genre filter chips**, and pagination (60+ Netflix regions)
- **PWA** — installable on iOS/Android home screen, generated icons, dark theme color
- Smooth Framer Motion entrances, hover micro-interactions, gradient backdrops, skeleton loaders
- Server Components + Next.js fetch cache → fast & free (well under TMDB rate limits)

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Framer Motion + lucide-react icons
- TMDB API (free) — provider-agnostic wrapper in `lib/tmdb.ts` so swapping in Streaming Availability API later is straightforward
- Groq API (free tier) for smart search — only needed if you want `/smart`

## Setup

```bash
# 1. Install
npm install

# 2. Get a free TMDB v3 API key
#    https://www.themoviedb.org/settings/api → "Developer" → any reason

# 3. Drop it in
cp .env.example .env.local
# edit .env.local and paste the key

# 4. Run
npm run dev
```

Open <http://localhost:3000>.

## Deploy to Vercel (free)

1. Push this repo to GitHub.
2. Go to <https://vercel.com/new>, import the repo.
3. Under **Environment Variables**, add `TMDB_API_KEY=...`.
4. Deploy. Subsequent pushes auto-deploy.

That's it — no database, no auth, no paid services.

## How the data works

Netflix has no public API. We use **TMDB's `/watch/providers` endpoint**, which is community-maintained and updated within ~24h of catalog changes. The Netflix provider ID in TMDB is `8`.

- `lib/tmdb.ts` wraps the TMDB API with Next.js `fetch` caching (1h–24h depending on volatility).
- `netflixCountries(...)` filters the provider response down to countries where Netflix is on `flatrate` (i.e., included with subscription, not rent/buy).

If you ever want richer or fresher per-country data (e.g., full Netflix catalog browsing, "newly added" feeds), swap `lib/tmdb.ts` calls for the [Streaming Availability API](https://www.movieofthenight.com/about/api). The component layer doesn't care which provider you use.

## Project layout

```
app/
  layout.tsx                       # dark theme shell + ambient glow
  page.tsx                         # home: hero + search results / discovery sections
  title/[type]/[id]/page.tsx       # title detail + country availability
  country/[code]/page.tsx          # browse what's on Netflix in country X
  loading.tsx, error.tsx, not-found.tsx
components/
  Header, SearchBar, TitleCard, TitleGrid, CountryAvailability, CountryPicker, Hero
lib/
  tmdb.ts        # TMDB client + Netflix helpers
  countries.ts   # ISO code → name + flag emoji
  utils.ts
```

## Notes

- This product uses the TMDB API but is not endorsed or certified by TMDB. (Required attribution.)
- "Open on Netflix" links go to the country-specific Netflix URL TMDB returns — clicking from outside that region usually redirects you to Netflix's "not available" page until your VPN is connected.
