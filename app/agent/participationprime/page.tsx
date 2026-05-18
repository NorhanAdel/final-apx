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
// TRANSLATIONS
// =========================
const t: any = {
  en: {
    title: "Organization Packages",
    upgrade: "Upgrade Now",
    ads: "Ads",
    unlimited: "Unlimited Send",
    limited: "Limited Send",
    special: "Special Players",
    normal: "Normal Access",
    stars: "Stars",
    priority: "Priority Listing",
    noPriority: "No Priority",

    SCOUT: "Scout",
    CLUB: "Club",
    AGENT: "Agent",
  },

  ar: {
    title: "باقات المنظمات",
    upgrade: "اشترك الآن",
    ads: "إعلانات",
    unlimited: "إرسال غير محدود",
    limited: "إرسال محدود",
    special: "لاعبين مميزين",
    normal: "وصول عادي",
    stars: "نجوم",
    priority: "أولوية",
    noPriority: "بدون أولوية",

    SCOUT: "كشاف",
    CLUB: "نادي",
    AGENT: "وكيل",
  },
};

// =========================
// NORMALIZE
// =========================
const normalizeType = (type: string) => {
  const v = type.toLowerCase();

  if (v.includes("scout") || v.includes("كشاف"))
    return "SCOUT";

  if (v.includes("club") || v.includes("نادي"))
    return "CLUB";

  if (v.includes("agent") || v.includes("وكيل"))
    return "AGENT";

  return "UNKNOWN";
};

// =========================
// PAGE
// =========================
export default function OrganizationPackagesPage() {
  const { theme } = useTheme();
  const router = useRouter();

  const isDark = theme === "dark";

  const lang =
    typeof window !== "undefined"
      ? localStorage.getItem("lang") || "en"
      : "en";

  const trans = t[lang] || t.en;

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

      const res: any = await fetchGraphQL(QUERY);

      setPackages(res?.data?.organizationPackages || []);

      setLoading(false);
    };

    load();
  }, []);

  const handleSelect = (item: PackageType) => {
    const type = normalizeType(item.package_type);

    let enumValue = "";

    if (type === "SCOUT") enumValue = "SCOUT_BASIC";
    if (type === "CLUB") enumValue = "CLUB_BASIC";
    if (type === "AGENT") enumValue = "AGENT_BASIC";

    localStorage.setItem(
      "selectedPackage",
      JSON.stringify({
        ...item,
        package_type: enumValue,
        group: type,
      })
    );

    router.push("/agent/checkout");
  };

  const groups = [
    {
      type: "SCOUT",
      icon: Shield,
      color: "from-orange-400 to-amber-500",
    },
    {
      type: "CLUB",
      icon: Crown,
      color: "from-yellow-300 to-yellow-500",
    },
    {
      type: "AGENT",
      icon: UserRound,
      color: "from-cyan-400 to-blue-500",
    },
  ];

  return (
    <div
      className={`min-h-screen py-28 px-4 ${
        isDark
          ? "bg-[#0b1120] text-white"
          : "bg-[#eef4ff] text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 px-5 py-2 rounded-full mb-5">
            <Sparkles className="text-yellow-400" />
            <span className="text-yellow-400 text-sm font-bold">
              Premium Packages
            </span>
          </div>

          <h1 className="text-5xl font-black">
            {trans.title}
          </h1>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-14 h-14 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          groups.map((group, i) => {
            const Icon = group.icon;

            const filtered = packages.filter(
              (p) => normalizeType(p.package_type) === group.type
            );

            return (
              <div key={i} className="mb-20">

                {/* SECTION TITLE
                <div className="flex items-center gap-3 mb-6">
                  <Icon className="text-yellow-400" />
                  <h2 className="text-2xl font-bold">
                    {trans[group.type]}
                  </h2>
                </div> */}

                {/* GRID (CLUB STYLE) */}
                <div className="grid lg:grid-cols-3 gap-8">
                  {filtered.map((item, index) => (
                    <div
                      key={item.id}
                      className="relative group transition-all duration-500 hover:-translate-y-3"
                    >
                      {/* GLOW BORDER */}
                      <div
                        className={`absolute inset-0 p-[1px] rounded-[30px] bg-gradient-to-br ${group.color}`}
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
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${group.color} flex items-center justify-center`}
                        >
                          <Icon className="text-white" size={26} />
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
                            / package
                          </span>
                        </div>

                        {/* FEATURES */}
                        <div className="mt-8 space-y-3 text-sm">

                          <Feature text={`${item.max_ads} ${trans.ads}`} />

                          <Feature
                            text={
                              item.can_send_unlimited
                                ? trans.unlimited
                                : trans.limited
                            }
                          />

                          <Feature
                            text={
                              item.can_access_special_players
                                ? trans.special
                                : trans.normal
                            }
                          />

                          <Feature text={`${item.max_request_stars} ${trans.stars}`} />

                          <Feature
                            text={
                              item.priority_listing
                                ? trans.priority
                                : trans.noPriority
                            }
                          />

                        </div>

                        {/* BUTTON */}
                        <button
                          onClick={() => handleSelect(item)}
                          className={`mt-10 w-full py-4 rounded-2xl font-bold text-black bg-yellow-400`}
                        >
                          {trans.upgrade}
                        </button>

                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })
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
