"use client";

import { useEffect, useState, useCallback } from "react";

export default function useTranslate(langFromProps?: string) {
  const [lang, setLang] = useState(langFromProps || "en");
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const loadTranslations = useCallback(async (code: string) => {
    try {
      const file = await import(`../locales/${code}.json`);
      setTranslations(file.default);
    } catch {
      try {
        const fallback = await import(`../locales/en.json`);
        setTranslations(fallback.default);
      } catch {
        setTranslations({});
      }
    }
  }, []);

  useEffect(() => {
    const savedLang =
      langFromProps ||
      (typeof window !== "undefined" && localStorage.getItem("lang")) ||
      "en";
    setLang(savedLang as string);
    loadTranslations(savedLang as string);
  }, [langFromProps, loadTranslations]);

  const changeLang = useCallback(
    async (code: string) => {
      setLang(code);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("lang", code);
        } catch {}
      }
      await loadTranslations(code);
    },
    [loadTranslations],
  );

  const t = useCallback((key: string) => translations[key] ?? key, [
    translations,
  ]);

  return { t, lang, changeLang } as const;
}
