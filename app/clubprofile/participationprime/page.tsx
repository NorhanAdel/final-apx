"use client";

import { useEffect, useState } from "react";

import {
  Building2,
  Sparkles,
  CheckCircle2,
  Megaphone,
  Shield,
  Star,
  Send,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";

import BackButton from "@/app/components/BackButton";

import { fetchGraphQL } from "../../lib/fetchGraphQL";

import { useRouter } from "next/navigation";
import useTranslate from "@/app/hooks/useTranslate";

// =========================
// TYPES
// =========================
type OrganizationPackageType = {
  id: string;

  package_type: string;

  price: number;

  max_ads: number;

  can_send_unlimited: boolean;

  can_access_special_players: boolean;

  max_request_stars: number;

  priority_listing: boolean;

  is_active: boolean;
};

export default function OrganizationPackagesPage() {
  const { theme } = useTheme();

  const router = useRouter();

  const isDark = theme === "dark";

  const { t } = useTranslate();

  const [packages, setPackages] = useState<OrganizationPackageType[]>([]);

  const [loading, setLoading] = useState(true);

  // =========================
  // QUERY
  // =========================
  const GET_ORGANIZATION_PACKAGES = `
    query OrganizationPackages {
      organizationPackages {
        id

        package_type

        price

        max_ads

        can_send_unlimited

        can_access_special_players

        max_request_stars

        priority_listing

        is_active
      }
    }
  `;

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);

        const res: any = await fetchGraphQL(GET_ORGANIZATION_PACKAGES);

        console.log("ORGANIZATION PACKAGES:", res);

        setPackages(res?.data?.organizationPackages || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // =========================
  // LABEL
  // =========================
  const normalizeLabel = (type: string) => {
    switch (type) {
      case "SCOUT_BASIC":
      case "CLUB_BASIC":
      case "أساسي":
        return t("BASIC");

      case "SCOUT_PREMIUM":
      case "CLUB_PREMIUM":
      case "محترف":
        return t("PREMIUM");

      default:
        return type;
    }
  };

  // =========================
  // SELECT PACKAGE
  // =========================
  const handleSelectPackage = (item: OrganizationPackageType) => {
    let realEnum = item.package_type;

    // =========================
    // ENUM FIX
    // =========================
    if (realEnum === "Basic Scout" || realEnum === "كشاف أساسي") {
      realEnum = "SCOUT_BASIC";
    }

    if (realEnum === "Premium Scout" || realEnum === "كشاف محترف") {
      realEnum = "SCOUT_PREMIUM";
    }

    if (realEnum === "Basic Club" || realEnum === "نادي أساسي") {
      realEnum = "CLUB_BASIC";
    }

    if (realEnum === "Premium Club" || realEnum === "نادي محترف") {
      realEnum = "CLUB_PREMIUM";
    }

    console.log("ORGANIZATION ENUM:", realEnum);

    localStorage.setItem(
      "selectedOrganizationPackage",

      JSON.stringify({
        id: item.id,

        package_type: realEnum,

        package_label: normalizeLabel(realEnum),

        price: item.price,

        max_ads: item.max_ads,

        can_send_unlimited: item.can_send_unlimited,

        can_access_special_players: item.can_access_special_players,

        max_request_stars: item.max_request_stars,

        priority_listing: item.priority_listing,
      }),
    );

    router.push("/clubprofile/club-checkout");
  };

  return (
    <div
      className={`min-h-screen py-32 px-4 relative overflow-hidden
      ${isDark ? "bg-[#0b1120] text-white" : "bg-[#eef4ff] text-black"}`}
    >
      {/* BG */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[140px] rounded-full" />

      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-400/10 blur-[140px] rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* BACK */}
        <div className="mb-8">
          <BackButton />
        </div>

        {/* HEADER */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-xl px-5 py-2 rounded-full mb-6">
            <Sparkles size={16} className="text-yellow-400" />

            <span className="text-yellow-400 text-sm font-bold uppercase tracking-widest">
              {t("Organization Membership")}
            </span>
          </div>

          <h1 className="text-5xl font-black">{t("title")}</h1>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-14 h-14 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
            {packages
              .filter((p) => p.is_active)
              .map((item, index) => (
                <PlanCard
                  key={item.id}
                  item={item}
                  index={index}
                  t={t}
                  isDark={isDark}
                  label={normalizeLabel(item.package_type)}
                  onSelect={handleSelectPackage}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =========================
// CARD
// =========================
function PlanCard({ item, index, t, isDark, label, onSelect }: any) {
  const themes = [
    {
      accent: "from-orange-400 to-amber-500",
    },

    {
      accent: "from-cyan-400 to-blue-500",
    },
  ];

  const theme = themes[index % themes.length];

  return (
    <div
      className={`
        relative group transition-all duration-500
        ${
          index === 1
            ? "z-20 scale-105 -translate-y-5"
            : "z-10 hover:-translate-y-3"
        }
      `}
    >
      {/* BORDER */}
      <div
        className={`absolute inset-0 p-[1px] rounded-[30px] bg-gradient-to-br ${theme.accent}`}
      />

      {/* CARD */}
      <div
        className={`
          relative rounded-[30px] p-8 h-full backdrop-blur-2xl
          ${isDark ? "bg-[#0f172a]/90" : "bg-white/90"}
          shadow-2xl
        `}
      >
        {/* ICON */}
        <div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.accent} flex items-center justify-center`}
        >
          <Building2 className="text-white" size={26} />
        </div>

        {/* TITLE */}
        <h2 className="mt-6 text-2xl font-black">{label}</h2>

        {/* PRICE */}
        <div className="mt-5 flex items-end gap-2">
          <span className="text-5xl font-black">${item.price}</span>

          <span className="text-sm text-gray-400 mb-2">/ {t("package")}</span>
        </div>

        {/* FEATURES */}
        <div className="mt-8 space-y-3">
          <Feature
            icon={<Megaphone size={18} />}
            text={`${item.max_ads} ${t("ads")}`}
          />

          <Feature
            icon={<Send size={18} />}
            text={
              item.can_send_unlimited ? t("unlimitedSend") : t("limitedSend")
            }
          />

          <Feature
            icon={<Shield size={18} />}
            text={
              item.can_access_special_players
                ? t("specialPlayers")
                : t("normalPlayers")
            }
          />

          <Feature
            icon={<Star size={18} />}
            text={`${item.max_request_stars} ${t("stars")}`}
          />

          <Feature
            icon={<CheckCircle2 size={18} />}
            text={item.priority_listing ? t("priority") : t("noPriority")}
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={() => onSelect(item)}
          className={`mt-10 w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r ${theme.accent}`}
        >
          {t("upgrade")}
        </button>
      </div>
    </div>
  );
}

// =========================
// FEATURE
// =========================
function Feature({ text, icon }: any) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-3 text-cyan-400">
        {icon}

        <span className="text-sm font-medium">{text}</span>
      </div>

      <CheckCircle2 size={18} className="text-green-400" />
    </div>
  );
}
