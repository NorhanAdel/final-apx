"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, ExternalLink } from "lucide-react";
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
  media_type: string;
  package_name: string;
}

/* 🌍 MULTI LANGUAGE STATIC */
const texts = {
  en: {
    sponsored: "Sponsored",
    learnMore: "Learn More",
  },
  ar: {
    sponsored: "إعلان ممول",
    learnMore: "اعرف المزيد",
  },
  pt: {
    sponsored: "Patrocinado",
    learnMore: "Saiba Mais",
  },
  zh: {
    sponsored: "赞助广告",
    learnMore: "了解更多",
  },
};

export default function BannerAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

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
        media_type
        package_name
      }
    }
  `;

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetchGraphQL<{ getAllSponsoredAds: Ad[] }>(GET_ADS);

        if (res.data?.getAllSponsoredAds) {
          setAds(res.data.getAllSponsoredAds.filter(a => a.is_active));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [lang]);

  /* AUTO ROTATE BANNER */
  useEffect(() => {
    if (ads.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ads.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [ads]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 bg-[#020617]">
        <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
      </div>
    );
  }

  const ad = ads[index];

  return (
    <section className="w-full bg-[#020617] py-10">

      <div className="max-w-7xl mx-auto px-6">

        <AnimatePresence mode="wait">
          <motion.div
            key={ad?.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="relative w-full h-[420px] rounded-3xl overflow-hidden border border-white/10"
          >

            {/* IMAGE */}
            {ad.media_url && (
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}${ad.media_url}`}
                alt={ad.title}
                fill
                className="object-cover"
              />
            )}

            {/* DARK OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

            {/* CONTENT */}
            <div className="absolute inset-0 flex flex-col justify-center px-10 text-white max-w-2xl">

              {/* badge */}
              <span className="bg-yellow-400 text-black w-fit px-3 py-1 text-xs font-bold rounded-full mb-4">
                {t.sponsored}
              </span>

              {/* company */}
              <h2 className="text-3xl md:text-4xl font-black">
                {ad.company_name}
              </h2>

              {/* title */}
              <h3 className="text-yellow-400 text-xl font-semibold mt-2">
                {ad.title}
              </h3>

              {/* description */}
              <p className="text-gray-300 mt-3 max-w-lg line-clamp-3">
                {ad.description}
              </p>

              {/* CTA */}
              <a
                href={ad.target_url}
                target="_blank"
                className="mt-6 inline-flex items-center gap-2 bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl hover:bg-yellow-500 transition w-fit"
              >
                {t.learnMore}
                <ExternalLink size={16} />
              </a>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* DOTS */}
        {ads.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {ads.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-yellow-400" : "w-2 bg-gray-600"
                }`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}