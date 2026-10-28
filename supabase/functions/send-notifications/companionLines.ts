// What each historical companion says in the streak notifications. The app's
// lines are in src/lib/companions.ts; the edge function cannot import src/,
// so the push lines live here. {n} is the streak length. "vous", never gendered.

export const COMPANION_IDS = [
  "napoleon", "imhotep", "marco-polo", "leonard", "cesar", "socrate", "ramses", "cleopatre", "confucius", "alexandre",
] as const;
export type CompanionId = (typeof COMPANION_IDS)[number];

export interface PushLines {
  name: string;
  atRisk: string[];
  lastChance: string;
  lost: string;
  comeback: string;
  comebackWeek: string;
}

export const PUSH_LINES: Record<CompanionId, PushLines> = {
  napoleon: {
    name: "Napoléon",
    atRisk: ["Ne laissez pas votre série finir comme Waterloo !", "{n} jours de conquêtes. Ce soir, pas de retraite de Russie !"],
    lastChance: "Il reste deux heures avant minuit. La Garde ne se rend pas !",
    lost: "Même moi, je suis revenu de l'île d'Elbe. Une nouvelle campagne commence aujourd'hui !",
    comeback: "Vos troupes vous attendent au bivouac. 5 faits, et nous repartons en campagne !",
    comebackWeek: "Une semaine sans bataille ? Impossible n'est pas français : revenez !",
  },
  imhotep: {
    name: "Imhotep",
    atRisk: ["Votre pyramide de {n} jours attend sa pierre du jour.", "Ne laissez pas le sable recouvrir {n} jours de travail."],
    lastChance: "La nuit tombe sur le chantier. Posez la dernière pierre avant minuit !",
    lost: "Une pyramide s'effondre parfois. On la rebâtit, pierre après pierre, dès aujourd'hui.",
    comeback: "Le papyrus est prêt, le calame aussi. Il ne manque que vous.",
    comebackWeek: "Le chantier est à l'arrêt depuis une semaine. Revenez bâtir !",
  },
  "marco-polo": {
    name: "Marco Polo",
    atRisk: ["{n} jours sur la route de la soie… ne faites pas demi-tour ce soir !", "La caravane attend : vos faits du jour avant la nuit ?"],
    lastChance: "Le campement se prépare. Dernière étape avant minuit !",
    lost: "On s'égare parfois en chemin. Reprenons la route aujourd'hui !",
    comeback: "J'ai de nouvelles histoires de voyage pour vous. On repart ?",
    comebackWeek: "Une semaine sans voyager ! Même Kubilaï Khan s'impatiente.",
  },
  leonard: {
    name: "Léonard de Vinci",
    atRisk: ["Votre série de {n} jours est une œuvre inachevée. Un coup de pinceau ce soir ?", "Ma curiosité ne dort jamais. Et la vôtre ?"],
    lastChance: "Deux heures avant minuit : terminons le tableau !",
    lost: "Une esquisse ratée n'empêche pas le chef-d'œuvre. On recommence aujourd'hui !",
    comeback: "Mes carnets se remplissent sans vous. Revenez découvrir !",
    comebackWeek: "Une semaine ! J'ai inventé trois machines pendant ce temps.",
  },
  cesar: {
    name: "Jules César",
    atRisk: ["Méfiez-vous des ides de mars… et de ce soir : {n} jours sont en jeu !", "Vos légions attendent vos ordres pour garder {n} jours de conquête."],
    lastChance: "Le Rubicon est devant vous. Franchissez-le avant minuit !",
    lost: "Même Rome a connu des défaites. Alea jacta est : on recommence !",
    comeback: "Le Sénat s'inquiète de votre absence. Revenez à Rome !",
    comebackWeek: "Une semaine loin de Rome ! Vos légions se demandent où vous êtes.",
  },
  socrate: {
    name: "Socrate",
    atRisk: ["Laisserez-vous s'éteindre {n} jours de sagesse ? Réfléchissez-y.", "Une question : qu'apprendrez-vous ce soir ?"],
    lastChance: "Il est tard, mais une question n'attend pas. Avant minuit ?",
    lost: "Reconnaître une chute, c'est déjà se relever. Recommençons aujourd'hui.",
    comeback: "L'agora est bien calme sans vous. Revenez questionner l'histoire !",
    comebackWeek: "Une semaine sans examen… Une vie sans examen ne vaut pas d'être vécue !",
  },
  ramses: {
    name: "Ramsès II",
    atRisk: ["{n} jours de règne ! Ne laissez pas le sable les recouvrir ce soir.", "Le pharaon attend ses 5 faits du jour."],
    lastChance: "Le soleil de Rê est couché depuis longtemps. Dernier délai : minuit !",
    lost: "Un règne connaît des crues et des sécheresses. Le vôtre reprend aujourd'hui.",
    comeback: "Les scribes attendent vos ordres. Revenez, pharaon !",
    comebackWeek: "Une semaine sans pharaon ! L'Égypte s'inquiète.",
  },
  cleopatre: {
    name: "Cléopâtre",
    atRisk: ["Votre série de {n} jours mérite mieux qu'un aspic ce soir !", "Une reine n'abandonne jamais : vos faits avant minuit ?"],
    lastChance: "Deux heures avant minuit. Rome n'attend pas, moi non plus !",
    lost: "Même une reine perd parfois une bataille. Reconquérons aujourd'hui !",
    comeback: "La bibliothèque d'Alexandrie vous attend. Revenez !",
    comebackWeek: "Une semaine loin d'Alexandrie ! Le phare brille encore pour vous.",
  },
  confucius: {
    name: "Confucius",
    atRisk: ["L'important est de ne jamais s'arrêter : gardez vos {n} jours ce soir.", "Étudier et réviser : ce soir, 5 faits suffisent."],
    lastChance: "Le sage étudie même tard. Encore deux heures avant minuit.",
    lost: "Tomber n'est pas une faute ; ne pas se relever en serait une. Recommençons.",
    comeback: "Le maître attend son élève. Revenez étudier !",
    comebackWeek: "Une semaine sans étude. Peu importe d'aller lentement, pourvu qu'on reprenne !",
  },
  alexandre: {
    name: "Alexandre le Grand",
    atRisk: ["{n} jours de conquête ! Ne vous arrêtez pas aux portes de l'Inde ce soir.", "Bucéphale piaffe : vos faits du jour avant la nuit ?"],
    lastChance: "Dernière charge avant minuit !",
    lost: "Un conquérant ne reste jamais à terre. Une nouvelle conquête commence aujourd'hui !",
    comeback: "Bucéphale vous attend, sellé. On repart à la conquête ?",
    comebackWeek: "Une semaine sans conquête ! Aristote n'en reviendrait pas.",
  },
};

export const pushLinesFor = (id: string | null | undefined): PushLines =>
  PUSH_LINES[(COMPANION_IDS as readonly string[]).includes(id ?? "") ? (id as CompanionId) : "napoleon"];

/** The companion's picture for a notification (public/companions/, rendered by scripts/render-brand.mjs). */
export const companionIcon = (id: string | null | undefined, mood: "happy" | "sad" | "wave" | "think") =>
  `/companions/${(COMPANION_IDS as readonly string[]).includes(id ?? "") ? id : "napoleon"}-${mood}.png`;
