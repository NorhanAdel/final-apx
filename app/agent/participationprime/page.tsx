"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Sparkles,
  Crown,
  Shield,
  UserRound,
  CheckCircle2,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import useTranslate from "@/app/hooks/useTranslate";

// =========================
// TYPES
// =========================
type PackageType = {
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

// =========================
// NORMALIZE
// =========================
const normalizeType = (type: string) => {
  const v = type.toLowerCase();

  if (v.includes("scout") || v.includes("كشاف")) return "SCOUT";
  if (v.includes("club") || v.includes("نادي")) return "CLUB";
  if (v.includes("agent") || v.includes("وكيل")) return "AGENT";

  return "UNKNOWN";
};

// =========================
// PAGE
// =========================
export default function OrganizationPackagesPage() {
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const router = useRouter();

  const isDark = theme === "dark";

  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);

  const QUERY = `
    query {
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

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        // ✅ fetchGraphQL هتبعت Accept-Language تلقائياً
        const res: any = await fetchGraphQL(QUERY);

        console.log("📦 Packages response:", res);
        console.log("🌐 Current language:", lang);
        
        setPackages(res?.data?.organizationPackages || []);
      } catch (error) {
        console.error("Error fetching packages:", error);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [lang]);

  // ✅ تصفية الباقات - بس الـ Agent
  const agentPackages = packages.filter(
    (p) => normalizeType(p.package_type) === "AGENT"
  );

  const handleSelect = (item: PackageType) => {
    let enumValue = "AGENT_BASIC";

    localStorage.setItem(
      "selectedPackage",
      JSON.stringify({
        ...item,
        package_type: enumValue,
        group: "AGENT",
      })
    );

    router.push("/agent/checkout");
  };

  return (
    <div
      className={`min-h-screen py-40 px-4 ${
        isDark ? "bg-[#0b1120] text-white" : "bg-[#eef4ff] text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 px-5 py-2 rounded-full mb-5">
            <Sparkles className="text-yellow-400" />
            <span className="text-yellow-400 text-sm font-bold">
              {t("Premium Packages")}
            </span>
          </div>

          <h1 className="text-5xl font-black">{t("Agent Packages")}</h1>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-14 h-14 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : agentPackages.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            {t("No packages available")}
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {agentPackages.map((item, index) => (
              <div
                key={item.id}
                className="relative group transition-all duration-500 hover:-translate-y-3"
              >
                {/* GLOW BORDER */}
                <div
                  className={`absolute inset-0 p-[1px] rounded-[30px] bg-gradient-to-br from-cyan-400 to-blue-500`}
                />

                {/* CARD */}
                <div
                  className={`relative rounded-[30px] p-8 backdrop-blur-2xl shadow-2xl
                  ${
                    isDark
                      ? "bg-[#0f172a]/90"
                      : "bg-white/90"
                  }`}
                >
                  {/* ICON */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center`}
                  >
                    <UserRound className="text-white" size={26} />
                  </div>

                  {/* TITLE */}
                  <h2 className="mt-6 text-2xl font-black">
                    {item.package_type}
                  </h2>

                  {/* PRICE */}
                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-5xl font-black text-yellow-400">
                      ${item.price}
                    </span>
                    <span className="text-sm text-gray-400 mb-2">
                      / {t("package")}
                    </span>
                  </div>

                  {/* FEATURES */}
                  <div className="mt-8 space-y-3 text-sm">
                    <Feature text={`${item.max_ads} ${t("Ads")}`} />

                    <Feature
                      text={
                        item.can_send_unlimited
                          ? t("Unlimited Requests")
                          : t("Limited Requests")
                      }
                    />

                    <Feature
                      text={
                        item.can_access_special_players
                          ? t("Special Players Access")
                          : t("Normal Access")
                      }
                    />

                    <Feature text={`${item.max_request_stars} ${t("Request Stars")}`} />

                    <Feature
                      text={
                        item.priority_listing
                          ? t("Priority Listing")
                          : t("No Priority")
                      }
                    />
                  </div>

                  {/* BUTTON */}
                  <button
                    onClick={() => handleSelect(item)}
                    className={`mt-10 w-full py-4 rounded-2xl font-bold text-black bg-yellow-400 hover:bg-yellow-500 transition`}
                  >
                    {t("Upgrade Now")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =========================
// FEATURE
// =========================
function Feature({ text }: any) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10">
      <span className="text-gray-300">{text}</span>
      <CheckCircle2 size={18} className="text-green-400" />
    </div>
  );
}