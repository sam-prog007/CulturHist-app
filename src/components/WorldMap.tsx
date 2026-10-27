import { useEffect, useMemo, useRef, useState } from "react";
import { feature } from "topojson-client";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { select } from "d3-selection";
import "d3-transition";
import { zoom as d3Zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import countries from "i18n-iso-countries";
import countriesFr from "i18n-iso-countries/langs/fr.json";
import worldTopology from "world-atlas/countries-110m.json";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { COUNTRY_REGIONS } from "@/lib/countryRegions";

countries.registerLocale(countriesFr);

const WIDTH = 800;
const HEIGHT = 420;
const MAX_ZOOM = 12;
/** From this zoom on, discovered countries show how many facts they hold. */
const COUNTS_FROM_ZOOM = 2.5;

type Point = [number, number];

export interface MapCountry {
  code: string;
  name: string;
  region: string;
  path: string;
  centroid: Point;
  bounds: [Point, Point];
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
      centroid: path.centroid(f) as Point,
      bounds: path.bounds(f) as [Point, Point],
    }));
  }, []);
}

/** The bounding box of several countries. */
const unionBounds = (shapes: MapCountry[]): [Point, Point] =>
  shapes.reduce<[Point, Point]>(
    ([[x0, y0], [x1, y1]], { bounds: [[a0, b0], [a1, b1]] }) => [
      [Math.min(x0, a0), Math.min(y0, b0)],
      [Math.max(x1, a1), Math.max(y1, b1)],
    ],
    [[Infinity, Infinity], [-Infinity, -Infinity]]
  );

/** The transform that frames a box in the map, with a margin. */
const frame = ([[x0, y0], [x1, y1]]: [Point, Point]) => {
  const k = Math.min(MAX_ZOOM, Math.max(1, 0.85 / Math.max((x1 - x0) / WIDTH, (y1 - y0) / HEIGHT)));
  return zoomIdentity.translate(WIDTH / 2 - (k * (x0 + x1)) / 2, HEIGHT / 2 - (k * (y0 + y1)) / 2).scale(k);
};

interface WorldMapProps {
  /** Facts learned per country: the more, the more golden the country. */
  learnedByCountry: Record<string, number>;
  selectedRegions: string[];
  selectedCountry: string | null;
  onSelectCountry: (country: MapCountry) => void;
  /** Region to fly to, e.g. right after the user picked it. */
  focusRegion?: string | null;
}

const goldOpacity = (n: number) => (n >= 3 ? 1 : n === 2 ? 0.75 : 0.5);

/**
 * World map: learned countries turn gold, preferred regions are tinted.
 * Pinch or scroll to zoom, drag to move, double-tap to zoom in; tap a country to open it.
 */
const WorldMap = ({ learnedByCountry, selectedRegions, selectedCountry, onSelectCountry, focusRegion }: WorldMapProps) => {
  const shapes = useCountries();
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity);

  useEffect(() => {
    const svg = select(svgRef.current!);
    const behavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, MAX_ZOOM])
      .extent([[0, 0], [WIDTH, HEIGHT]])
      .translateExtent([[0, 0], [WIDTH, HEIGHT]])
      .on("zoom", (event) => setTransform(event.transform));
    svg.call(behavior);
    zoomRef.current = behavior;
    return () => {
      svg.on(".zoom", null);
    };
  }, []);

  const animateTo = (target: ZoomTransform) => {
    if (!svgRef.current || !zoomRef.current) return;
    select(svgRef.current).transition().duration(750).call(zoomRef.current.transform, target);
  };
  const zoomBy = (factor: number) => {
    if (!svgRef.current || !zoomRef.current) return;
    select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, factor);
  };

  useEffect(() => {
    if (!focusRegion) return;
    const inRegion = shapes.filter((s) => s.region === focusRegion);
    if (inRegion.length) animateTo(frame(unionBounds(inRegion)));
    // Fly only when the asked region changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRegion]);

  const k = transform.k;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full cursor-grab touch-none select-none active:cursor-grabbing"
        role="img"
        aria-label="Carte du monde de vos découvertes"
      >
        <g transform={transform.toString()}>
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
                strokeWidth={selected ? 1.8 : 0.5}
                vectorEffect="non-scaling-stroke"
                className="cursor-pointer transition-[fill] duration-500 hover:opacity-80"
                onClick={() => onSelectCountry(c)}
              >
                <title>{c.name}</title>
              </path>
            );
          })}
          {k >= COUNTS_FROM_ZOOM &&
            shapes
              .filter((c) => learnedByCountry[c.code])
              .map((c) => (
                <g key={c.code} transform={`translate(${c.centroid[0]} ${c.centroid[1]}) scale(${1 / k})`} className="pointer-events-none">
                  <circle r={9} fill="hsl(var(--accent))" stroke="hsl(var(--card))" strokeWidth={1.5} />
                  <text textAnchor="middle" dy="0.35em" fontSize={10} fontWeight={700} fill="hsl(var(--accent-foreground))">
                    {learnedByCountry[c.code]}
                  </text>
                </g>
              ))}
        </g>
      </svg>

      <div className="absolute bottom-1 right-1 flex flex-col gap-1">
        {[
          { label: "Zoomer", icon: Plus, onClick: () => zoomBy(1.8), disabled: k >= MAX_ZOOM },
          { label: "Dézoomer", icon: Minus, onClick: () => zoomBy(1 / 1.8), disabled: k <= 1 },
          { label: "Recentrer la carte", icon: RotateCcw, onClick: () => animateTo(zoomIdentity), disabled: k === 1 && !transform.x && !transform.y },
        ].map(({ label, icon: Icon, onClick, disabled }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            onClick={onClick}
            disabled={disabled}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-card/90 shadow-md smooth-transition hover:bg-card disabled:opacity-40"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default WorldMap;
