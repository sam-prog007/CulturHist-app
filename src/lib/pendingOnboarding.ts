// Onboarding answers, given once at sign-up. When the account must first be
// confirmed by e-mail, sign-up returns no session: the answers wait in this
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

type Pending = { email: string; answers: OnboardingAnswers };

/** Saves the answers to the profile and marks onboarding as done. */
export async function saveOnboardingAnswers(userId: string, answers: OnboardingAnswers): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .update({ ...answers, onboarding_completed: true })
    .eq("id", userId);
  return !error;
}

export function savePendingOnboarding(email: string, answers: OnboardingAnswers) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ email: email.toLowerCase(), answers } satisfies Pending));
  } catch {
    // Storage blocked: the preferences can still be set from the settings.
  }
}

function readPendingOnboarding(): Pending | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Pending) : null;
  } catch {
    return null;
  }
}

function clearPendingOnboarding() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}

/** Saves the answers waiting for this account, if any. Returns true when they were saved. */
export async function applyPendingOnboarding(userId: string, email: string | undefined): Promise<boolean> {
  const pending = readPendingOnboarding();
  if (!pending?.answers || !email || pending.email !== email.toLowerCase()) return false;
  if (!(await saveOnboardingAnswers(userId, pending.answers))) return false;
  clearPendingOnboarding();
  return true;
}
