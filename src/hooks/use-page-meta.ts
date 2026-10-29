import { useEffect } from "react";

/** The tab title and search snippet of a public page; back to the defaults on leaving. */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const before = { title: document.title, description: meta?.content };
    document.title = `${title} | CulturHist`;
    if (meta && description) meta.content = description;
    return () => {
      document.title = before.title;
      if (meta && before.description !== undefined) meta.content = before.description;
    };
  }, [title, description]);
}
