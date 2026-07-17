export const translations: Record<string, Record<string, string>> = {
  en: {
    // Navigation
    Home: "Home",
    Reels: "Reels",
    Players: "Players",
    Scales: "Scales",
    Blog: "Blog",
    Events: "Events",
    Championships: "Championships",
    Sports: "Sports",
    
    // Auth
    Login: "Login",
    Logout: "Logout",
    "My Profile": "My Profile",
    "View Profile": "View Profile",
    Language: "Language",
    
    // Roles
    PLAYER: "Player",
    CLUB: "Club",
    ADMIN: "Admin",
    SCOUT: "Scout",
    AGENT: "Agent",
    USER: "User",
    
    // Languages names
    "English": "English",
    "Arabic": "Arabic",
    "Portuguese": "Portuguese",
    "Chinese": "Chinese",
    
    // Language codes
    "EN": "EN",
    "AR": "AR",
    "PT": "PT",
    "ZH": "ZH"
  },
  ar: {
    // Navigation
    Home: "الرئيسية",
    Reels: "ريلز",
    Players: "اللاعبين",
    Scales: "المقاييس",
    Blog: "المدونة",
    Events: "الفعاليات",
    Championships: "البطولات",
    Sports: "الرياضات",
    
    // Auth
    Login: "تسجيل الدخول",
    Logout: "تسجيل الخروج",
    "My Profile": "ملفي الشخصي",
    "View Profile": "عرض الملف الشخصي",
    Language: "اللغة",
    
    // Roles
    PLAYER: "لاعب",
    CLUB: "نادي",
    ADMIN: "مدير",
    SCOUT: "كشاف",
    AGENT: "وكيل",
    USER: "مستخدم",
    
    // Languages names
    "English": "الإنجليزية",
    "Arabic": "العربية",
    "Portuguese": "البرتغالية",
    "Chinese": "الصينية",
    
    // Language codes
    "EN": "إنجليزي",
    "AR": "عربي",
    "PT": "برتغالي",
    "ZH": "صيني"
  },
  pt: {
    // Navigation
    Home: "Início",
    Reels: "Reels",
    Players: "Jogadores",
    Scales: "Escalas",
    Blog: "Blog",
    Events: "Eventos",
    Championships: "Campeonatos",
    Sports: "Esportes",
    
    // Auth
    Login: "Entrar",
    Logout: "Sair",
    "My Profile": "Meu Perfil",
    "View Profile": "Ver Perfil",
    Language: "Idioma",
    
    // Roles
    PLAYER: "Jogador",
    CLUB: "Clube",
    ADMIN: "Administrador",
    SCOUT: "Olheiro",
    AGENT: "Agente",
    USER: "Usuário",
    
    // Languages names
    "English": "Inglês",
    "Arabic": "Árabe",
    "Portuguese": "Português",
    "Chinese": "Chinês",
    
    // Language codes
    "EN": "EN",
    "AR": "AR",
    "PT": "PT",
    "ZH": "ZH"
  },
  zh: {
    // Navigation
    Home: "首页",
    Reels: "短视频",
    Players: "球员",
    Scales: "评分",
    Blog: "博客",
    Events: "活动",
    Championships: "锦标赛",
    Sports: "体育",
    
    // Auth
    Login: "登录",
    Logout: "退出",
    "My Profile": "我的资料",
    "View Profile": "查看资料",
    Language: "语言",
    
    // Roles
    PLAYER: "玩家",
    CLUB: "俱乐部",
    ADMIN: "管理员",
    SCOUT: "球探",
    AGENT: "经纪人",
    USER: "用户",
    
    // Languages names
    "English": "英语",
    "Arabic": "阿拉伯语",
    "Portuguese": "葡萄牙语",
    "Chinese": "中文",
    
    // Language codes
    "EN": "英语",
    "AR": "阿拉伯",
    "PT": "葡萄牙",
    "ZH": "中文"
  }
};

export const translate = (key: string, lang: string): string => {
  return translations[lang]?.[key] || translations['en']?.[key] || key;
};

export const translateRole = (role: string, lang: string): string => {
  return translate(role, lang);
};