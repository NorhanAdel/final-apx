"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Sparkles,
  Crown,
  Shield,
  UserRound,
  CheckCircle2,
  Clock,
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

type SubscriptionType = {
  id: string;
  package_type: string;
  status: string;
  started_at: string;
  expires_at: string;
  is_active: boolean;
  remaining_days: number;
  features: {
    max_ads: number;
    ads_used: number;
    ads_remaining: number;
    can_create_ad: boolean;
    can_send_unlimited: boolean;
    can_access_special_players: boolean;
    max_request_stars: number;
    priority_listing: boolean;
  };
};

// =========================
// QUERIES
// =========================
const GET_PACKAGES_QUERY = `
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

const GET_SUBSCRIPTION_QUERY = `
  query {
    myOrganizationSubscription {
      id
      package_type
      status
      started_at
      expires_at
      is_active
      remaining_days
      features {
        max_ads
        ads_used
        ads_remaining
        can_create_ad
        can_send_unlimited
        can_access_special_players
        max_request_stars
        priority_listing
      }
    }
  }
`;

// =========================
// PAGE
// =========================
export default function OrganizationPackagesPage() {
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const router = useRouter();

  const isDark = theme === "dark";

  const [packages, setPackages] = useState<PackageType[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionType | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadingSubscription(true);

      try {
        // =========================
        // جلب الباقات
        // =========================
        const res: any = await fetchGraphQL(GET_PACKAGES_QUERY);

        console.log("📦 Full API Response:", res);

        const allPackages = res?.data?.organizationPackages || [];
        console.log("📦 All packages:", allPackages);

        setPackages(allPackages);

        // =========================
        // جلب الاشتراك الحالي
        // =========================
        const subRes: any = await fetchGraphQL(GET_SUBSCRIPTION_QUERY);
        console.log("📋 Subscription response:", subRes);
        setSubscription(subRes?.data?.myOrganizationSubscription || null);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setPackages([]);
        setSubscription(null);
      } finally {
        setLoading(false);
        setLoadingSubscription(false);
      }
    };

    load();
  }, [lang]);

  // =========================
  // 🔥 بما أن الباقات جاية بالعربي وكلها للوكيل، خليها كلها تظهر
  // =========================
  const agentPackages = packages; // كل الباقات

  console.log("🔍 Agent packages (all):", agentPackages);

  const handleSelect = (item: PackageType) => {
    // حدد الـ package_type المناسب للـ Backend
    let enumValue = "AGENT_BASIC";
    if (item.package_type.includes("مميز")) {
      enumValue = "AGENT_PREMIUM";
    } else if (item.package_type.includes("أساسي")) {
      enumValue = "AGENT_BASIC";
    }

    localStorage.setItem(
      "selectedPackage",
      JSON.stringify({
        ...item,
        package_type: enumValue,
        group: "AGENT",
      }),
    );

    router.push("/agent/checkout");
  };

  // =========================
  // RENDER
  // =========================
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

          {/* Debug info */}
          <div className="mt-4 text-sm text-gray-400">
            {t("Total packages")}: {packages.length}
          </div>
        </div>

        {/* ========================= */}
        {/* CURRENT SUBSCRIPTION */}
        {/* ========================= */}
        {!loadingSubscription && subscription && (
          <div
            className={`mb-12 p-6 rounded-2xl border ${
              isDark
                ? "bg-[#0A1A44]/40 border-yellow-400/30"
                : "bg-white border-yellow-400/50 shadow-lg"
            }`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center">
                  <Crown className="text-yellow-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">
                    {t("Current Package")}
                  </p>
                  <h2 className="text-2xl font-bold text-yellow-400">
                    {subscription.package_type}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-400">{t("Status")}</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      subscription.is_active
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {subscription.is_active ? t("Active") : t("Expired")}
                  </span>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-400">{t("Remaining Days")}</p>
                  <p className="text-2xl font-bold text-green-400">
                    {subscription.remaining_days}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-400">{t("Ads Remaining")}</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {subscription.features.ads_remaining}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-400">{t("Max Stars")}</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {subscription.features.max_request_stars}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-400">{t("Unlimited")}</p>
                  <p className="text-2xl font-bold">
                    {subscription.features.can_send_unlimited ? "✅" : "❌"}
                  </p>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-700/30">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} className="text-green-400" />
                <span className="text-gray-400">{t("Ads")}:</span>
                <span className="font-semibold">
                  {subscription.features.ads_used}/
                  {subscription.features.max_ads}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} className="text-green-400" />
                <span className="text-gray-400">{t("Special Players")}:</span>
                <span className="font-semibold">
                  {subscription.features.can_access_special_players
                    ? "✅"
                    : "❌"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} className="text-green-400" />
                <span className="text-gray-400">{t("Priority Listing")}:</span>
                <span className="font-semibold">
                  {subscription.features.priority_listing ? "✅" : "❌"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-yellow-400" />
                <span className="text-gray-400">{t("Expires")}:</span>
                <span className="font-semibold">
                  {new Date(subscription.expires_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================= */}
        {/* NO SUBSCRIPTION MESSAGE */}
        {/* ========================= */}
        {!loadingSubscription && !subscription && (
          <div
            className={`mb-12 p-6 rounded-2xl border ${
              isDark
                ? "bg-[#0A1A44]/40 border-blue-400/30"
                : "bg-white border-blue-400/50 shadow-lg"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-400/20 flex items-center justify-center">
                <Shield className="text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  {t("Subscription Status")}
                </p>
                <h2 className="text-2xl font-bold text-blue-400">
                  {t("No Active Subscription")}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {t("Choose a package below to get started")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================= */}
        {/* PACKAGES GRID */}
        {/* ========================= */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-14 h-14 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : agentPackages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl mb-4">😅</p>
            <p className="text-gray-400">{t("No packages available")}</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {agentPackages.map((item, index) => {
              const isCurrentPackage =
                subscription?.package_type === item.package_type;

              return (
                <div
                  key={item.id}
                  className={`relative group transition-all duration-500 ${
                    isCurrentPackage ? "scale-105" : "hover:-translate-y-3"
                  }`}
                >
                  {/* GLOW BORDER */}
                  <div
                    className={`absolute inset-0 p-[1px] rounded-[30px] bg-gradient-to-br ${
                      isCurrentPackage
                        ? "from-yellow-400 to-yellow-600"
                        : "from-cyan-400 to-blue-500"
                    }`}
                  />

                  {/* CARD */}
                  <div
                    className={`relative rounded-[30px] p-8 backdrop-blur-2xl shadow-2xl
                    ${isDark ? "bg-[#0f172a]/90" : "bg-white/90"} ${
                      isCurrentPackage ? "border-2 border-yellow-400/50" : ""
                    }`}
                  >
                    {/* CURRENT BADGE */}
                    {isCurrentPackage && (
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-yellow-400 text-black text-xs font-bold">
                        {t("CURRENT")}
                      </div>
                    )}

                    {/* ICON */}
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                        isCurrentPackage
                          ? "from-yellow-400 to-yellow-600"
                          : "from-cyan-400 to-blue-500"
                      } flex items-center justify-center`}
                    >
                      {isCurrentPackage ? (
                        <Crown className="text-white" size={26} />
                      ) : (
                        <UserRound className="text-white" size={26} />
                      )}
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

                      <Feature
                        text={`${item.max_request_stars} ${t("Request Stars")}`}
                      />

                      <Feature
                        text={
                          item.priority_listing
                            ? t("Priority Listing")
                            : t("No Priority")
                        }
                      />
                    </div>

                    {/* BUTTON */}
                    {isCurrentPackage ? (
                      <button
                        disabled
                        className={`mt-10 w-full py-4 rounded-2xl font-bold text-black bg-gray-400 cursor-not-allowed`}
                      >
                        {t("Current Package")}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSelect(item)}
                        className={`mt-10 w-full py-4 rounded-2xl font-bold text-black bg-yellow-400 hover:bg-yellow-500 transition`}
                      >
                        {t("Upgrade Now")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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
