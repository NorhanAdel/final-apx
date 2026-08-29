"use client";

import { useEffect, useState, useCallback } from "react";

const FALLBACK_STRINGS: Record<string, Record<string, string>> = {
  ar: {
    checking_permissions: "جاري التحقق من الصلاحيات...",
    access_denied: "تم رفض الوصول",
    access_denied_description: "ليس لديك صلاحية لهذا القسم",
    please_login_first: "يرجى تسجيل الدخول أولاً",
    please_login_first_to_access: "يرجى تسجيل الدخول أولاً للوصول لهذه الصفحة",
    loading: "جاري التحميل...",
  },
  en: {
    checking_permissions: "Checking permissions...",
    access_denied: "Access Denied",
    access_denied_description: "You do not have permission for this section",
    please_login_first: "Please log in first",
    please_login_first_to_access: "Please log in first to access this page",
    loading: "Loading...",
  },
  pt: {
    checking_permissions: "Verificando permissões...",
    access_denied: "Acesso Negado",
    access_denied_description: "Você não tem permissão para esta seção",
    please_login_first: "Por favor, faça login primeiro",
    please_login_first_to_access: "Por favor, faça login primeiro para acessar esta página",
    loading: "Carregando...",
  },
  zh: {
    checking_permissions: "正在检查权限...",
    access_denied: "访问被拒绝",
    access_denied_description: "您没有此部分的权限",
    please_login_first: "请先登录",
    please_login_first_to_access: "请先登录以访问此页面",
    loading: "加载中...",
  },
};

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

  const t = useCallback(
    (key: string) => {
      if (translations[key]) return translations[key];
      if (FALLBACK_STRINGS[lang]?.[key]) return FALLBACK_STRINGS[lang][key];
      if (FALLBACK_STRINGS.en?.[key]) return FALLBACK_STRINGS.en[key];
      return key;
    },
    [translations, lang],
  );

  return { t, lang, changeLang } as const;
}
