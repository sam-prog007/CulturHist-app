import { LEGAL } from "@/lib/legal";

export interface ShareContent {
  title: string;
  text?: string;
  url: string;
}

/** A fact's public page: anyone can open it without an account. */
export const factShare = (fact: { slug: string; title: string; dateText?: string | null }): ShareContent => ({
  title: fact.title,
  text: fact.dateText ? `${fact.title} (${fact.dateText}), à lire sur CulturHist` : `${fact.title}, à lire sur CulturHist`,
  url: `${LEGAL.url}/faits/${fact.slug}`,
});

export const quoteShare = (quote: { text_fr: string; author: string }): ShareContent => ({
  title: `Citation de ${quote.author}`,
  text: `« ${quote.text_fr} » ${quote.author}. La citation du jour sur CulturHist :`,
  url: LEGAL.url,
});

export const appInvite: ShareContent = {
  title: "CulturHist",
  text: "J'apprends l'histoire 5 minutes par jour avec CulturHist, avec Napoléon comme guide. Essaie :",
  url: LEGAL.url,
};

/**
 * Opens the phone's share sheet, or copies the link where there is none
 * (most desktop browsers). Says which one happened: "shared", "copied" or
 * "cancelled"; throws only when neither worked.
 */
export async function share(content: ShareContent): Promise<"shared" | "copied" | "cancelled"> {
  const data = { title: content.title, text: content.text, url: content.url };
  if (typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare(data))) {
    try {
      await navigator.share(data);
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
      // Refused (e.g. not allowed in this frame): fall back to copying.
    }
  }
  await navigator.clipboard.writeText(content.text ? `${content.text} ${content.url}` : content.url);
  return "copied";
}
