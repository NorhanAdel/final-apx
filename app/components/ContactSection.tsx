"use client";

import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram } from "lucide-react";
import useTranslate from "../hooks/useTranslate";

export default function ComingSoonSection() {
  const { lang, t } = useTranslate();

  const isRTL = lang === "ar";

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="relative h-[85vh] flex items-center text-white overflow-hidden"
    >
      {/* Background */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
        style={{ backgroundImage: "url('/photo_2026-03-04_00-01-19.jpg')" }}
        animate={{ scale: [1.1, 1.13, 1.1] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      <div className="absolute inset-0 bg-black/60" />

      {/* Glow */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-full bg-gradient-to-b from-[#F0B100]/25 via-transparent to-transparent blur-3xl"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT */}
        <motion.div
          className={`border-white/30 ${isRTL ? "border-l pr-4 sm:pr-8" : "border-l pl-4 sm:pl-8"}`}
        >
          <p className="text-gray-200 mb-6 max-w-md text-sm sm:text-base">
            {t("coming_soon_desc")}
          </p>

          {/* Input */}
          <div className="flex w-full max-w-md flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder={t("email_placeholder")}
              className="flex-1 px-4 py-3 bg-transparent border border-white/40 focus:outline-none text-sm sm:text-base focus:border-[#F0B100] transition"
            />

            <button className="bg-[#F0B100] hover:bg-[#FF6900] transition px-6 py-3 text-sm sm:text-base">
              {t("subscribe")}
            </button>
          </div>

          {/* Social */}
          <div className="flex gap-4 mt-6">
            {[Facebook, Twitter, Instagram].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="border border-white/40 p-2 hover:bg-[#F0B100] hover:text-black transition"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </motion.div>

        {/* RIGHT */}
        <motion.div className={isRTL ? "text-center md:text-right" : "text-center md:text-left"}>
          {[t("we_are"), t("coming"), t("soon")].map((text, i) => (
            <motion.h1
              key={i}
              className="text-4xl sm:text-5xl md:text-7xl font-bold leading-snug"
            >
              {text}
            </motion.h1>
          ))}
        </motion.div>

      </div>
    </section>
  );
}