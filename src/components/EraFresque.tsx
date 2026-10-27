import { useEffect, useMemo, useRef, useState } from "react";
import { Check, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatYear } from "@/lib/dates";
import type { Era, MapFact } from "@/lib/progress";

interface EraFresqueProps {
  eras: Era[];
  facts: MapFact[];
  learnedIds: Set<string>;
  lastLearnedId: string | null;
  isSelected: (era: Era) => boolean;
  onToggle: (era: Era) => void;
  onOpenFact: (fact: MapFact, era: Era) => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const LANES = 4;
/** Two dots closer than this (share of the axis) go on different lanes. */
const MIN_GAP = 0.06;
/**
 * Share of a dot's position given by its date; the rest comes from its rank,
 * which spreads crowded decades without changing the order.
 */
const TIME_WEIGHT = 0.4;

/** Short era names for the mini-map: "Époque contemporaine" → "Contemp.". */
const shortName = (name: string) => {
  const bare = name.replace(/^Époque /, "");
  const label = bare.charAt(0).toUpperCase() + bare.slice(1);
  return label.length > 9 ? `${label.slice(0, 7)}.` : label;
};

const span = (era: Era) =>
  era.startYear === null
    ? era.endYear === null
      ? ""
      : `Jusqu'à ${formatYear(era.endYear)}`
    : era.endYear === null
      ? `Depuis ${formatYear(era.startYear)}`
      : `${formatYear(era.startYear)} – ${formatYear(era.endYear)}`;

interface Dot {
  fact: MapFact;
  /** 0 (left, oldest) to 1 (right, most recent). */
  x: number;
  lane: number;
}

/**
 * Where each fact of an era sits on its axis. Prehistory spans millions of
 * years: it uses a log scale of "years ago", so that Lucy and Lascaux do not
 * end up on the same pixel.
 */
function placeDots(era: Era, facts: MapFact[]): { dots: Dot[]; from: number; to: number } {
  const dated = facts.filter((f) => f.year !== null) as (MapFact & { year: number })[];
  const years = dated.map((f) => f.year);
  const from = era.startYear ?? Math.min(...years, era.endYear ?? CURRENT_YEAR);
  const to = era.endYear ?? CURRENT_YEAR;
  const logScale = era.startYear === null;
  const position = (year: number) => {
    if (logScale) {
      const age = (y: number) => Math.max(CURRENT_YEAR - y, 1);
      const [oldest, newest] = [Math.log(age(from)), Math.log(age(to))];
      return oldest === newest ? 0.5 : (oldest - Math.log(age(year))) / (oldest - newest);
    }
    return to === from ? 0.5 : (year - from) / (to - from);
  };

  const lastX = Array<number>(LANES).fill(-Infinity);
  const sorted = dated
    .map((fact) => ({ fact, t: Math.min(1, Math.max(0, position(fact.year))) }))
    .sort((a, b) => a.t - b.t);
  const dots = sorted
    .map(({ fact, t }, rank) => {
      const r = sorted.length > 1 ? rank / (sorted.length - 1) : 0.5;
      return { fact, x: 0.04 + 0.92 * (TIME_WEIGHT * t + (1 - TIME_WEIGHT) * r) };
    })
    .map(({ fact, x }) => {
      let lane = lastX.findIndex((last) => x - last >= MIN_GAP);
      if (lane === -1) lane = lastX.indexOf(Math.min(...lastX));
      lastX[lane] = x;
      return { fact, x, lane };
    });
  return { dots, from, to };
}

/**
 * The timeline ("frise"): one panel per era, side by side, swiped like cards.
 * Each fact is a dot at its date, golden once learned; a mini-map on top
 * jumps from era to era.
 */
const EraFresque = ({ eras, facts, learnedIds, lastLearnedId, isSelected, onToggle, onOpenFact }: EraFresqueProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);

  const factsByEra = useMemo(() => {
    const map = new Map<string, MapFact[]>();
    for (const f of facts) if (f.periodId) map.set(f.periodId, [...(map.get(f.periodId) ?? []), f]);
    return map;
  }, [facts]);

  const lastEraIndex = useMemo(() => {
    const last = facts.find((f) => f.id === lastLearnedId);
    return Math.max(0, eras.findIndex((e) => e.id === last?.periodId));
  }, [eras, facts, lastLearnedId]);

  const scrollToEra = (index: number, smooth = true) => {
    const scroller = scrollerRef.current;
    const panel = panelRefs.current[index];
    if (!scroller || !panel) return;
    scroller.scrollTo({
      left: panel.offsetLeft - (scroller.clientWidth - panel.clientWidth) / 2,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  // Open on the era of the last fact learned: "vous êtes ici".
  useEffect(() => {
    scrollToEra(lastEraIndex, false);
    setActive(lastEraIndex);
    // Only when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    let nearest = 0;
    panelRefs.current.forEach((panel, i) => {
      if (!panel) return;
      const distance = Math.abs(panel.offsetLeft + panel.clientWidth / 2 - center);
      const best = panelRefs.current[nearest];
      if (best && distance < Math.abs(best.offsetLeft + best.clientWidth / 2 - center)) nearest = i;
    });
    setActive(nearest);
  };

  return (
    <div className="space-y-3">
      <nav aria-label="Époques" className="flex gap-1">
        {eras.map((era, i) => (
          <button
            key={era.id}
            type="button"
            onClick={() => scrollToEra(i)}
            aria-current={i === active ? "true" : undefined}
            aria-label={era.name}
            className="group flex min-w-0 flex-1 flex-col gap-1"
          >
            <span
              className={cn(
                "relative h-2 overflow-hidden rounded-full bg-secondary ring-offset-2 ring-offset-background smooth-transition",
                i === active && "ring-2 ring-primary"
              )}
            >
              <span className="absolute inset-y-0 left-0 rounded-full bg-gold" style={{ width: `${era.total ? (era.learned / era.total) * 100 : 0}%` }} />
            </span>
            <span className={cn("truncate text-[10px] font-medium", i === active ? "text-foreground" : "text-muted-foreground")}>
              {shortName(era.name)}
            </span>
          </button>
        ))}
      </nav>

      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {eras.map((era, i) => {
          const { dots, from, to } = placeDots(era, factsByEra.get(era.id) ?? []);
          const selected = isSelected(era);
          const ratio = era.total ? era.learned / era.total : 0;
          return (
            <section
              key={era.id}
              ref={(el) => (panelRefs.current[i] = el)}
              aria-label={era.name}
              className={cn(
                "w-[85%] shrink-0 snap-center space-y-3 rounded-2xl border-2 bg-card p-4 smooth-transition",
                selected ? "border-primary" : "border-transparent card-shadow"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-serif text-xl font-bold leading-tight">{era.name}</h3>
                  <p className="text-xs text-muted-foreground">{span(era)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggle(era)}
                  aria-pressed={selected}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold smooth-transition",
                    selected ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                  )}
                >
                  {selected && <Check className="h-3.5 w-3.5" />}
                  {selected ? "Choisie" : "Choisir"}
                </button>
              </div>

              <div className="relative h-36" role="group" aria-label={`Faits de l'époque ${era.name}`}>
                <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-border via-primary/30 to-border" aria-hidden="true" />
                {dots.map(({ fact, x, lane }) => {
                  const learned = learnedIds.has(fact.id);
                  const here = fact.id === lastLearnedId;
                  return (
                    <button
                      key={fact.id}
                      type="button"
                      onClick={() => onOpenFact(fact, era)}
                      aria-label={`${fact.title}${learned ? "" : " (à découvrir)"}`}
                      title={fact.title}
                      className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                      style={{ left: `${x * 100}%`, top: `${16 + lane * 22}%` }}
                    >
                      {here && (
                        <span className="absolute -top-5 flex items-center gap-0.5 whitespace-nowrap rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold text-accent-foreground">
                          <MapPin className="h-2.5 w-2.5" /> Vous
                        </span>
                      )}
                      <span
                        className={cn(
                          "block rounded-full border-2 border-card smooth-transition",
                          learned ? "h-4 w-4 bg-gold shadow-md" : "h-3 w-3 bg-muted-foreground/30",
                          here && "ring-2 ring-accent ring-offset-1"
                        )}
                      />
                    </button>
                  );
                })}
                {dots.length === 0 && (
                  <p className="absolute inset-x-0 top-1/2 mt-3 text-center text-xs text-muted-foreground">Pas encore de faits pour cette époque</p>
                )}
              </div>

              <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                <span>{dots.length ? formatYear(from) : ""}</span>
                <span>{era.endYear === null ? "Aujourd'hui" : formatYear(to)}</span>
              </div>

              <div className="space-y-1">
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${ratio * 100}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {era.total === 0
                    ? "Bientôt des faits pour cette époque"
                    : `${era.learned}/${era.total} ${era.total > 1 ? "faits découverts" : "fait découvert"} · touchez un point`}
                </p>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default EraFresque;
