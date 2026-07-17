"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Calendar, Eye, User } from "lucide-react";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import useTranslate from "../../hooks/useTranslate";
import BackButton from "@/app/components/BackButton";
import { GET_AD_BY_ID } from "@/app/graphql/query/ad.queries";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

interface UserType {
  id: string;
  email: string;
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
  created_at: string;
  updated_at: string;
  user: UserType;
}

export default function AdDetailsPage() {
  const params = useParams();
  const adId = params.id as string;

  const { t, lang } = useTranslate();
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAd = useCallback(async () => {
    setLoading(true);

    try {
      const result = await fetchGraphQL<{ ad: Ad }>(GET_AD_BY_ID, {
        id: adId,
      });
      console.log("RESULT =>", result);

      setAd(result.data?.ad || null);
    } catch (error) {
      console.error("Error fetching ad:", error);
    } finally {
      setLoading(false);
    }
  }, [adId]);

  useEffect(() => {
    fetchAd();
  }, [fetchAd]);

  const getFullImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US");

  const formatViews = (v: number) =>
    v >= 1000 ? (v / 1000).toFixed(1) + "K" : v.toString();

  if (!mounted || loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-[#09091A]" : "bg-gray-100"
        }`}
      >
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ad) return null;

  return (
    <div
      className={`min-h-screen pb-20 transition ${
        isDark
          ? "bg-[#09091A] text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 pt-30">
        <BackButton className="mb-6" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-10"
        >
          {/* IMAGE */}
          <div
            className={`relative w-full h-[520px] rounded-3xl overflow-hidden border shadow-xl transition ${
              isDark
                ? "border-yellow-400/20 bg-[#111]"
                : "border-gray-300 bg-white"
            }`}
          >
            {!imageError && ad.image_url ? (
              <Image
                src={getFullImageUrl(ad.image_url)}
                alt={ad.title}
                fill
                className="object-cover hover:scale-110 transition duration-700"
                onError={() => setImageError(true)}
              />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {t("No Image") || "No Image"}
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="flex flex-col gap-6">
            {/* TITLE */}
            <h1
              className={`text-4xl font-bold ${
                isDark ? "text-yellow-400" : "text-yellow-600"
              }`}
            >
              {ad.title}
            </h1>

            {/* INFO BAR */}
            <div
              className={`flex items-center justify-between p-4 rounded-xl border text-sm transition ${
                isDark
                  ? "bg-white/5 border-white/10 text-gray-300"
                  : "bg-white border-gray-300 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Eye size={14} className="text-yellow-400" /> {formatViews(ad.views_count)}
                </span>

                <span className="flex items-center gap-1">
                  <Calendar size={14} className="text-yellow-400" />{" "}
                  {formatDate(ad.created_at)}
                </span>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs ${
                  ad.status === "ACTIVE"
                    ? "bg-green-500/20 text-green-500"
                    : "bg-green-500/20 text-green-400"
                }`}
              >
                {ad.status === "ACTIVE" ? t("Active") || "Active" : ad.status}
              </span>
            </div>

            {/* USER */}
            <div
              className={`flex items-center justify-between p-4 rounded-xl border transition ${
                isDark
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <User size={16} className="text-yellow-400" />
                <span>
                  {ad.user.first_name} {ad.user.last_name}
                </span>
              </div>

              <span className="text-sm text-gray-400 capitalize">
                {t(ad.user.role) || ad.user.role}
              </span>
            </div>

            {/* DESCRIPTION */}
            <div
              className={`rounded-2xl p-5 border transition ${
                isDark
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-gray-300"
              }`}
            >
              <h3
                className={`text-sm mb-3 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {t("Description") || "Description"}
              </h3>

              <div className="max-h-[220px] overflow-y-auto pr-2 custom-scroll">
                <p
                  className={`text-xl leading-relaxed whitespace-pre-line ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {ad.description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 5px;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
          background: #f0b100;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}