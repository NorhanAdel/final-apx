"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import useTranslate from "../hooks/useTranslate";

interface Sport {
  id: string;
  name: string;
  image_url: string;
  created_at: string;
}

export default function SportsSection({ lang }: { lang: string }) {
  const { theme } = useTheme();
  const { t } = useTranslate(lang);

  const [sports, setSports] = useState<Sport[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(4);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setVisibleCards(4);
      else if (window.innerWidth >= 768) setVisibleCards(3);
      else setVisibleCards(2);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchSports();
  }, [lang]);

  const fetchSports = async () => {
    setLoading(true);

    const query = `
      query {
        sports {
          id
          name
          image_url
          created_at
        }
      }
    `;

    const result = await fetchGraphQL<{ sports: Sport[] }>(query, {});

    if (!result.data?.sports) {
      setSports([]);
      setLoading(false);
      return;
    }

    const formatted = result.data.sports.map((s) => ({
      ...s,
      image_url: s.image_url?.startsWith("http")
        ? s.image_url
        : `${process.env.NEXT_PUBLIC_API_URL}${s.image_url}`,
    }));

    setSports(formatted);
    setLoading(false);
  };

  const next = () => {
    if (startIndex + visibleCards < sports.length) {
      setStartIndex((p) => p + 1);
    }
  };

  const prev = () => {
    if (startIndex > 0) {
      setStartIndex((p) => p - 1);
    }
  };

  const visibleSports = sports.slice(startIndex, startIndex + visibleCards);
  const isRTL = lang === "ar";

  if (loading) {
    return (
      <section
        dir={isRTL ? "rtl" : "ltr"}
        className={`py-16 sm:py-24 ${
          theme === "dark"
            ? "bg-[#0f0f0f] text-white"
            : "bg-gray-100 text-black"
        }`}
      >
        <div className="flex items-center justify-center py-20">
          <div className="relative inline-flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
            <span className="text-xs font-black text-yellow-400 tracking-widest uppercase">
              {t("loading")}
            </span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className={`py-16 sm:py-24 ${
        theme === "dark" ? "bg-[#0f0f0f] text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold mb-12 text-[#F0B100]">
          {t("Sports")}
        </h2>

        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 flex-1">
            {visibleSports.map((sport) => {
              return (
                <Link key={sport.id} href={`/sports/${sport.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 sm:p-8 rounded-2xl text-center border shadow-lg transition-all duration-300 group hover:-translate-y-2 cursor-pointer
                    ${
                      theme === "dark"
                        ? "bg-[#1a1a1a] hover:bg-[#222] border-white/5"
                        : "bg-gray-200 hover:bg-gray-300 border-black/5"
                    }`}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-orange-400/10 group-hover:bg-orange-400/20 transition">
                      <Image
                        src={sport.image_url || "/football.png"}
                        alt={sport.name}
                        width={60}
                        height={60}
                      />
                    </div>

                    <h3 className="text-lg sm:text-xl font-semibold">
                      {sport.name}
                    </h3>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          <div className="flex md:flex-col gap-4 mt-4 md:mt-0">
            <button
              onClick={prev}
              disabled={startIndex === 0}
              className="w-12 h-12 rounded-xl border flex items-center justify-center disabled:opacity-30"
            >
              <ChevronUp size={20} />
            </button>

            <button
              onClick={next}
              disabled={startIndex + visibleCards >= sports.length}
              className="w-12 h-12 rounded-xl border flex items-center justify-center disabled:opacity-30"
            >
              <ChevronDown size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
