"use client";

import { motion } from "framer-motion";
import { Users, Trophy } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";

export default function About({ lang }: { lang: string }) {
  const { theme } = useTheme();
  const { t } = useTranslate(lang);  

  const isRTL = lang === "ar";

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className={`relative py-28 overflow-hidden
      ${theme === "dark" ? "bg-[#0c0c0c] text-white" : "bg-white text-black"}`}
    >
      {/* Background blob */}
      <motion.div
        className="absolute w-[600px] h-[600px] bg-[#F54900]/10 rounded-full blur-3xl top-[-200px] right-[-200px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        <div className="grid md:grid-cols-2 gap-16 items-center mb-32">

          {/* TEXT */}
          <div className={isRTL ? "text-right" : "text-left"}>

            <span className="text-xl tracking-widest text-[#F0B100] uppercase">
              {t("about_title")}
            </span>

            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 leading-tight">
              {t("about_heading")}
            </h2>

            <p className={`leading-relaxed mb-8
              ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {t("about_description")}
            </p>

            <button className="px-7 py-3 bg-[#F0B100] hover:bg-[#9F0712] transition rounded-full font-semibold">
              {t("learn_more")}
            </button>
          </div>

          {/* CARDS */}
          <div className="grid grid-cols-2 gap-6">

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className={`p-8 rounded-2xl border text-center
              ${theme === "dark" ? "bg-[#151515] border-white/5" : "bg-gray-100 border-black/5"}`}
            >
              <Users size={32} className="mx-auto mb-4 text-[#F0B100]" />

              <h3 className="text-3xl font-bold">500+</h3>

              <p className={`text-sm mt-2
                ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {t("players_registered")}
              </p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className={`p-8 rounded-2xl border text-center
              ${theme === "dark" ? "bg-[#151515] border-white/5" : "bg-gray-100 border-black/5"}`}
            >
              <Trophy size={32} className="mx-auto mb-4 text-[#F0B100]" />

              <h3 className="text-3xl font-bold">120+</h3>

              <p className={`text-sm mt-2
                ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {t("championships")}
              </p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className={`p-8 rounded-2xl border text-center col-span-2
              ${theme === "dark" ? "bg-[#151515] border-white/5" : "bg-gray-100 border-black/5"}`}
            >
              <h3 className="text-2xl font-bold text-[#F0B100] mb-2">
                {t("experience_years")}
              </h3>

              <p className={`text-sm
                ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {t("experience_desc")}
              </p>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}