"use client";

import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram, Mail } from "lucide-react";
import useTranslate from "../hooks/useTranslate";
import { useEffect, useState } from "react";

export default function ComingSoonSection() {
  const { lang, t } = useTranslate();
  const isRTL = lang === "ar";

  const fullText = `${t("coming")} ${t("soon")}`;
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setTyped(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(id);
    }, 50);
    return () => clearInterval(id);
  }, [fullText]);

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="relative min-h-screen overflow-hidden text-white bg-black"
    >
      {/* BACKGROUND IMAGE */}
      <div
        className="absolute inset-y-0 end-0 w-full md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('/photo_2026-03-04_00-01-19.jpg')" }}
      />

      {/* DARK GRADIENT */}
      <div className="absolute inset-y-0 start-0 w-full md:w-1/2 bg-gradient-to-r from-black via-black/90 to-transparent" />

      {/* LIGHT BEAM */}
      <motion.div
        className="absolute inset-y-0 start-1/2 w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-[#F0B100] to-transparent opacity-70"
        animate={{ y: ["-20%", "120%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center min-h-screen">

        {/* LEFT SIDE */}
        <div className="max-w-xl text-center md:text-start">

          {/* TITLE */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            <span className="relative">
              {typed}

              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="ms-1"
              >
                |
              </motion.span>

              <span className="absolute inset-0 text-[#F0B100] blur-md opacity-30 pointer-events-none">
                {typed}
              </span>
            </span>
          </h1>

          {/* DESCRIPTION */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 mb-8 md:mb-10 text-sm sm:text-base text-center md:text-start"
          >
            {t("coming_soon_desc")}
          </motion.p>

          {/* SUBSCRIBE CARD */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl border border-white/10 p-4 sm:p-6 rounded-2xl"
          >
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-4 text-[#F0B100] justify-center md:justify-start">
              <Mail size={20} />
              <span className="font-semibold text-sm sm:text-base">
                {t("subscribe")}
              </span>
            </div>

            {/* INPUT */}
            <div
              className={`flex flex-col sm:flex-row gap-3 ${
                isRTL ? "sm:flex-row-reverse" : ""
              }`}
            >
              <input
                type="email"
                placeholder={t("email_placeholder")}
                className="flex-1 px-4 py-3 bg-transparent border border-white/20 text-sm sm:text-base focus:outline-none focus:border-[#F0B100] rounded-md"
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-[#F0B100] text-black font-semibold rounded-md text-sm sm:text-base"
              >
                OK
              </motion.button>
            </div>
          </motion.div>

          {/* SOCIAL */}
          <div className="flex gap-3 sm:gap-4 mt-6 sm:mt-8 justify-center md:justify-start">
            {[Facebook, Twitter, Instagram].map((Icon, i) => (
              <motion.a
                key={i}
                whileHover={{
                  scale: 1.15,
                  y: -3,
                  backgroundColor: "#F0B100",
                  color: "#000",
                }}
                className="border border-white/20 p-2 sm:p-3 rounded-lg"
                href="#"
              >
                <Icon size={18} />
              </motion.a>
            ))}
          </div>

        </div>

       
        <div />
      </div>
    </section>
  );
}