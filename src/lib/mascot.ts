import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { MascotMood } from "@/components/mascot/Mascot";

export interface MascotLine {
  mood: MascotMood;
  text: string;
}

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

/** The user's grade level (1–10): Minerve wears its costume everywhere. */
export function useGradeLevel(): number | null {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["grade-level", user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const [profile, grades] = await Promise.all([
        supabase.from("profiles").select("points").eq("id", user!.id).single(),
        supabase.from("grades").select("level, min_points, max_points").order("level"),
      ]);
      const points = profile.data?.points ?? 0;
      const list = grades.data ?? [];
      return (list.find((g) => points >= g.min_points && points < g.max_points) ?? list.at(-1))?.level ?? 1;
    },
  });
  return data ?? null;
}

/** What Minerve says on the home page, depending on the day and the streak. */
export function homeLine({ streak, doneToday, hour = new Date().getHours() }: { streak: number; doneToday: boolean; hour?: number }): MascotLine {
  if (doneToday) {
    return { mood: "cheer", text: pick(["Journée validée, bravo ! On se retrouve demain.", "Belle série ! Votre flamme brille encore aujourd'hui."]) };
  }
  if (hour >= 22 || hour < 5) {
    return { mood: "sleepy", text: "Encore debout ? Vos faits du jour avant de dormir ?" };
  }
  if (streak > 0 && hour >= 18) {
    return { mood: "sad", text: `Votre série de ${streak} jour${streak > 1 ? "s" : ""} compte sur vous ce soir !` };
  }
  if (streak === 0) {
    return { mood: "wave", text: "Prêt pour un voyage dans le temps ? Lancez une nouvelle série aujourd'hui." };
  }
  if (hour < 12) {
    return { mood: "happy", text: pick(["Bonjour ! Vos 5 faits du jour vous attendent.", "Un café et un peu d'histoire ? C'est parti !"]) };
  }
  return { mood: "think", text: pick(["J'ai déniché de belles histoires pour vous aujourd'hui.", "Où voyageons-nous aujourd'hui ? Vos faits sont prêts."]) };
}

/** Minerve's reaction to a quiz answer. */
export const answerLine = (correct: boolean): MascotLine =>
  correct
    ? { mood: "cheer", text: pick(["Bravo !", "Exactement !", "Quelle mémoire !", "Parfait !"]) }
    : { mood: "sad", text: pick(["Presque ! Retenez celle-ci.", "Pas cette fois, mais vous la saurez la prochaine !", "Raté, mais c'est comme ça qu'on apprend."]) };

/** Minerve's word at the end of a quiz. */
export function quizResultLine(score: number, total: number): MascotLine {
  const ratio = total ? score / total : 0;
  if (ratio === 1) return { mood: "cheer", text: "Sans faute ! Même Alexandre serait impressionné." };
  if (ratio >= 0.7) return { mood: "happy", text: "Très beau score, vous connaissez votre histoire !" };
  if (ratio >= 0.4) return { mood: "think", text: "Pas mal ! Rejouez pour graver ces dates dans votre mémoire." };
  return { mood: "sad", text: "L'histoire se mérite : un nouvel essai ?" };
}
