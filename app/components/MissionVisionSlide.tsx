"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";

export default function MissionVisionSlide() {
  const { theme } = useTheme();
  const { t, lang } = useTranslate();

  const isRTL = lang === "ar";

  const bgVision = theme === "dark" ? "bg-[#F0B100]" : "bg-[#F0B100]/90";
  const bgMission = theme === "dark" ? "bg-[#160906]" : "bg-[#F0B100]/10";

  const floating = {
    animate: { y: [0, -10, 0] },
    transition: { duration: 3, repeat: Infinity },
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`${
        theme === "dark" ? "bg-[#0f0f0f]" : "bg-gray-200"
      } min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-12 py-12 md:py-20 transition`}
    >
      {/* TITLE */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 max-w-6xl mx-auto text-center"
      >
        <h1 className="text-3xl md:text-5xl font-bold text-[#F0B100]">
          {t("mission_vision_title")}
        </h1>
      </motion.div>

      {/* CONTENT */}
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-16">
        {/* ===== VISION ===== */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? 80 : -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className={`flex ${isRTL ? "justify-start" : "justify-start"}`}
        >
          <div
            className={`
              ${bgVision}
              w-full md:w-3/4
              py-8 md:py-10
              px-4 md:px-10
              rounded-3xl
              relative shadow-lg
              flex flex-col md:flex-row items-center gap-6 md:gap-8
              ${isRTL ? "md:flex-row-reverse" : ""}
            `}
          >
            {/* IMAGE */}
            <motion.div
              {...floating}
              className="
                w-24 h-24 
                rounded-full border-4 border-white
                overflow-hidden shadow-xl
                flex-shrink-0
                md:w-32 md:h-32
                lg:w-40 lg:h-40
                md:border-8
              "
            >
              <Image src="/b3.jpg" alt="Vision" fill className="object-cover" />
            </motion.div>

            {/* TEXT CONTENT */}
            <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
              <h2
                className={`text-xl md:text-3xl font-bold mb-2 md:mb-3 text-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("vision_title")}
              </h2>

              <p
                className={`text-sm md:text-base text-gray-100 leading-relaxed ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("vision_desc")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ===== MISSION ===== */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? -80 : 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className={`flex ${isRTL ? "justify-end" : "justify-end"}`}
        >
          <div
            className={`
              ${bgMission}
              w-full md:w-3/4
              py-8 md:py-10
              px-4 md:px-10
              rounded-3xl
              relative shadow-lg
              flex flex-col md:flex-row items-center gap-6 md:gap-8
              ${isRTL ? "md:flex-row-reverse" : ""}
            `}
          >
            {/* IMAGE */}
            <motion.div
              {...floating}
              className="
                w-24 h-24 
                rounded-full border-4 border-[#F0B100]
                overflow-hidden shadow-xl
                flex-shrink-0
                md:w-32 md:h-32
                lg:w-40 lg:h-40
                md:border-8
              "
            >
              <Image
                src="/mission.jpeg"
                alt="Mission"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* TEXT CONTENT */}
            <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
              <h2
                className={`text-xl md:text-3xl font-bold mb-2 md:mb-3 ${
                  theme === "dark" ? "text-white" : "text-black"
                } ${isRTL ? "text-right" : "text-left"}`}
              >
                {t("mission_title")}
              </h2>

              <p
                className={`text-sm md:text-base leading-relaxed ${
                  theme === "dark" ? "text-gray-100" : "text-gray-800"
                } ${isRTL ? "text-right" : "text-left"}`}
              >
                {t("mission_desc")}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
