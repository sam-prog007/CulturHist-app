// Region of each country drawn on the world map (Natural Earth 1:110m, via world-atlas),
// keyed by ISO 3166-1 alpha-2 code. Generated from country centroids, then
// checked by hand; same region keys as historical_facts.region.
export const COUNTRY_REGIONS: Record<string, string> = Object.fromEntries(
  Object.entries({
    "africa": "AO BF BI BJ BW CD CF CG CI CM DJ DZ EG EH ER ET GA GH GM GN GQ GW KE LR LS LY MA MG ML MR MW MZ NA NE NG RW SD SL SN SO SS SZ TD TG TN TZ UG ZA ZM ZW",
    "americas": "AR BO BR BS BZ CA CL CO CR CU DO EC FK GL GT GY HN HT JM MX NI PA PE PR PY SR SV TT US UY VE",
    "asia": "AF AM AZ BD BN BT CN ID IN JP KG KH KP KR KZ LA LK MM MN MY NP PH PK TH TJ TL TM TW UZ VN",
    "europe": "AL AT BA BE BG BY CH CY CZ DE DK EE ES FI FR GB GE GR HR HU IE IS IT LT LU LV MD ME MK NL NO PL PT RO RS RU SE SI SK UA",
    "middle-east": "AE IL IQ IR JO KW LB OM PS QA SA SY TR YE",
    "oceania": "AU FJ NC NZ PG SB VU",
  }).flatMap(([region, codes]) => codes.split(" ").map((code) => [code, region]))
);
