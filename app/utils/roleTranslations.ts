type RoleType = "PLAYER" | "CLUB" | "ADMIN" | "SCOUT" | "AGENT" | "USER";

interface RoleTranslation {
  en: string;
  ar: string;
  pt: string;
  zh: string;
}

const ROLE_TRANSLATIONS: Record<RoleType, RoleTranslation> = {
  PLAYER: {
    en: "Player",
    ar: "لاعب",
    pt: "Jogador",
    zh: "玩家"
  },
  CLUB: {
    en: "Club",
    ar: "نادي",
    pt: "Clube",
    zh: "俱乐部"
  },
  ADMIN: {
    en: "Admin",
    ar: "مدير",
    pt: "Administrador",
    zh: "管理员"
  },
  SCOUT: {
    en: "Scout",
    ar: "كشاف",
    pt: "Olheiro",
    zh: "球探"
  },
  AGENT: {
    en: "Agent",
    ar: "وكيل",
    pt: "Agente",
    zh: "经纪人"
  },
  USER: {
    en: "User",
    ar: "مستخدم",
    pt: "Usuário",
    zh: "用户"
  }
};

export const translateRole = (
  role: RoleType,
  lang: string
): string => {
  const translation = ROLE_TRANSLATIONS[role];
  if (!translation) return role;
  
  switch (lang) {
    case "ar":
      return translation.ar;
    case "pt":
      return translation.pt;
    case "zh":
      return translation.zh;
    case "en":
    default:
      return translation.en;
  }
};