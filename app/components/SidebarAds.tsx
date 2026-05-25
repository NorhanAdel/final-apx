"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import useTranslate from "@/app/hooks/useTranslate";

interface Ad {
  id: string;
  company_name: string;
  title: string;
  description: string;
  media_url: string | null;
  target_url: string | null;
  is_active: boolean;
  package_name: string;
  media_type: string;
  views?: number;
  clicks?: number;
}

const texts = {
  en: { sponsored: "Sponsored", learnMore: "View" },
  ar: { sponsored: "إعلان ممول", learnMore: "عرض" },
  pt: { sponsored: "Patrocinado", learnMore: "Ver" },
  zh: { sponsored: "赞助", learnMore: "查看" },
};

export default function SidebarAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [closed, setClosed] = useState(false);

  const { lang } = useTranslate();
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
        package_name
        media_type
      }
    }
  `;

  // =========================
  // TRACK VIEW
  // =========================
  const TRACK_AD_VIEW = `
    mutation TrackSponsoredAdView($adId: String!) {
      trackSponsoredAdView(adId: $adId)
    }
  `;

  // =========================
  // TRACK CLICK
  // =========================
  const TRACK_AD_CLICK = `
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
        const res = await fetchGraphQL<{ getAllSponsoredAds: Ad[] }>(
          GET_ADS
        );

        const data = res?.data?.getAllSponsoredAds || [];

        setAds(
          data
            .filter((ad) => ad.is_active)
            .map((ad) => ({
              ...ad,
              views: 0,
              clicks: 0,
            }))
        );
      } catch (err) {
        console.error(err);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [lang]);

  // =========================
  // ROTATION
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
  // TRACK AD VIEW
  // =========================
  useEffect(() => {
    if (!ad?.id) return;

    const trackView = async () => {
      try {
        await fetchGraphQL(TRACK_AD_VIEW, {
          adId: ad.id,
        });

        setAds((prev) =>
          prev.map((item) =>
            item.id === ad.id
              ? {
                  ...item,
                  views: (item.views || 0) + 1,
                }
              : item
          )
        );
      } catch (err) {
        console.error("Track view error:", err);
      }
    };

    trackView();
  }, [index, ads]);

  if (loading) {
    return (
      <div className="fixed right-4 bottom-4 z-50">
        <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
      </div>
    );
  }

  if (closed || ads.length === 0) return null;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  // ✅ FIX URL SAFE
  const mediaUrl = ad.media_url
    ? `${baseUrl.replace(/\/$/, "")}${ad.media_url}`
    : null;

  // ✅ detect video (Arabic + fallback)
  const isVideo =
    ad.media_type === "فيديو" ||
    ad.media_type?.toLowerCase().includes("video");

  return (
    <div className="fixed bottom-3 right-3 lg:top-1/2 lg:-translate-y-1/2 z-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={ad.id}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.92 }}
          transition={{ duration: 0.8 }}
          className="relative w-[92vw] sm:w-[320px] lg:w-[260px] rounded-2xl overflow-hidden border border-white/10 bg-black/70 backdrop-blur-xl shadow-2xl"
        >
          {/* CLOSE */}
          <button
            onClick={() => setClosed(true)}
            className="absolute top-2 right-2 z-20 bg-black/60 hover:bg-red-500 transition text-white rounded-full p-1.5"
          >
            <X size={16} />
          </button>

          {/* MEDIA */}
          <div className="relative h-44 bg-black overflow-hidden">
            {mediaUrl ? (
              isVideo ? (
                <video
                  src={mediaUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  onError={() => console.log("Video failed:", mediaUrl)}
                />
              ) : (
                <Image
                  src={mediaUrl}
                  alt={ad.title || "ad"}
                  fill
                  className="object-cover"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No media
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            <span className="absolute top-2 left-2 bg-yellow-400 text-black text-[10px] px-2 py-1 rounded-full font-bold">
              {t.sponsored}
            </span>
          </div>

          {/* CONTENT */}
          <div className="p-4 text-white">
            <h3 className="text-sm font-bold line-clamp-1">
              {ad.company_name}
            </h3>

            <p className="text-yellow-400 text-xs mt-1 line-clamp-1">
              {ad.title}
            </p>

            <p className="text-gray-300 text-xs mt-2 line-clamp-3">
              {ad.description}
            </p>

        
            {/* LINK */}
            {ad.target_url && (
              <a
                href={ad.target_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={async () => {
                  try {
                    await fetchGraphQL(TRACK_AD_CLICK, {
                      adId: ad.id,
                    });

                    setAds((prev) =>
                      prev.map((item) =>
                        item.id === ad.id
                          ? {
                              ...item,
                              clicks: (item.clicks || 0) + 1,
                            }
                          : item
                      )
                    );
                  } catch (err) {
                    console.error("Track click error:", err);
                  }
                }}
                className="mt-4 inline-flex items-center justify-center gap-2 w-full bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-bold py-2.5 rounded-xl"
              >
                {t.learnMore}
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
