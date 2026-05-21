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
  target_url: string;
  is_active: boolean;
  package_name: string;
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
      }
    }
  `;

  /* FETCH ADS */
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetchGraphQL<{ getAllSponsoredAds: Ad[] }>(GET_ADS);

        const data = res?.data?.getAllSponsoredAds || [];

        setAds(data.filter((ad) => ad?.is_active));
      } catch (err) {
        console.error("Ads error:", err);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [lang]);

  /* AUTO ROTATE SAFE */
  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ads.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [ads]);

  if (loading) {
    return (
      <div className="fixed right-4 top-1/3 z-50">
        <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
      </div>
    );
  }

  if (closed || ads.length === 0) return null;

  const ad = ads?.[index] ?? null;

  if (!ad) return null;

  const imageUrl =
    ad.media_url && process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL}${ad.media_url}`
      : null;

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
      <AnimatePresence mode="wait">
        <motion.div
          key={ad.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          className="relative w-[260px] rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl"
        >
          {/* CLOSE */}
          <button
            onClick={() => setClosed(true)}
            className="absolute top-2 right-2 z-20 bg-black/60 hover:bg-red-500 text-white rounded-full p-1.5"
          >
            <X size={16} />
          </button>

          {/* IMAGE SAFE */}
          <div className="relative h-40 bg-black overflow-hidden">
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={ad.title || "ad"}
                fill
                className="object-cover transition-transform duration-700 hover:scale-110"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <span className="absolute top-2 left-2 bg-yellow-400 text-black text-[10px] px-2 py-1 rounded-full font-bold shadow">
              {t.sponsored}
            </span>
          </div>

          {/* CONTENT */}
          <div className="p-4 text-white">
            <h3 className="text-sm font-bold line-clamp-1">
              {ad.company_name || "—"}
            </h3>

            <p className="text-yellow-400 text-xs font-semibold mt-1 line-clamp-1">
              {ad.title || "—"}
            </p>

            <p className="text-gray-400 text-xs mt-2 line-clamp-3">
              {ad.description || ""}
            </p>

            <a
              href={ad.target_url || "#"}
              target="_blank"
              className="mt-4 inline-flex items-center justify-center gap-2 w-full bg-yellow-400 text-black text-sm font-bold py-2.5 rounded-xl"
            >
              {t.learnMore}
              <ExternalLink size={14} />
            </a>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
