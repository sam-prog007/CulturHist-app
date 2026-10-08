import type { Question, QuizFact } from "@/lib/quiz";

/*
 * Quiz questions built from the facts. Two rules for every kind of question:
 * the answer never shows in the question (no "In which region did the French
 * Revolution happen? Europe"), and the wrong answers are close to the right
 * one (same region or era, nearby dates, neighbouring countries) so that
 * finding it takes knowing it.
 */

const shuffle = <T,>(items: T[]) => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const titleOf = (f: QuizFact) => f.title_fr || f.title;
const descriptionOf = (f: QuizFact) => f.description_fr || f.description;
const dateOf = (f: QuizFact) => f.date_text_fr || f.date_text || "";

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const tokens = (text: string) => normalize(text).match(/[a-z0-9]+/g) ?? [];

/** Words that say nothing about an event: never hidden, never compared. */
const FUNCTION_WORDS = new Set(
  "le la les l un une des de du d et en au aux a par sur dans avec pour sous vers son sa ses leur leurs qui que qu est sont se s ne n ce cet cette ces il elle ils elles on y".split(
    " "
  )
);

/** Common words that are hidden like the others but too vague to tell two events apart. */
const COMMON_WORDS = new Set(
  "premier premiere premiers premieres plus grand grande grands grandes ancien ancienne anciens anciennes nouveau nouvelle tres connu connus connue".split(
    " "
  )
);

/** The words of a title worth hiding: every content word, and short proper names like "Ur". */
const titleTerms = (title: string) =>
  [...title.matchAll(/[\p{L}\p{N}]+/gu)]
    .map(([word]) => ({ word, norm: normalize(word) }))
    .filter(({ word, norm }) => !FUNCTION_WORDS.has(norm) && (norm.length >= 3 || /^\p{Lu}/u.test(word)))
    .map(({ norm }) => norm);

/** Same word, give or take an ending ("égyptien" / "égyptienne", "vol" / "vols"). */
const sameWord = (token: string, term: string) =>
  term.length >= 5
    ? token.startsWith(term.slice(0, 5))
    : token === term || token === `${term}s` || token === `${term}e` || token === `${term}es` || token === `${term}x`;

/** Distinctive words of a title, used to keep an option the text hints at out of the choices. */
const distinctiveWords = (title: string) =>
  titleTerms(title).filter((t) => t.length >= 4 && !COMMON_WORDS.has(t));

const hasYearInside = (text: string) => /\d{3,}/.test(text);

/** Picks `n` items, preferring those that satisfy the earlier predicates. */
function pick<T>(items: T[], n: number, ...prefer: ((item: T) => boolean)[]): T[] {
  const rank = (item: T) => {
    const i = prefer.findIndex((p) => p(item));
    return i === -1 ? prefer.length : i;
  };
  return shuffle(items)
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, n);
}

function makeQuestion(
  id: string,
  parts: Pick<Question, "question" | "context" | "explanation">,
  correct: string,
  wrong: string[]
): Question | null {
  const choices = [...new Set(wrong.filter((w) => w && w !== correct))].slice(0, 3);
  if (choices.length < 3) return null;
  const options = shuffle([correct, ...choices]);
  return { id, ...parts, options, correctAnswer: options.indexOf(correct) };
}

/** The fact's description, which states its date and place: shown once the player has answered. */
const explain = (f: QuizFact) => descriptionOf(f);

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

const CURRENT_YEAR = new Date().getFullYear();

/**
 * How precise the fact's date is, which decides how its options are written:
 * "il y a 17 000 ans", a century, "vers 2560 av. J.-C." or an exact year.
 * Ranges ("Entre 1250 et 1500", "Avant 900 av. J.-C.") are left out of date questions.
 */
type Precision = "ago" | "century" | "approx" | "exact" | "range";

const precisionOf = (f: QuizFact): Precision => {
  const date = normalize(dateOf(f));
  if (/^il y a/.test(date)) return "ago";
  if (/entre|avant|apres/.test(date)) return "range";
  if (/siecle/.test(date)) return "century";
  if (/vers|environ|annees/.test(date)) return "approx";
  return "exact";
};

const age = (year: number) => CURRENT_YEAR - year;

/** Two dates far enough apart that ordering them is a fair question. */
const farApart = (a: QuizFact, b: QuizFact) => {
  const older = Math.min(a.year!, b.year!);
  let gap = Math.max(20, age(older) * 0.05);
  const precisions = [precisionOf(a), precisionOf(b)];
  if (precisions.includes("approx")) gap *= 1.5;
  if (precisions.includes("century")) gap = Math.max(gap, 150);
  return Math.abs(a.year! - b.year!) >= gap;
};

const datable = (f: QuizFact) => f.year != null && precisionOf(f) !== "range";

const niceStep = (n: number) => {
  const pow = 10 ** Math.floor(Math.log10(Math.max(1, n)));
  const m = n / pow;
  return pow * (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10);
};

const groupThousands = (n: number) => (n >= 10000 ? n.toLocaleString("fr-FR") : String(n));

const formatYears = (years: number[], approximate: boolean) => {
  const mixedEras = years.some((y) => y < 0);
  return years.map((y) => {
    const text =
      y < 0 ? `${groupThousands(-y)} av. J.-C.` : mixedEras ? `${y} apr. J.-C.` : groupThousands(y);
    return approximate ? `Vers ${text}` : text;
  });
};

/** Rounds to two significant digits, like the "il y a environ 17 000 ans" of the facts. */
const roundAge = (n: number) => {
  const pow = 10 ** Math.max(0, Math.floor(Math.log10(n)) - 1);
  return Math.round(n / pow) * pow;
};

const formatAge = (n: number) =>
  n >= 1_000_000
    ? `Il y a environ ${(n / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} million${n >= 2_000_000 ? "s" : ""} d'années`
    : `Il y a environ ${n.toLocaleString("fr-FR")} ans`;

const ROMAN: [number, string][] = [
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];
const toRoman = (n: number) => {
  let out = "";
  for (const [value, letters] of ROMAN) {
    while (n >= value) {
      out += letters;
      n -= value;
    }
  }
  return out;
};
const fromRoman = (text: string) => {
  const values: Record<string, number> = { I: 1, V: 5, X: 10, L: 50 };
  let total = 0;
  for (let i = 0; i < text.length; i++) {
    const v = values[text[i]];
    total += v < (values[text[i + 1]] ?? 0) ? -v : v;
  }
  return total;
};

/** Century as written in the fact ("XIVe siècle"), negative before Christ. */
const centuryOf = (f: QuizFact) => {
  const match = dateOf(f).match(/\b([IVXL]+)e siècle/);
  const bc = /av\. J\.-C\./.test(dateOf(f));
  if (match) return fromRoman(match[1]) * (bc ? -1 : 1);
  const y = f.year!;
  return y > 0 ? Math.ceil(y / 100) : -Math.ceil(-y / 100);
};

const formatCentury = (c: number) =>
  `${toRoman(Math.abs(c))}${Math.abs(c) === 1 ? "er" : "e"} siècle${c < 0 ? " av. J.-C." : ""}`;

/**
 * The right date and three wrong ones, written alike and listed oldest first.
 * The wrong ones fall on both sides, so the right one can be anywhere in the list.
 */
function dateOptions(f: QuizFact): { correct: string; options: string[] } | null {
  const year = f.year!;
  // How many wrong dates come before the right one, evenly 0 to 3 so that its place in the list says nothing.
  const before = Math.floor(Math.random() * 4);
  switch (precisionOf(f)) {
    case "ago": {
      const correct = roundAge(age(year));
      const older = shuffle([1.5, 2, 3]).slice(0, before);
      const younger = shuffle([0.3, 0.45, 0.6]).slice(0, 3 - before);
      const ages = [...older, ...younger].map((k) => roundAge(correct * k));
      return { correct: formatAge(correct), options: [correct, ...ages].sort((a, b) => b - a).map(formatAge) };
    }
    case "century": {
      // Four centuries in a row, the right one anywhere among them. There is no
      // century 0: the Ist century BC (-1) is followed by the Ist AD (1).
      const toIndex = (c: number) => (c > 0 ? c - 1 : c);
      const fromIndex = (i: number) => (i >= 0 ? i + 1 : i);
      const correct = centuryOf(f);
      const last = toIndex(Math.ceil(CURRENT_YEAR / 100));
      const start = Math.min(toIndex(correct) - Math.floor(Math.random() * 4), last - 3);
      return { correct: formatCentury(correct), options: [0, 1, 2, 3].map((i) => formatCentury(fromIndex(start + i))) };
    }
    default: {
      const approximate = precisionOf(f) === "approx";
      const step = niceStep(Math.max(4, age(year) * 0.12));
      let grain = 1;
      while (grain * 10 <= step / 2 && year % (grain * 10) === 0) grain *= 10;
      const years = [year];
      for (let tries = 0; years.length < 4 && tries < 80; tries++) {
        // Too close to today for later years: fall back to earlier ones.
        const sign = years.length - 1 < before || tries >= 40 ? -1 : 1;
        const candidate = Math.round((year + sign * step * (0.4 + Math.random() * 1.4)) / grain) * grain;
        if (candidate === 0 || candidate > CURRENT_YEAR) continue;
        if (years.some((y) => Math.abs(y - candidate) < step * 0.3)) continue;
        years.push(candidate);
      }
      if (years.length < 4) return null;
      const [correct] = formatYears(years, approximate);
      return { correct, options: formatYears(years.sort((a, b) => a - b), approximate) };
    }
  }
}

// ---------------------------------------------------------------------------
// Countries
// ---------------------------------------------------------------------------

const countryNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["fr"], { type: "region" }) : null;

const countryName = (code: string) => {
  const name = countryNames?.of(code);
  return name && name !== code ? name : null;
};

const homeRegionsCache = new WeakMap<QuizFact[], Map<string, string>>();

/**
 * The part of the world each country belongs to: the region of most of the
 * facts where it is the only country. Countries that only take part in other
 * countries' events (the Netherlands or Portugal in Asia) are left out.
 */
function homeRegions(all: QuizFact[]) {
  let homes = homeRegionsCache.get(all);
  if (homes) return homes;
  const counts = new Map<string, Map<string, number>>();
  for (const f of all) {
    if (!f.region || f.countries?.length !== 1) continue;
    const byRegion = counts.get(f.countries[0]) ?? new Map<string, number>();
    byRegion.set(f.region, (byRegion.get(f.region) ?? 0) + 1);
    counts.set(f.countries[0], byRegion);
  }
  homes = new Map([...counts].map(([code, byRegion]) => [code, [...byRegion].sort((a, b) => b[1] - a[1])[0][0]]));
  homeRegionsCache.set(all, homes);
  return homes;
}

/** Whether a text names the country, its people or language ("Japon", "japonais", "Néo-Zélandaises"). */
const mentionsCountry = (text: string, name: string) => {
  const words = tokens(text);
  return tokens(name)
    .filter((w) => w.length >= 3 && !FUNCTION_WORDS.has(w))
    .some((w) => {
      const stem = w.slice(0, w.length <= 4 ? 3 : 4);
      return words.some((t) => t.startsWith(stem));
    });
};

// ---------------------------------------------------------------------------
// Kinds of questions
// ---------------------------------------------------------------------------

type Builder = (fact: QuizFact, all: QuizFact[]) => Question | null;

/** "Quand situer cet événement ?" The options are dates written like the right one. */
const whenQuestion: Builder = (fact) => {
  if (!datable(fact) || hasYearInside(titleOf(fact))) return null;
  const dates = dateOptions(fact);
  if (!dates) return null;
  return {
    id: `${fact.id}-when`,
    question: "Quand situer cet événement ?",
    context: titleOf(fact),
    explanation: explain(fact),
    options: dates.options,
    correctAnswer: dates.options.indexOf(dates.correct),
  };
};

/** "Quel événement correspond à cette date ?" Other events of the same region or era, at other dates. */
const dateQuestion: Builder = (fact, all) => {
  if (!datable(fact) || hasYearInside(titleOf(fact))) return null;
  const others = all.filter(
    (f) => f.id !== fact.id && datable(f) && farApart(f, fact) && !hasYearInside(titleOf(f))
  );
  const chosen = pick(
    others,
    3,
    (f) => f.region === fact.region && f.period_id === fact.period_id,
    (f) => f.period_id === fact.period_id,
    (f) => f.region === fact.region
  );
  return makeQuestion(
    `${fact.id}-date`,
    { question: "Quel événement correspond à cette date ?", context: dateOf(fact), explanation: explain(fact) },
    titleOf(fact),
    chosen.map(titleOf)
  );
};

/** Which of four events came first (or last), all clearly apart in time. */
const orderQuestion: Builder = (fact, all) => {
  if (!datable(fact) || hasYearInside(titleOf(fact))) return null;
  const first = Math.random() < 0.5;
  const others = all.filter(
    (f) =>
      f.id !== fact.id &&
      datable(f) &&
      !hasYearInside(titleOf(f)) &&
      (first ? f.year! > fact.year! : f.year! < fact.year!) &&
      farApart(f, fact)
  );
  const chosen = pick(
    others,
    3,
    (f) => f.region === fact.region && f.period_id === fact.period_id,
    (f) => f.region === fact.region,
    (f) => f.period_id === fact.period_id
  );
  const timeline = [fact, ...chosen]
    .sort((a, b) => a.year! - b.year!)
    .map((f) => `${titleOf(f)} (${dateOf(f)})`)
    .join(" → ");
  return makeQuestion(
    `${fact.id}-order`,
    {
      question: first ? "Lequel de ces événements est le plus ancien ?" : "Lequel de ces événements est le plus récent ?",
      explanation: timeline,
    },
    titleOf(fact),
    chosen.map(titleOf)
  );
};

/** The present-day country, against other countries of the same part of the world. */
const countryQuestion: Builder = (fact, all) => {
  if (fact.countries?.length !== 1) return null;
  const code = fact.countries[0];
  const correct = countryName(code);
  const title = titleOf(fact);
  if (!correct || mentionsCountry(title, correct)) return null;
  const homes = homeRegions(all);
  const neighbours = [...homes.keys()]
    .filter((c) => c !== code && homes.get(c) === fact.region)
    .map(countryName)
    .filter((name): name is string => !!name && !mentionsCountry(title, name));
  return makeQuestion(
    `${fact.id}-country`,
    { question: "À quel pays actuel cet événement est-il rattaché ?", context: title, explanation: explain(fact) },
    correct,
    pick(neighbours, 3)
  );
};

/** The description with the title's words hidden: which event is it? */
const describeQuestion: Builder = (fact, all) => {
  const terms = titleTerms(titleOf(fact));
  if (!terms.length) return null;
  let hidden = 0;
  let words = 0;
  const masked = descriptionOf(fact)
    .replace(/[\p{L}\p{N}]+/gu, (word) => {
      words++;
      if (!terms.some((term) => sameWord(normalize(word), term))) return word;
      hidden++;
      return "…";
    })
    // "Samuel de … … …" reads "Samuel de …": the number of dots would hint at the title.
    .replace(/…(?:[\s'’-]+…)+/g, "…");
  if (hidden > 6 || words - hidden < 12) return null;
  const clues = tokens(masked);
  const chosen = pick(
    all.filter(
      (f) =>
        f.id !== fact.id &&
        !distinctiveWords(titleOf(f)).some((w) => clues.some((c) => sameWord(c, w)))
    ),
    3,
    (f) => f.region === fact.region && f.period_id === fact.period_id,
    (f) => f.period_id === fact.period_id,
    (f) => f.region === fact.region
  );
  return makeQuestion(
    `${fact.id}-describe`,
    { question: "De quel événement s'agit-il ?", context: masked, explanation: explain(fact) },
    titleOf(fact),
    chosen.map(titleOf)
  );
};

const BUILDERS: Record<string, Builder> = {
  when: whenQuestion,
  date: dateQuestion,
  order: orderQuestion,
  country: countryQuestion,
  describe: describeQuestion,
};

/**
 * One question per fact of the pool, up to `max`. Wrong answers may come from
 * any fact, so a narrow selection still gets plausible options. The kinds of
 * questions take turns so that a quiz mixes them.
 */
export function buildQuestions(pool: QuizFact[], allFacts: QuizFact[], max: number): Question[] {
  const used: Record<string, number> = {};
  const questions: Question[] = [];

  for (const fact of shuffle(pool)) {
    if (questions.length >= max) break;
    const kinds = shuffle(Object.keys(BUILDERS)).sort((a, b) => (used[a] ?? 0) - (used[b] ?? 0));
    for (const kind of kinds) {
      const question = BUILDERS[kind](fact, allFacts);
      if (question) {
        used[kind] = (used[kind] ?? 0) + 1;
        questions.push(question);
        break;
      }
    }
  }
  return questions;
}
