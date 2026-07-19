"use client";

import { useEffect, useState } from "react";
import {
  Camera,
  Video,
  Megaphone,
  Crown,
  Sparkles,
  CheckCircle2,
  Shield,
  Clock,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import BackButton from "@/app/components/BackButton";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import { useRouter } from "next/navigation";
import useTranslate from "@/app/hooks/useTranslate";

// =========================
// TYPES
// =========================
type PackageType = {
  id: string;
  package_type: string;
  price: number;
  max_photos: number;
  max_videos: number;
  max_ads: number;
  is_active: boolean;
};

type SubscriptionType = {
  id: string;
  status: string;
  started_at: string;
  expires_at: string;
  is_active: boolean;
  remaining_days: number;
  package: {
    package_type: string;
    max_photos: number;
    max_videos: number;
    max_ads: number;
  };
  photos_used: number;
  videos_used: number;
  ads_used: number;
  photos_remaining: number;
  videos_remaining: number;
  ads_remaining: number;
};

// =========================
// QUERIES
// =========================
const GET_PLAYER_PACKAGES = `
  query {
    playerPackages {
      id
      package_type
      price
      max_photos
      max_videos
      max_ads
      is_active
    }
  }
`;

const GET_MY_SUBSCRIPTIONS = `
  query {
    mySubscriptions {
      id
      status
      started_at
      expires_at
      is_active
      remaining_days
      package {
        package_type
        max_photos
        max_videos
        max_ads
      }
      photos_used
      videos_used
      ads_used
      photos_remaining
      videos_remaining
      ads_remaining
    }
  }
`;

// =========================
// PAGE
// =========================
export default function PlayerPackagesPage() {
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

  // =========================
  // GET DATA
  // =========================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setLoadingSubscription(true);

      try {
        // جلب الباقات
        const res: any = await fetchGraphQL(GET_PLAYER_PACKAGES);
        console.log("📦 Packages response:", res);
        setPackages(res?.data?.playerPackages || []);

        // جلب الاشتراك الحالي
        const subRes: any = await fetchGraphQL(GET_MY_SUBSCRIPTIONS);
        console.log("📋 Subscription response:", subRes);

        if (subRes?.errors) {
          console.error(
            "❌ GraphQL errors in subscription query:",
            subRes.errors,
          );
        }

        const subscriptions = subRes?.data?.mySubscriptions || [];
        setSubscription(subscriptions.length > 0 ? subscriptions[0] : null);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setPackages([]);
        setSubscription(null);
      } finally {
        setLoading(false);
        setLoadingSubscription(false);
      }
    };

    fetchData();
  }, [lang]);

  // =========================
  // PACKAGE LABEL
  // =========================
  const getPackageLabel = (type: string) => {
    switch (type) {
      case "PLAYER_BASIC":
        return t("Basic");
      case "PLAYER_PROFESSIONAL":
        return t("Professional");
      case "PLAYER_PREMIUM":
        return t("Premium");
      default:
        return type;
    }
  };

  // =========================
  // SELECT PACKAGE
  // =========================
  const handleSelectPackage = (item: PackageType) => {
    console.log("PACKAGE FROM API:", item);

    localStorage.setItem(
      "selectedPackage",
      JSON.stringify({
        id: item.id,
        package_type: item.package_type,
        package_label: getPackageLabel(item.package_type),
        price: item.price,
        max_photos: item.max_photos,
        max_videos: item.max_videos,
        max_ads: item.max_ads,
      }),
    );

    router.push("/checkout");
  };

  // =========================
  // RENDER
  // =========================
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
              {t("Player Packages")}
            </span>
          </div>

          <h1 className="text-5xl font-black">{t("Player Packages")}</h1>
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
                    {getPackageLabel(subscription.package.package_type)}
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
                  <p className="text-sm text-gray-400">
                    {t("Photos Remaining")}
                  </p>
                  <p className="text-2xl font-bold text-blue-400">
                    {subscription.photos_remaining}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    {t("Videos Remaining")}
                  </p>
                  <p className="text-2xl font-bold text-purple-400">
                    {subscription.videos_remaining}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-400">{t("Ads Remaining")}</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {subscription.ads_remaining}
                  </p>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-700/30">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} className="text-green-400" />
                <span className="text-gray-400">{t("Photos")}:</span>
                <span className="font-semibold">
                  {subscription.photos_used}/{subscription.package.max_photos}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} className="text-green-400" />
                <span className="text-gray-400">{t("Videos")}:</span>
                <span className="font-semibold">
                  {subscription.videos_used}/{subscription.package.max_videos}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} className="text-green-400" />
                <span className="text-gray-400">{t("Ads")}:</span>
                <span className="font-semibold">
                  {subscription.ads_used}/{subscription.package.max_ads}
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
          <div className="flex justify-center py-24">
            <div className="w-14 h-14 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl mb-4">😅</p>
            <p className="text-gray-400">{t("No packages available")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
            {packages
              .filter((p) => p.is_active)
              .map((item, index) => {
                const isCurrentPackage =
                  subscription?.package.package_type === item.package_type;

                return (
                  <PlanCard
                    key={item.id}
                    item={item}
                    index={index}
                    t={t}
                    isDark={isDark}
                    label={getPackageLabel(item.package_type)}
                    onSelect={handleSelectPackage}
                    isCurrentPackage={isCurrentPackage}
                  />
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

// =========================
// CARD
// =========================
function PlanCard({
  item,
  index,
  t,
  isDark,
  label,
  onSelect,
  isCurrentPackage,
}: any) {
  const themes = [
    { accent: "from-orange-400 to-amber-500" },
    { accent: "from-yellow-300 to-yellow-500" },
    { accent: "from-cyan-400 to-blue-500" },
  ];

  const theme = themes[index % themes.length];

  return (
    <div
      className={`
        relative group transition-all duration-500
        ${
          isCurrentPackage
            ? "z-20 scale-110 -translate-y-8"
            : "z-10 hover:-translate-y-3"
        }
      `}
    >
      {/* BORDER GLOW */}
      <div
        className={`absolute inset-0 p-[1px] rounded-[30px] bg-gradient-to-br ${
          isCurrentPackage ? "from-yellow-400 to-yellow-600" : theme.accent
        }`}
      />

      {/* CARD */}
      <div
        className={`
          relative rounded-[30px] p-8 h-full backdrop-blur-2xl
          ${isDark ? "bg-[#0f172a]/90" : "bg-white/90"}
          ${isCurrentPackage ? "border-2 border-yellow-400/50" : ""}
          shadow-2xl
        `}
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
            isCurrentPackage ? "from-yellow-400 to-yellow-600" : theme.accent
          } flex items-center justify-center`}
        >
          {isCurrentPackage ? (
            <Crown className="text-white" size={26} />
          ) : (
            <Crown className="text-white" size={26} />
          )}
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
            icon={<Camera size={18} />}
            text={`${item.max_photos} ${t("Photos")}`}
          />
          <Feature
            icon={<Video size={18} />}
            text={`${item.max_videos} ${t("Videos")}`}
          />
          <Feature
            icon={<Megaphone size={18} />}
            text={`${item.max_ads} ${t("Ads")}`}
          />
        </div>

        {/* BUTTON */}
        {isCurrentPackage ? (
          <button
            disabled
            className={`mt-10 w-full py-4 rounded-2xl font-bold text-black bg-gray-400 cursor-not-allowed opacity-60`}
          >
            {t("Current Package")}
          </button>
        ) : (
          <button
            onClick={() => onSelect(item)}
            className={`mt-10 w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r ${theme.accent} hover:opacity-90 transition-opacity`}
          >
            {t("Subscribe Now")}
          </button>
        )}
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