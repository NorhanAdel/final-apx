"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import useTranslate from "@/app/hooks/useTranslate";
import { useTheme } from "@/app/context/ThemeContext";

interface Investor {
  id: string;
  name: string;
  logo_url: string;
}

/* ===== STATIC MULTI LANGUAGE TITLES ===== */
const titles = {
  en: {
    investors: "Our Investors",
    subtitle: "Trusted By Global Investors",
  },
  ar: {
    investors: "المستثمرون",
    subtitle: "موثوق به من المستثمرين العالميين",
  },
  pt: {
    investors: "Nossos Investidores",
    subtitle: "Confiado por investidores globais",
  },
  zh: {
    investors: "我们的投资者",
    subtitle: "受到全球投资者信任",
  },
};

export default function Investor() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);

  const sliderRef = useRef<HTMLDivElement>(null);

  const { t, lang } = useTranslate();
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const GET_ALL_INVESTORS = `
    query GetAllInvestors {
      getAllInvestors {
        id
        name
        logo_url
      }
    }
  `;

  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const result = await fetchGraphQL<{
          getAllInvestors: Investor[];
        }>(GET_ALL_INVESTORS);

        if (result.data?.getAllInvestors) {
          setInvestors(result.data.getAllInvestors);
        }
      } catch (error) {
        console.error("Failed to fetch investors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestors();
  }, [lang]);

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    let animationFrame: number;

    const autoScroll = () => {
      if (slider.scrollLeft >= slider.scrollWidth / 2) {
        slider.scrollLeft = 0;
      } else {
        slider.scrollLeft += 1;
      }

      animationFrame = requestAnimationFrame(autoScroll);
    };

    animationFrame = requestAnimationFrame(autoScroll);

    return () => cancelAnimationFrame(animationFrame);
  }, [investors]);

  const currentTitle =
    titles[lang as keyof typeof titles] || titles.en;

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center py-24 ${
          isDark ? "bg-[#020617]" : "bg-[#f3f4f6]"
        }`}
      >
        <Loader2 className="w-12 h-12 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <section
      className={`relative py-24 mt-10 overflow-hidden transition-all duration-500 ${
        isDark ? "bg-[#020617]" : "bg-[#f8fafc]"
      }`}
    >
      <div
        className={`absolute inset-0 opacity-40 ${
          isDark
            ? "bg-[radial-gradient(circle_at_top,#1e293b,transparent_70%)]"
            : "bg-[radial-gradient(circle_at_top,#fde68a,transparent_70%)]"
        }`}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* ===== TITLE ===== */}
        <motion.div
          initial={{ opacity: 0, y: 70 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16 px-6"
        >
          <span
            className={`text-yellow-400 uppercase tracking-[5px] font-semibold ${
              lang === "ar" ? "font-[Cairo]" : "font-sans"
            }`}
          >
            {currentTitle.investors}
          </span>

          <h2
            className={`text-4xl md:text-6xl font-black mt-4 leading-tight ${
              isDark ? "text-white" : "text-black"
            } ${lang === "ar" ? "font-[Cairo]" : "font-sans"}`}
          >
            {currentTitle.subtitle}
          </h2>
        </motion.div>

        {/* ===== SLIDER ===== */}
        <div className="relative">
          <div
            className={`absolute left-0 top-0 h-full w-32 z-10 pointer-events-none ${
              isDark
                ? "bg-gradient-to-r from-[#020617] to-transparent"
                : "bg-gradient-to-r from-[#f8fafc] to-transparent"
            }`}
          />

          <div
            className={`absolute right-0 top-0 h-full w-32 z-10 pointer-events-none ${
              isDark
                ? "bg-gradient-to-l from-[#020617] to-transparent"
                : "bg-gradient-to-l from-[#f8fafc] to-transparent"
            }`}
          />

          <div
            ref={sliderRef}
            className="flex gap-8 overflow-x-hidden px-6 scrollbar-hide"
          >
            {[...investors, ...investors].map((investor, index) => (
              <motion.div
                key={`${investor.id}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                }}
                whileHover={{ y: -12, scale: 1.04 }}
                className="min-w-[280px] group relative"
              >
                <div className="absolute inset-0 rounded-[35px] bg-yellow-400/20 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />

                <div
                  className={`relative h-[340px] rounded-[35px] overflow-hidden border backdrop-blur-2xl transition-all duration-500 group-hover:border-yellow-400/50 ${
                    isDark
                      ? "border-white/10 bg-white/5"
                      : "border-black/10 bg-white"
                  }`}
                >
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ${
                      isDark
                        ? "bg-gradient-to-b from-white/10 via-transparent to-black/40"
                        : "bg-gradient-to-b from-yellow-100/40 via-transparent to-yellow-200/20"
                    }`}
                  />

                  <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
                    <div className="relative w-36 h-36 rounded-full overflow-hidden border-[5px] shadow-[0_0_40px_rgba(250,204,21,0.35)]">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}${investor.logo_url}`}
                        alt={investor.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>

                    <h3
                      className={`text-2xl font-bold text-center mt-8 leading-relaxed ${
                        isDark ? "text-white" : "text-black"
                      } ${
                        lang === "ar"
                          ? "font-[Cairo]"
                          : "font-sans"
                      }`}
                    >
                      {lang === "ar"
                        ? investor.name
                        : t(investor.name)}
                    </h3>

                    <div className="mt-5 h-[3px] w-16 rounded-full bg-yellow-400 transition-all duration-500 group-hover:w-28" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
