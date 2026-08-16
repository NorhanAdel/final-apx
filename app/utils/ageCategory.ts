export interface AgeCategoryInfo {
  code: "U11" | "U13" | "U15" | "U17" | "U19" | "SENIOR";
}

export function getAgeCategory(
  dateOfBirth: Date | string | null | undefined,
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

  return { code };
}