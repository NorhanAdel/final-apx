"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import { GET_TOTAL_PLAYERS_COUNT } from "@/app/graphql/query/player.queries";

import { Users, Trophy, Target } from "lucide-react";

export default function About({ lang }: { lang: string }) {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const isRTL = lang === "ar";

  const [totalPlayers, setTotalPlayers] = useState<number>(0);

  useEffect(() => {
    fetchTotalPlayers();
  }, []);

  const fetchTotalPlayers = async () => {
    const result = await fetchGraphQL<{ totalPlayersCount: number }>(
      GET_TOTAL_PLAYERS_COUNT
    );
    if (result.data?.totalPlayersCount) {
      setTotalPlayers(result.data.totalPlayersCount);
    }
  };

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const card = {
    hidden: { opacity: 0, y: 60, scale: 0.9 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className={`relative py-20 md:py-32 overflow-hidden ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* background animation */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full opacity-10"
        animate={{ x: ["-10%", "110%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage:
            "linear-gradient(120deg, transparent 40%, #F0B100 50%, transparent 60%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* TITLE */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-6"
        >
          {t("about_heading")}
        </motion.h2>

        {/* DESCRIPTION */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`max-w-2xl mb-10 md:mb-16 text-sm sm:text-base ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {t("about_description")}
        </motion.p>

        {/* STATS */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >

          {/* CARD 1 */}
          <motion.div
            variants={card}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative p-6 md:p-8 border-l-4 border-[#F0B100] bg-gradient-to-r from-[#F0B100]/10 to-transparent overflow-hidden"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-3 right-3 w-2 h-2 md:w-3 md:h-3 bg-[#F0B100] rounded-full"
            />

            <Users className="text-[#F0B100] mb-3" size={28} />

            <h3 className="text-2xl md:text-4xl font-extrabold">
              {totalPlayers.toLocaleString()}+
            </h3>

            <p className="mt-2 text-xs sm:text-sm">
              {t("players_registered")}
            </p>
          </motion.div>

          {/* CARD 2 */}
          <motion.div
            variants={card}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative p-6 md:p-8 border-l-4 border-[#F0B100] bg-gradient-to-r from-[#F0B100]/10 to-transparent overflow-hidden"
          >
            <Trophy className="text-[#F0B100] mb-3" size={28} />

            <h3 className="text-xl md:text-2xl font-extrabold">
              {t("gaming_soon")}
            </h3>

            <p className="mt-2 text-xs sm:text-sm">
              {t("championships")}
            </p>
          </motion.div>

          {/* CARD 3 */}
          <motion.div
            variants={card}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative p-6 md:p-8 border-l-4 border-[#F0B100] bg-gradient-to-r from-[#F0B100]/10 to-transparent overflow-hidden"
          >
            <Target className="text-[#F0B100] mb-3" size={28} />

            <h3 className="text-2xl md:text-4xl font-extrabold">
              3+
            </h3>

            <p className="mt-2 text-xs sm:text-sm">
              {t("years_of_experience")}
            </p>
          </motion.div>

        </motion.div>

        {/* BUTTON */}
   

      </div>
    </section>
  );
}
