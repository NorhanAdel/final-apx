"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import useTranslate from "@/app/hooks/useTranslate";
import { useTheme } from "@/app/context/ThemeContext";

interface Ad {
  id: string;
  company_name: string;
  title: string;
  description: string;
  media_url: string | null;
  target_url: string | null;
  is_active: boolean;
  media_type: string;
  package_name: string;
}

/* 🌍 MULTI LANGUAGE STATIC */
const texts = {
  en: {
    sponsored: "Sponsored",
    learnMore: "Learn More",
    noAds: "No ads available",
  },
  ar: {
    sponsored: "إعلان ممول",
    learnMore: "اعرف المزيد",
    noAds: "لا توجد إعلانات حاليا",
  },
  pt: {
    sponsored: "Patrocinado",
    learnMore: "Saiba Mais",
    noAds: "Nenhum anúncio disponível",
  },
  zh: {
    sponsored: "赞助广告",
    learnMore: "了解更多",
    noAds: "暂无广告",
  },
};

export default function BannerAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // 👇 STATS (views + clicks)
  const [stats, setStats] = useState<
    Record<string, { views: number; clicks: number }>
  >({});

  const { lang } = useTranslate();
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const t = texts[lang as keyof typeof texts] || texts.en;

  const GET_ADS = `
    query GetAllSponsoredAds {
      getAllSponsoredAds {
        id
        company_name
        title
        description
        media_url
        target_url
        is_active
        media_type
        package_name
      }
    }
  `;

  // =========================
  // TRACK ENDPOINTS
  // =========================
  const TRACK_VIEW = `
    mutation TrackSponsoredAdView($adId: String!) {
      trackSponsoredAdView(adId: $adId)
    }
  `;

  const TRACK_CLICK = `
    mutation TrackSponsoredAdClick($adId: String!) {
      trackSponsoredAdClick(adId: $adId)
    }
  `;

  // =========================
  // FETCH ADS
  // =========================
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetchGraphQL<{ getAllSponsoredAds: Ad[] }>(GET_ADS);

        const data = res?.data?.getAllSponsoredAds;

        if (!data || !Array.isArray(data)) {
          setAds([]);
          return;
        }

        setAds(data.filter((a) => a?.is_active));
      } catch (err) {
        console.error("Ads error:", err);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [lang]);

  // =========================
  // AUTO ROTATE
  // =========================
  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ads.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [ads]);

  const ad = ads[index];

  // =========================
  // TRACK VIEW + SHOW STATS
  // =========================
  useEffect(() => {
    if (!ad?.id) return;

    const adId = ad.id;

    setStats((prev) => ({
      ...prev,
      [adId]: {
        views: (prev[adId]?.views || 0) + 1,
        clicks: prev[adId]?.clicks || 0,
      },
    }));

    fetchGraphQL(TRACK_VIEW, { adId }).catch(console.error);
  }, [index]);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div
        className={`flex items-center justify-center py-24 ${
          isDark ? "bg-[#020617]" : "bg-[#f5f7fb]"
        }`}
      >
        <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
      </div>
    );
  }

  if (!ad) {
    return (
      <div
        className={`flex items-center justify-center py-24 ${
          isDark ? "bg-[#020617]" : "bg-[#f5f7fb]"
        }`}
      >
        <p className={isDark ? "text-gray-400" : "text-gray-500"}>
          {t.noAds}
        </p>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const mediaUrl = ad.media_url
    ? `${baseUrl.replace(/\/$/, "")}${ad.media_url}`
    : null;

  const isVideo =
    ad.media_type === "فيديو" ||
    ad.media_type?.toLowerCase().includes("video");

  return (
    <section
      className={`w-full py-6 sm:py-8 md:py-10 ${
        isDark ? "bg-[#020617]" : "bg-[#f5f7fb]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-5 md:px-6">

        <AnimatePresence mode="wait">
          <motion.div
            key={ad.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="relative w-full h-[260px] sm:h-[340px] md:h-[420px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          >
            {/* MEDIA */}
            {mediaUrl &&
              (isVideo ? (
                <video
                  src={mediaUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                />
              ) : (
                <Image
                  src={mediaUrl}
                  alt={ad.title || "ad"}
                  fill
                  className="object-cover"
                />
              ))}

            {/* OVERLAY */}
            <div
              className={`absolute inset-0 ${
                isDark
                  ? "bg-gradient-to-r from-black/85 via-black/50 to-black/10"
                  : "bg-gradient-to-r from-black/70 via-black/30 to-transparent"
              }`}
            />

            {/* CONTENT */}
            <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 md:px-10 z-10 max-w-2xl">

              <span className="bg-yellow-400 text-black w-fit px-3 py-1 text-xs font-bold rounded-full mb-3">
                {t.sponsored}
              </span>

              <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white">
                {ad.company_name}
              </h2>

              <h3 className="text-yellow-400 text-sm sm:text-lg md:text-xl mt-2">
                {ad.title}
              </h3>

              <p className={`mt-3 max-w-lg line-clamp-3 text-sm ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}>
                {ad.description}
              </p>

              {/* STATS UI */}
              <div className="mt-3 flex gap-4 text-xs text-gray-300">
                <span>
                  👁 Views: {stats[ad.id]?.views || 0}
                </span>
                <span>
                  🖱 Clicks: {stats[ad.id]?.clicks || 0}
                </span>
              </div>

              {/* CTA + CLICK TRACK */}
              {ad.target_url && (
                <a
                  href={ad.target_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={async () => {
                    const adId = ad.id;

                    setStats((prev) => ({
                      ...prev,
                      [adId]: {
                        views: prev[adId]?.views || 0,
                        clicks: (prev[adId]?.clicks || 0) + 1,
                      },
                    }));

                    try {
                      await fetchGraphQL(TRACK_CLICK, { adId });
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="mt-5 inline-flex items-center gap-2 bg-yellow-400 text-black font-bold px-5 py-3 rounded-xl"
                >
                  {t.learnMore}
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
