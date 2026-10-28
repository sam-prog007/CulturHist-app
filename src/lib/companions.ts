import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { COMPANION_IDS, type CompanionId } from "@/components/companions/ids";
import type { CompanionMood } from "@/components/companions/Companion";

/*
 * The historical companions who follow the user through the app. Everyone
 * starts with Napoléon; the others join at the grades' point thresholds, in
 * the grades' figure order, Alexandre last. Each one talks in its own voice,
 * with references to its life. Lines use "vous", like the rest of the app,
 * and never assume the user's gender. {n} is the streak length.
 */

type Variants = string[];

interface Lines {
  morning: Variants;
  afternoon: Variants;
  night: Variants;
  done: Variants;
  atRisk: Variants;
  noStreak: Variants;
  right: Variants;
  wrong: Variants;
  perfect: string;
  good: string;
  ok: string;
  low: string;
  /** How it introduces itself when it is unlocked. */
  unlock: string;
  /** On the streak celebration screen. */
  celebrate: string;
}

export interface CompanionInfo {
  id: CompanionId;
  name: string;
  /** Points from which it joins. */
  unlockPoints: number;
  bio: string;
  lines: Lines;
}

const UNLOCK_POINTS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];

const DATA: Record<CompanionId, Omit<CompanionInfo, "id" | "unlockPoints">> = {
  napoleon: {
    name: "Napoléon",
    bio: "Empereur des Français (1769-1821), stratège de génie, auteur du Code civil… et as de la propagande.",
    lines: {
      morning: ["Debout ! Le soleil d'Austerlitz se lève sur vos 5 faits du jour.", "Une journée sans bataille est une journée perdue. Vos faits vous attendent !"],
      afternoon: ["J'ai dicté le Code civil ; vous pouvez bien lire 5 faits.", "La victoire appartient au plus persévérant. À vos faits !"],
      night: ["Je dormais quatre heures par nuit… mais vous, allez vous coucher après vos faits."],
      done: ["Victoire totale ! Même à Austerlitz, je n'ai pas fait mieux.", "Journée gagnée. Reposez vos troupes, nous repartons demain."],
      atRisk: ["Votre série de {n} jours est en danger ! Ne la laissez pas finir comme Waterloo.", "{n} jours de conquêtes… Ce soir, pas de retraite de Russie !"],
      noStreak: ["Impossible n'est pas français : lançons une nouvelle série aujourd'hui !"],
      right: ["Bien joué ! Je vous nomme maréchal d'Empire.", "Victoire ! Digne de la Grande Armée."],
      wrong: ["Moi aussi, j'ai eu mon Waterloo. On se reprend !", "Une bataille perdue n'est pas la guerre perdue."],
      perfect: "Sans faute ! Je vous remets la Légion d'honneur.",
      good: "Belle campagne ! L'Europe tremble devant votre savoir.",
      ok: "Pas mal. Un bon stratège prépare toujours sa revanche.",
      low: "Retraite stratégique… Nous reviendrons plus forts !",
      unlock: "Je suis Napoléon Bonaparte. Ensemble, nous allons conquérir l'histoire, une date à la fois !",
      celebrate: "Une série de plus ! Mes grognards seraient fiers.",
    },
  },
  imhotep: {
    name: "Imhotep",
    bio: "Scribe, médecin et architecte de la pyramide à degrés du pharaon Djoser (vers 2650 av. J.-C.), divinisé par les Égyptiens.",
    lines: {
      morning: ["Le soleil de Rê se lève : préparons le papyrus pour vos 5 faits."],
      afternoon: ["Une pyramide se bâtit bloc après bloc ; votre savoir, fait après fait."],
      night: ["Même les scribes posent leur calame la nuit. Un dernier fait avant de dormir ?"],
      done: ["Votre journée est gravée dans la pierre. Bravo !"],
      atRisk: ["Votre série de {n} jours tient comme une pyramide… n'en retirez pas la dernière pierre ce soir !"],
      noStreak: ["Toute pyramide commence par une première pierre. Posons-la aujourd'hui."],
      right: ["Exact ! Je l'inscris sur le papyrus.", "Parfait, digne d'un grand scribe !"],
      wrong: ["Même moi, j'ai raté quelques blocs. Retenez celle-ci."],
      perfect: "Sans faute ! Je vous bâtis une pyramide en votre honneur.",
      good: "Très beau résultat : vos connaissances tiennent debout.",
      ok: "Les fondations sont là ; continuons à bâtir.",
      low: "Patience : la pyramide de Djoser ne s'est pas faite en un jour.",
      unlock: "Je suis Imhotep, architecte du pharaon Djoser. J'ai bâti la première pyramide ; bâtissons votre savoir !",
      celebrate: "Encore une pierre posée sur votre pyramide de jours !",
    },
  },
  "marco-polo": {
    name: "Marco Polo",
    bio: "Marchand vénitien (1254-1324) qui voyagea jusqu'à la cour de Kubilaï Khan et raconta tout dans Le Devisement du monde.",
    lines: {
      morning: ["Bonjour ! Prêts pour un nouveau voyage sur la route de la soie ?"],
      afternoon: ["Venise, Pékin, Ormuz… Où vos faits du jour vont-ils nous emmener ?"],
      night: ["Même en caravane, on s'arrête la nuit. Un dernier fait avant le campement ?"],
      done: ["Étape franchie ! Je note tout dans mon carnet de voyage."],
      atRisk: ["Votre série de {n} jours est un long voyage. Ne faites pas demi-tour ce soir !"],
      noStreak: ["J'ai mis vingt-quatre ans à revenir à Venise. Lancer une série, c'est bien plus court !"],
      right: ["Bravo ! Même Kubilaï Khan serait impressionné.", "Exact ! Vous voyagez vite."],
      wrong: ["On m'a souvent traité de menteur, vous savez. Corrigeons la route !"],
      perfect: "Sans faute ! Vous méritez une place à la cour du Grand Khan.",
      good: "Beau voyage ! Peu de marchands en savent autant.",
      ok: "Bonne route, mais il reste des terres à explorer.",
      low: "Le chemin est long… rechargeons les chameaux et repartons !",
      unlock: "Je suis Marco Polo, de Venise. J'ai vu la Chine de Kubilaï Khan ; à vous de voir le monde !",
      celebrate: "Encore une étape sur votre route de la soie !",
    },
  },
  leonard: {
    name: "Léonard de Vinci",
    bio: "Peintre de la Joconde, ingénieur et inventeur insatiable (1452-1519), qui remplissait ses carnets en écriture inversée.",
    lines: {
      morning: ["Bonjour ! J'ai déjà dessiné trois machines volantes. Et vous, vos faits ?"],
      afternoon: ["La curiosité est la meilleure des inventions. Ouvrons vos faits du jour !"],
      night: ["Je travaillais souvent tard à mes carnets… mais un fait suffira avant de dormir."],
      done: ["Chef-d'œuvre achevé ! Même la Joconde sourit."],
      atRisk: ["Votre série de {n} jours est une œuvre inachevée ! Un dernier coup de pinceau ce soir ?"],
      noStreak: ["Toute grande œuvre commence par une esquisse. Lançons votre série !"],
      right: ["Bravo ! Je le note dans mon carnet… à l'envers.", "Exact ! Quel esprit."],
      wrong: ["Raté ? J'ai bien mis des années à finir la Joconde. Retenez celle-ci !"],
      perfect: "Sans faute ! Un véritable esprit de la Renaissance.",
      good: "Superbe ! Votre esprit vole plus haut que mes machines.",
      ok: "Bonne esquisse ; reprenons quelques traits.",
      low: "Mes machines ne volaient pas du premier coup non plus. Encore un essai ?",
      unlock: "Je suis Léonard de Vinci, peintre, ingénieur et curieux de tout. Remplissons ensemble vos carnets !",
      celebrate: "Encore un jour ajouté à votre chef-d'œuvre !",
    },
  },
  cesar: {
    name: "Jules César",
    bio: "Général et homme d'État romain (100-44 av. J.-C.), conquérant de la Gaule, assassiné aux ides de mars.",
    lines: {
      morning: ["Salve ! Le Rubicon est franchi : en avant vers vos faits du jour."],
      afternoon: ["Rome ne s'est pas faite en un jour, mais vos 5 faits, si !"],
      night: ["Même les légions dressent le camp pour la nuit. Un dernier fait ?"],
      done: ["Veni, vidi, vici ! Journée conquise."],
      atRisk: ["Votre série de {n} jours ! Méfiez-vous des ides de mars… et de ce soir."],
      noStreak: ["Alea jacta est : le sort en est jeté, commençons une série !"],
      right: ["Veni, vidi… vous avez vaincu !", "Bravo ! Digne d'un triomphe à Rome."],
      wrong: ["Une erreur ? J'en ai vu d'autres au Sénat. Retenez celle-ci !"],
      perfect: "Sans faute ! Je vous décerne une couronne de laurier.",
      good: "Belle conquête ! La Gaule ne vous résisterait pas.",
      ok: "Bonne bataille, mais la guerre des Gaules a duré huit ans.",
      low: "Les légions se regroupent. On retourne au combat ?",
      unlock: "Je suis Jules César. J'ai conquis la Gaule ; à vous de conquérir l'histoire !",
      celebrate: "Une victoire de plus pour votre légion de jours !",
    },
  },
  socrate: {
    name: "Socrate",
    bio: "Philosophe athénien (vers 470-399 av. J.-C.) qui questionnait tout le monde sur l'agora. Il n'a rien écrit : c'est Platon qui l'a raconté.",
    lines: {
      morning: ["Bonjour ! Une question pour commencer : que savez-vous de l'histoire ce matin ?"],
      afternoon: ["Une vie sans examen ne vaut pas d'être vécue. Examinons vos faits du jour !"],
      night: ["Il est tard… mais une question ne dort jamais. Un fait avant le sommeil ?"],
      done: ["Vous en savez davantage qu'hier. N'est-ce pas cela, devenir sage ?"],
      atRisk: ["Votre série de {n} jours… La laisserez-vous s'éteindre ? Réfléchissez-y."],
      noStreak: ["Commencer, c'est reconnaître qu'on ne sait pas encore. Commençons !"],
      right: ["Bien raisonné ! Platon le notera.", "Exact. Mais savez-vous pourquoi ?"],
      wrong: ["Je sais que je ne sais rien. Vous, maintenant, vous savez."],
      perfect: "Sans faute ! L'oracle de Delphes aurait dû vous désigner.",
      good: "Très bien ! Vous dialoguez avec l'histoire.",
      ok: "Pas mal… mais qu'avons-nous appris de nos erreurs ?",
      low: "Reconnaître son ignorance est le début du savoir. On recommence ?",
      unlock: "Je suis Socrate d'Athènes. Je ne sais qu'une chose : que je ne sais rien. Cherchons ensemble !",
      celebrate: "Un jour de plus à cultiver votre esprit. Sage décision !",
    },
  },
  ramses: {
    name: "Ramsès II",
    bio: "Pharaon d'Égypte (vers 1279-1213 av. J.-C.), bâtisseur d'Abou Simbel, qui régna 66 ans et fit graver partout la bataille de Qadesh.",
    lines: {
      morning: ["Le pharaon se lève ! Que l'on apporte les 5 faits du jour."],
      afternoon: ["J'ai couvert l'Égypte de temples. Couvrez votre journée de faits !"],
      night: ["Même le pharaon se repose. Un dernier fait avant la nuit ?"],
      done: ["Journée glorieuse ! Je la fais graver sur les murs d'Abou Simbel."],
      atRisk: ["Votre série de {n} jours mérite un temple ! Ne laissez pas le sable la recouvrir ce soir."],
      noStreak: ["J'ai régné 66 ans. Votre série, elle, commence aujourd'hui !"],
      right: ["Exact ! Je le fais graver en hiéroglyphes.", "Bravo ! Digne d'un pharaon."],
      wrong: ["À Qadesh aussi, ce fut serré… mais je l'ai racontée comme une victoire. Retenez celle-ci !"],
      perfect: "Sans faute ! Une statue colossale à votre gloire.",
      good: "Magnifique ! Votre règne sur l'histoire commence.",
      ok: "Bon début de règne ; un pharaon voit loin.",
      low: "La crue du Nil revient toujours. Vous aussi, revenez !",
      unlock: "Je suis Ramsès II, pharaon d'Égypte. Mon règne fut long ; que le vôtre sur l'histoire le soit aussi !",
      celebrate: "Encore un jour gravé dans la pierre de votre règne !",
    },
  },
  cleopatre: {
    name: "Cléopâtre",
    bio: "Dernière reine d'Égypte (69-30 av. J.-C.), polyglotte et fine politique, qui tint tête à Rome.",
    lines: {
      morning: ["Bonjour ! À Alexandrie, la journée commence à la bibliothèque. À vos faits !"],
      afternoon: ["Je parlais une dizaine de langues ; vous pouvez bien apprendre 5 faits."],
      night: ["La nuit tombe sur le Nil… Un dernier fait, pour la beauté du savoir ?"],
      done: ["Journée parfaite. Rome elle-même s'incline."],
      atRisk: ["Votre série de {n} jours mérite mieux qu'un aspic ce soir ! Validez vos faits."],
      noStreak: ["Une reine ne renonce jamais. Lançons votre série !"],
      right: ["Exact ! Vous avez l'esprit d'Alexandrie.", "Bravo, c'est royal !"],
      wrong: ["Même César et Antoine se sont trompés. Retenez celle-ci !"],
      perfect: "Sans faute ! Je vous ouvre les portes de la bibliothèque d'Alexandrie.",
      good: "Superbe ! Votre savoir brille comme le phare d'Alexandrie.",
      ok: "Pas mal ; une reine en veut toujours plus.",
      low: "On ne tient pas tête à Rome en un jour. Une revanche ?",
      unlock: "Je suis Cléopâtre, reine d'Égypte. J'ai charmé Rome par mon esprit ; charmons l'histoire !",
      celebrate: "Un jour de plus à votre règne. Royal !",
    },
  },
  confucius: {
    name: "Confucius",
    bio: "Penseur chinois (vers 551-479 av. J.-C.) dont les leçons sur l'étude et le respect ont marqué l'Asie pendant deux mille ans.",
    lines: {
      morning: ["Apprendre sans réfléchir est vain. Commençons la journée par vos faits."],
      afternoon: ["N'est-ce pas un plaisir d'étudier et de réviser ? Vos faits vous attendent."],
      night: ["Le sage étudie même tard. Mais un seul fait suffira ce soir."],
      done: ["La journée est accomplie. Le sage sourit."],
      atRisk: ["Ne perdez pas vos {n} jours ce soir : l'important est de ne jamais s'arrêter."],
      noStreak: ["Étudier sans relâche est un plaisir. Commençons une série aujourd'hui !"],
      right: ["Juste. Le savoir est une lumière.", "Bravo, l'élève dépasse le maître."],
      wrong: ["Commettre une faute sans la corriger, voilà la vraie faute. Corrigeons-la !"],
      perfect: "Sans faute ! Vous êtes un véritable lettré.",
      good: "Très bien. La persévérance porte ses fruits.",
      ok: "Bien. Réviser ce que l'on sait, c'est apprendre encore.",
      low: "Peu importe d'aller lentement, pourvu qu'on ne s'arrête pas.",
      unlock: "Je suis Confucius. Étudier et réviser : voilà le chemin. Marchons-y ensemble.",
      celebrate: "Un jour de plus sur la voie de l'étude.",
    },
  },
  alexandre: {
    name: "Alexandre le Grand",
    bio: "Roi de Macédoine (356-323 av. J.-C.), élève d'Aristote, qui bâtit un empire de la Grèce à l'Inde sur son cheval Bucéphale.",
    lines: {
      morning: ["Bucéphale est sellé ! En route pour conquérir vos 5 faits."],
      afternoon: ["Plus de terres à conquérir ? Si : vos faits du jour !"],
      night: ["Même les conquérants dorment. Un dernier fait avant le bivouac ?"],
      done: ["Journée conquise ! Aristote serait fier."],
      atRisk: ["Votre série de {n} jours va plus loin que mon armée ! Ne vous arrêtez pas aux portes de l'Inde ce soir."],
      noStreak: ["Tranchons le nœud gordien : lancez une série aujourd'hui !"],
      right: ["Exact ! Digne d'un élève d'Aristote.", "Victoire ! Bucéphale hennit de joie."],
      wrong: ["Même mes soldats ont refusé d'aller plus loin un jour. Une erreur, ça arrive !"],
      perfect: "Sans faute ! Même Aristote serait fier de vous.",
      good: "Grande conquête ! Votre empire du savoir s'étend.",
      ok: "Belle campagne ; l'Inde est encore loin.",
      low: "Un conquérant ne s'arrête pas à une défaite. On repart ?",
      unlock: "Je suis Alexandre le Grand. Mon maître Aristote m'a appris à aimer le savoir. Conquérons-le !",
      celebrate: "Un jour de plus à votre empire !",
    },
  },
};

export const COMPANIONS: CompanionInfo[] = COMPANION_IDS.map((id, i) => ({ id, unlockPoints: UNLOCK_POINTS[i], ...DATA[id] }));

export const companionById = (id: string | null | undefined): CompanionInfo =>
  COMPANIONS.find((c) => c.id === id) ?? COMPANIONS[0];

/** Companions the points have unlocked, in order. */
export const unlockedAt = (points: number) => COMPANIONS.filter((c) => points >= c.unlockPoints);

// ---------------------------------------------------------------------------
// What they say
// ---------------------------------------------------------------------------

export interface CompanionLine {
  mood: CompanionMood;
  text: string;
}

const pick = (variants: Variants) => variants[Math.floor(Math.random() * variants.length)];
const fill = (text: string, n: number) => text.replace(/\{n\}/g, String(n));

/** On the home page, depending on the time and the streak. */
export function homeLine(
  companion: CompanionInfo,
  { streak, doneToday, hour = new Date().getHours() }: { streak: number; doneToday: boolean; hour?: number }
): CompanionLine {
  const { lines } = companion;
  if (doneToday) return { mood: "cheer", text: pick(lines.done) };
  if (hour >= 22 || hour < 5) return { mood: "sleepy", text: pick(lines.night) };
  if (streak > 0 && hour >= 18) return { mood: "sad", text: fill(pick(lines.atRisk), streak) };
  if (streak === 0) return { mood: "wave", text: pick(lines.noStreak) };
  if (hour < 12) return { mood: "happy", text: pick(lines.morning) };
  return { mood: "think", text: pick(lines.afternoon) };
}

/** Reaction to a quiz answer. */
export const answerLine = (companion: CompanionInfo, correct: boolean): CompanionLine =>
  correct ? { mood: "cheer", text: pick(companion.lines.right) } : { mood: "sad", text: pick(companion.lines.wrong) };

/** At the end of a quiz. */
export function quizResultLine(companion: CompanionInfo, score: number, total: number): CompanionLine {
  const ratio = total ? score / total : 0;
  const { lines } = companion;
  if (ratio === 1) return { mood: "cheer", text: lines.perfect };
  if (ratio >= 0.7) return { mood: "happy", text: lines.good };
  if (ratio >= 0.4) return { mood: "think", text: lines.ok };
  return { mood: "sad", text: lines.low };
}

// ---------------------------------------------------------------------------
// The user's companions
// ---------------------------------------------------------------------------

export const COMPANION_QUERY_KEY = "companion";

interface CompanionState {
  points: number;
  active: string | null;
  /** How many unlocks were already celebrated. */
  seen: number;
}

/**
 * The active companion, the ones unlocked, the next one to earn, and a
 * companion unlocked since the user last saw the unlock screen.
 */
export function useCompanion() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = [COMPANION_QUERY_KEY, user?.id];

  const { data } = useQuery({
    queryKey,
    enabled: !!user,
    staleTime: 60 * 1000,
    queryFn: async (): Promise<CompanionState> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("points, companion, companions_seen")
        .eq("id", user!.id)
        .single();
      if (!error) return { points: data.points ?? 0, active: data.companion, seen: data.companions_seen ?? 1 };
      // Before the companions migration: Napoléon, and no unlock screens.
      const { data: profile } = await supabase.from("profiles").select("points").eq("id", user!.id).single();
      const points = profile?.points ?? 0;
      return { points, active: null, seen: unlockedAt(points).length };
    },
  });

  const points = data?.points ?? 0;
  const unlocked = unlockedAt(points);
  // Only an unlocked companion can be active; Napoléon otherwise.
  const companion = companionById(unlocked.some((c) => c.id === data?.active) ? data?.active : "napoleon");
  const next = COMPANIONS.find((c) => c.unlockPoints > points) ?? null;
  const newlyUnlocked = data && unlocked.length > data.seen ? unlocked[data.seen] : null;

  const update = async (patch: { companion?: CompanionId; companions_seen?: number }) => {
    queryClient.setQueryData<CompanionState>(queryKey, (old) =>
      old && {
        ...old,
        ...(patch.companion && { active: patch.companion }),
        ...(patch.companions_seen !== undefined && { seen: patch.companions_seen }),
      }
    );
    const { error } = await supabase.from("profiles").update(patch).eq("id", user!.id);
    if (error) queryClient.invalidateQueries({ queryKey });
  };

  return {
    ready: !!data,
    points,
    companion,
    unlocked,
    next,
    missing: next ? next.unlockPoints - points : 0,
    newlyUnlocked,
    choose: (id: CompanionId) => update({ companion: id }),
    /** The unlock screen of `newlyUnlocked` was seen (one at a time). */
    markSeen: () => data && update({ companions_seen: data.seen + 1 }),
  };
}
