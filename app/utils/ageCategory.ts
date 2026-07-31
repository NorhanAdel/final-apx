export interface AgeCategoryInfo {
  code: "U11" | "U13" | "U15" | "U17" | "U19" | "SENIOR";
  name: string;
}

export function getAgeCategory(
  dateOfBirth: Date | string | null | undefined,
  lang: string = "ar",
  serverCategoryName?: string | null,
): AgeCategoryInfo | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  let code: "U11" | "U13" | "U15" | "U17" | "U19" | "SENIOR";
  if (age < 11) {
    code = "U11";
  } else if (age < 13) {
    code = "U13";
  } else if (age < 15) {
    code = "U15";
  } else if (age < 17) {
    code = "U17";
  } else if (age < 19) {
    code = "U19";
  } else {
    code = "SENIOR";
  }

  const translations: Record<string, Record<string, string>> = {
    U11: {
      ar: "فئة تحت 11 سنة (U11) - البراعم",
      en: "Under 11 (U11) - Grassroots",
      pt: "Sub-11 (U11) - Infantis",
      zh: "11岁以下 (U11) - 青训",
    },
    U13: {
      ar: "فئة تحت 13 سنة (U13) - الأشبال",
      en: "Under 13 (U13) - Cubs",
      pt: "Sub-13 (U13) - Iniciantes",
      zh: "13岁以下 (U13) - 少儿",
    },
    U15: {
      ar: "فئة تحت 15 سنة (U15) - الناشئين",
      en: "Under 15 (U15) - Juniors",
      pt: "Sub-15 (U15) - Juvenis",
      zh: "15岁以下 (U15) - 少年",
    },
    U17: {
      ar: "فئة تحت 17 سنة (U17) - الشباب",
      en: "Under 17 (U17) - Youth",
      pt: "Sub-17 (U17) - Juvenil",
      zh: "17岁以下 (U17) - 青年",
    },
    U19: {
      ar: "فئة تحت 19 سنة (U19) - الأولمبي",
      en: "Under 19 (U19) - Olympic",
      pt: "Sub-19 (U19) - Olímpico",
      zh: "19岁以下 (U19) - 国奥",
    },
    SENIOR: {
      ar: "فئة 19 سنة وما فوق - (الكبار) الفريق الأول",
      en: "19+ (Seniors) - First Team",
      pt: "19+ (Sênior) - Equipe Principal",
      zh: "19岁及以上 - (成年) 一线队",
    },
  };

  const normalizedLang = (lang || "ar").toLowerCase();
  const langKey = ["ar", "en", "pt", "zh"].includes(normalizedLang)
    ? normalizedLang
    : "ar";

  const name =
    translations[code]?.[langKey] ||
    serverCategoryName ||
    translations[code]["ar"];

  return { code, name };
}
