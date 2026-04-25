"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  Calendar,
  Eye,
  User,
  Building2,
  Users,
  Trophy,
  Star,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import useTranslate from "../../hooks/useTranslate";
import BackButton from "@/app/components/BackButton";
import {
  GET_AD_WITH_USER,
  HAS_USER_VIEWED_AD,
} from "@/app/graphql/query/ad.queries";
import { INCREMENT_AD_VIEWS } from "@/app/graphql/mutation/ad.mutations";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface Ad {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  video_url?: string;
  target_role: string;
  status: string;
  views_count: number;
  expires_at: string;
  created_at: string;
  user: User;
}

export default function AdDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const adId = params.id as string;

  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const checkIfUserViewed = useCallback(async () => {
    if (!isLoggedIn) return false;

    try {
      const result = await fetchGraphQL<{ hasUserViewedAd: boolean }>(
        HAS_USER_VIEWED_AD,
        { adId },
      );
      return result.data?.hasUserViewedAd || false;
    } catch (error) {
      console.error("Error checking if user viewed:", error);
      return false;
    }
  }, [isLoggedIn, adId]);

  const incrementViews = useCallback(async () => {
    try {
      const result = await fetchGraphQL<{
        incrementAdViews: { id: string; views_count: number };
      }>(INCREMENT_AD_VIEWS, { adId });

      if (result.data?.incrementAdViews) {
        setAd((prev) =>
          prev
            ? {
                ...prev,
                views_count: result.data!.incrementAdViews.views_count,
              }
            : prev,
        );
        setHasViewed(true);
        console.log(
          "✅ Views incremented to:",
          result.data.incrementAdViews.views_count,
        );
        return true;
      }
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
    return false;
  }, [adId]);

  const fetchAd = useCallback(async () => {
    if (!adId) return;

    setLoading(true);
    try {
      const result = await fetchGraphQL<{ ad: Ad }>(GET_AD_WITH_USER, {
        id: adId,
      });

      if (result.data?.ad) {
        setAd(result.data.ad);

        // Check if user already viewed this ad (server-side tracking)
        const alreadyViewed = await checkIfUserViewed();

        if (!alreadyViewed && isLoggedIn) {
          await incrementViews();
        } else if (!isLoggedIn) {
          console.log("User not logged in, view not tracked");
        } else {
          console.log("User already viewed this ad, skipping increment");
        }
      } else {
        setAd(null);
      }
    } catch (error) {
      console.error("Error fetching ad:", error);
      setAd(null);
    } finally {
      setLoading(false);
    }
  }, [adId, checkIfUserViewed, incrementViews, isLoggedIn]);

  useEffect(() => {
    fetchAd();
  }, [fetchAd]);

  const getFullImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(
        lang === "ar"
          ? "ar-EG"
          : lang === "pt"
          ? "pt-PT"
          : lang === "zh"
          ? "zh-CN"
          : "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        },
      );
    } catch {
      return dateString;
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + "M";
    }
    if (views >= 1000) {
      return (views / 1000).toFixed(1) + "K";
    }
    return views.toString();
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case "club":
        return <Building2 size={14} className="text-yellow-400" />;
      case "player":
        return <Users size={14} className="text-yellow-400" />;
      case "scout":
        return <Trophy size={14} className="text-yellow-400" />;
      case "agent":
        return <Star size={14} className="text-yellow-400" />;
      default:
        return <User size={14} className="text-yellow-400" />;
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark" ? "bg-[#020617]" : "bg-gray-100"
        }`}
      >
        <div className="w-10 h-10 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ad) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark" ? "bg-[#020617]" : "bg-gray-100"
        }`}
      >
        <div className="text-center">
          <p className="text-gray-500">{t("Ad not found")}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-500 transition"
          >
            {t("Go Home")}
          </button>
        </div>
      </div>
    );
  }

  const isExpired = new Date(ad.expires_at) < new Date();

  return (
    <div
      className={`min-h-screen px-4 pt-30 py-20 transition ${
        theme === "dark" ? "bg-[#020617]" : "bg-gray-100"
      }`}
    >
      <div className="max-w-5xl mx-auto">
        <BackButton className="mb-4" />

        <div
          className={`rounded-xl overflow-hidden shadow-lg border ${
            theme === "dark"
              ? "border-blue-800 bg-[#06122a]"
              : "border-gray-200 bg-white"
          }`}
        >
          {/* Media Section */}
          <div className="relative w-full bg-black">
            {!imageError && ad.image_url ? (
              <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px]">
                <Image
                  src={getFullImageUrl(ad.image_url)}
                  alt={ad.title}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                  unoptimized
                  priority
                />
              </div>
            ) : (
              <div
                className={`w-full h-[200px] sm:h-[250px] flex items-center justify-center ${
                  theme === "dark" ? "bg-[#1a1c24]" : "bg-gray-200"
                }`}
              >
                <span
                  className={
                    theme === "dark" ? "text-gray-500" : "text-gray-400"
                  }
                >
                  No media
                </span>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-5 md:p-6">
            <h1 className="text-xl md:text-2xl font-bold text-[#F0B100] mb-3">
              {ad.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 mb-4 pb-3 border-b border-gray-700/50">
              <span className="flex items-center gap-1 text-xs opacity-70">
                <Eye size={12} />
                {formatViews(ad.views_count || 0)} {t("views")}
              </span>
              <span className="flex items-center gap-1 text-xs opacity-70">
                <Calendar size={12} />
                {formatDate(ad.created_at)}
              </span>
              {isExpired && (
                <span className="flex items-center gap-1 text-xs text-red-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {t("Expired")}
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  ad.status === "ACTIVE"
                    ? "bg-green-500/20 text-green-500"
                    : "bg-red-500/20 text-red-500"
                }`}
              >
                {ad.status}
              </span>
            </div>

            {/* Target Role Badge */}
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 mb-4">
              {getRoleIcon(ad.target_role)}
              <span className="text-xs text-yellow-400">
                {t("Target")}: {ad.target_role}
              </span>
            </div>

            {/* Description */}
            {ad.description && (
              <div className="mb-5">
                <h2 className="text-sm font-semibold mb-2">
                  {t("Description")}
                </h2>
                <div
                  className={`space-y-2 text-xs md:text-sm leading-relaxed ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {ad.description.split("\n").map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Advertiser Info */}
            <div className="mt-4 p-3 rounded-lg bg-yellow-400/5 border border-yellow-400/20">
              <div className="flex items-center justify-between text-xs">
              <h3 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                <User size={12} className="text-yellow-400" />
                {t("Advertiser Information")}
              </h3>
                <div className="flex items-center gap-1.5">
                  <span>
                    {ad.user.first_name} {ad.user.last_name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {getRoleIcon(ad.user.role)}
                  <span className="capitalize">{ad.user.role}</span>
                </div>
              </div>
            </div>

            {/* Expiration Warning */}
            {isExpired && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-xs text-red-400 text-center">
                  {t("This ad has expired on")} {formatDate(ad.expires_at)}
                </p>
              </div>
            )}

            {/* Login message for non-logged in users */}
            {!isLoggedIn && (
              <div className="mt-4 p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/30">
                <p className="text-xs text-yellow-400 text-center">
                  {t("Login to contribute to view count")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
