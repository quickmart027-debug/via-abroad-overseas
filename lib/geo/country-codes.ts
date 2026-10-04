/**
 * Map from `Destination.countryCode` (ISO 3166-1 alpha-2, already in
 * data/destinations.ts) to the numeric `id` TopoJSON assigns each country
 * feature (ISO 3166-1 numeric, as a string) in `public/geo/countries-50m.json`.
 *
 * That file is a pinned copy of `world-atlas@2.0.2`'s `countries-50m.json`
 * (https://www.npmjs.com/package/world-atlas), a devDependency used only to
 * source this one static asset — nothing imports `world-atlas` at runtime.
 * The 50m resolution is required rather than 110m: at 110m, Singapore's
 * landmass is too small to appear in the dataset at all, which would make
 * one of our 14 supported destinations unselectable on the map (chips would
 * still work, but the map wouldn't represent it).
 *
 * Only the countries VIA Abroad actually offers are listed — everything
 * else in the TopoJSON renders as inert background geography.
 */
export const SUPPORTED_COUNTRY_TOPOJSON_IDS: Record<string, string> = {
  US: "840",
  CA: "124",
  GB: "826",
  AU: "036",
  NZ: "554",
  DE: "276",
  IE: "372",
  FR: "250",
  IT: "380",
  NL: "528",
  SE: "752",
  SG: "702",
  AE: "784",
  MY: "458",
};

export function getTopojsonIdForCountryCode(countryCode: string): string | undefined {
  return SUPPORTED_COUNTRY_TOPOJSON_IDS[countryCode];
}
