import type { ReactNode } from "react";
import PublicPage from "@/components/PublicPage";
import { usePageMeta } from "@/hooks/use-page-meta";
import { LEGAL } from "@/lib/legal";

/** A legal page: title, date of the last update, then numbered sections. */
export const LegalDoc = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => {
  usePageMeta(title, description);
  return (
    <PublicPage>
      <article className="space-y-6 rounded-2xl bg-card p-5 card-shadow sm:p-8 [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold leading-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">Dernière mise à jour : {LEGAL.updated}</p>
        </header>
        {children}
      </article>
    </PublicPage>
  );
};

export const LegalSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="space-y-2 text-[15px] leading-relaxed text-foreground/90 [&_li]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1">
    <h2 className="text-xl font-bold text-foreground">{title}</h2>
    {children}
  </section>
);

export const ContactLink = () => <a href={`mailto:${LEGAL.contact}`}>{LEGAL.contact}</a>;
