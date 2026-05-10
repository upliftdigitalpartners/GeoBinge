/**
 * ISO 3166-1 alpha-2 country code → display name + flag emoji.
 * Flag emoji is computed from the code (regional indicator symbols),
 * so this works for any 2-letter code without a lookup table for flags.
 */

export function flagEmoji(code: string): string {
  const cc = code.toUpperCase();
  if (cc.length !== 2) return "🏳️";
  const A = 0x1f1e6;
  const a = "A".charCodeAt(0);
  return String.fromCodePoint(A + cc.charCodeAt(0) - a, A + cc.charCodeAt(1) - a);
}

// A curated list of countries Netflix operates in. Used for the country picker.
// (Smaller than ISO 3166 — Netflix isn't in every country.)
export const NETFLIX_COUNTRIES: Record<string, string> = {
  AE: "United Arab Emirates",
  AR: "Argentina",
  AT: "Austria",
  AU: "Australia",
  BE: "Belgium",
  BG: "Bulgaria",
  BR: "Brazil",
  CA: "Canada",
  CH: "Switzerland",
  CL: "Chile",
  CO: "Colombia",
  CZ: "Czech Republic",
  DE: "Germany",
  DK: "Denmark",
  EC: "Ecuador",
  EE: "Estonia",
  EG: "Egypt",
  ES: "Spain",
  FI: "Finland",
  FR: "France",
  GB: "United Kingdom",
  GR: "Greece",
  HK: "Hong Kong",
  HR: "Croatia",
  HU: "Hungary",
  ID: "Indonesia",
  IE: "Ireland",
  IL: "Israel",
  IN: "India",
  IS: "Iceland",
  IT: "Italy",
  JP: "Japan",
  KR: "South Korea",
  LT: "Lithuania",
  LV: "Latvia",
  MA: "Morocco",
  MX: "Mexico",
  MY: "Malaysia",
  NG: "Nigeria",
  NL: "Netherlands",
  NO: "Norway",
  NZ: "New Zealand",
  PE: "Peru",
  PH: "Philippines",
  PK: "Pakistan",
  PL: "Poland",
  PT: "Portugal",
  RO: "Romania",
  RS: "Serbia",
  SA: "Saudi Arabia",
  SE: "Sweden",
  SG: "Singapore",
  SK: "Slovakia",
  TH: "Thailand",
  TR: "Turkey",
  TW: "Taiwan",
  UA: "Ukraine",
  US: "United States",
  VE: "Venezuela",
  VN: "Vietnam",
  ZA: "South Africa",
};

export function countryName(code: string): string {
  const upper = code.toUpperCase();
  if (NETFLIX_COUNTRIES[upper]) return NETFLIX_COUNTRIES[upper];
  // Fallback: try Intl.DisplayNames if available at runtime
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    return dn.of(upper) ?? upper;
  } catch {
    return upper;
  }
}

export function isKnownNetflixCountry(code: string): boolean {
  return code.toUpperCase() in NETFLIX_COUNTRIES;
}

export function allNetflixCountries(): { code: string; name: string; flag: string }[] {
  return Object.entries(NETFLIX_COUNTRIES)
    .map(([code, name]) => ({ code, name, flag: flagEmoji(code) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
