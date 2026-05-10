#!/usr/bin/env node
/**
 * Hits a handful of key URLs against a deployed GeoBinge instance,
 * fails the process if any returned an error page (HTTP non-2xx, OR
 * a 200 page that rendered the error.tsx / not-found boundary).
 *
 * Usage: node .github/smoke-test.mjs https://geo-binge.vercel.app
 */

const baseUrl = process.argv[2]?.replace(/\/+$/, "");
if (!baseUrl) {
  console.error("Usage: smoke-test.mjs <base-url>");
  process.exit(1);
}

// Strings that should NEVER appear on a healthy page.
// Note: we don't check "Lost in the catalog" because Next.js bundles the
// not-found template into every page's RSC payload for client navigation.
// The `mustContain` check below catches actual not-found renders.
const ERROR_MARKERS = [
  "Something broke",
  "Missing TMDB API key",
  "TMDB rejected the API key",
];

const checks = [
  {
    name: "Home page",
    path: "/",
    mustContain: ["GeoBinge", "Where can I watch"],
  },
  {
    name: "Smart search page",
    path: "/smart",
    mustContain: ["Just say what you want"],
  },
  {
    name: "Country browse (US, movies)",
    path: "/country/US",
    mustContain: ["Netflix United States"],
  },
  {
    name: "Country browse (US, TV with genre)",
    path: "/country/US?tab=tv",
    mustContain: ["Netflix United States"],
  },
  {
    name: "Title detail (movie)",
    // The Godfather — TMDB id 238, extremely stable.
    path: "/title/movie/238",
    mustContain: ["GeoBinge"],
  },
  {
    name: "PWA manifest",
    path: "/manifest.webmanifest",
    mustContain: ["GeoBinge"],
    json: true,
  },
];

let failures = 0;

for (const c of checks) {
  const url = baseUrl + c.path;
  process.stdout.write(`→ ${c.name.padEnd(36, " ")} ${c.path.padEnd(28, " ")} `);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "geobinge-smoke-test" },
    });
    if (!res.ok) {
      console.log(`✗ HTTP ${res.status}`);
      failures++;
      continue;
    }
    const body = await res.text();

    if (c.json) {
      try {
        JSON.parse(body);
      } catch {
        console.log("✗ invalid JSON");
        failures++;
        continue;
      }
    }

    let bodyOk = true;
    for (const marker of ERROR_MARKERS) {
      if (body.includes(marker)) {
        console.log(`✗ contains "${marker}"`);
        failures++;
        bodyOk = false;
        break;
      }
    }
    if (!bodyOk) continue;

    for (const required of c.mustContain ?? []) {
      if (!body.includes(required)) {
        console.log(`✗ missing required text "${required}"`);
        failures++;
        bodyOk = false;
        break;
      }
    }
    if (!bodyOk) continue;

    console.log("✓ ok");
  } catch (err) {
    console.log(`✗ ${err instanceof Error ? err.message : String(err)}`);
    failures++;
  }
}

console.log("");
if (failures > 0) {
  console.error(`${failures} check(s) failed against ${baseUrl}`);
  process.exit(1);
}
console.log(`All ${checks.length} smoke tests passed against ${baseUrl}`);
