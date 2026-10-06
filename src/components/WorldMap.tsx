import { useMemo } from "react";
import { feature } from "topojson-client";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import countries from "i18n-iso-countries";
import countriesFr from "i18n-iso-countries/langs/fr.json";
import worldTopology from "world-atlas/countries-110m.json";
import { COUNTRY_REGIONS } from "@/lib/countryRegions";

countries.registerLocale(countriesFr);

const WIDTH = 800;
const HEIGHT = 420;

export interface MapCountry {
  code: string;
  name: string;
  region: string;
  path: string;
}

/** Country outlines projected once; countries outside our six regions are left out. */
function useCountries(): MapCountry[] {
  return useMemo(() => {
    const topology = worldTopology as unknown as Topology<{ countries: GeometryCollection }>;
    const all = feature(topology, topology.objects.countries) as FeatureCollection<Geometry>;
    const kept = all.features.flatMap((f: Feature<Geometry>) => {
      const code = f.id ? countries.numericToAlpha2(String(f.id)) : undefined;
      const region = code ? COUNTRY_REGIONS[code] : undefined;
      return code && region ? [{ f, code, region }] : [];
    });
    const projection = geoNaturalEarth1().fitExtent(
      [[4, 4], [WIDTH - 4, HEIGHT - 4]],
      { type: "FeatureCollection", features: kept.map((k) => k.f) }
    );
    const path = geoPath(projection);
    return kept.map(({ f, code, region }) => ({
      code,
      region,
      name: countries.getName(code, "fr") ?? code,
      path: path(f) ?? "",
    }));
  }, []);
}

interface WorldMapProps {
  /** Facts learned per country: the more, the more golden the country. */
  learnedByCountry: Record<string, number>;
  selectedRegions: string[];
  selectedCountry: string | null;
  onSelectCountry: (country: MapCountry) => void;
}

const goldOpacity = (n: number) => (n >= 3 ? 1 : n === 2 ? 0.75 : 0.5);

/** World map: learned countries turn gold, preferred regions are tinted. */
const WorldMap = ({ learnedByCountry, selectedRegions, selectedCountry, onSelectCountry }: WorldMapProps) => {
  const shapes = useCountries();

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label="Carte du monde de vos découvertes">
      {shapes.map((c) => {
        const learned = learnedByCountry[c.code] ?? 0;
        const fill = learned
          ? `hsl(var(--gold) / ${goldOpacity(learned)})`
          : selectedRegions.includes(c.region)
            ? "hsl(var(--primary) / 0.22)"
            : "hsl(var(--muted-foreground) / 0.16)";
        const selected = c.code === selectedCountry;
        return (
          <path
            key={c.code}
            d={c.path}
            fill={fill}
            stroke={selected ? "hsl(var(--accent))" : "hsl(var(--card))"}
            strokeWidth={selected ? 1.6 : 0.5}
            className="cursor-pointer transition-[fill] duration-300 hover:opacity-80"
            onClick={() => onSelectCountry(c)}
          >
            <title>{c.name}</title>
          </path>
        );
      })}
    </svg>
  );
};

export default WorldMap;
