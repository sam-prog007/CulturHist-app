// Onboarding answers given before the account can be used. With e-mail
// confirmation on, sign-up returns no session, so the answers wait in this
// browser and are saved to the profile on the first visit once signed in.
import { supabase } from "@/integrations/supabase/client";

const KEY = "culturhist-pending-onboarding";

export type OnboardingAnswers = {
  profile_type: string;
  learning_goal: string;
  preferred_regions: string[];
  preferred_eras: string[];
  preferred_difficulty: string[];
};

export function savePendingOnboarding(answers: OnboardingAnswers) {
  try {
    localStorage.setItem(KEY, JSON.stringify(answers));
  } catch {
    // Storage blocked: the user will simply be asked again after signing in.
  }
}

function readPendingOnboarding(): OnboardingAnswers | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as OnboardingAnswers) : null;
  } catch {
    return null;
  }
}

export function clearPendingOnboarding() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}

/** Saves waiting answers to the profile. Returns true when onboarding is now complete. */
export async function applyPendingOnboarding(userId: string): Promise<boolean> {
  const answers = readPendingOnboarding();
  if (!answers) return false;
  const { error } = await supabase
    .from("profiles")
    .update({ ...answers, onboarding_completed: true })
    .eq("id", userId);
  if (error) return false;
  clearPendingOnboarding();
  return true;
}
