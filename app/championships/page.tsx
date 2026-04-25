"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  Sparkles,
  Calendar,
  MapPin,
  Users,
  Award,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";

export default function ChampionshipsPage() {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const isDark = theme === "dark";

  const floatingAnimation = {
    y: [0, -20, 0],
    rotate: [0, 5, -5, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
  };

  const pulseAnimation = {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: { duration: 2, repeat: Infinity },
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${
        isDark ? "bg-[#020617]" : "bg-gray-50"
      }`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${
              isDark ? "#F0B100" : "#F0B100"
            } 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glowing Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 rounded-full bg-yellow-400/10 blur-[100px]"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-yellow-500/10 blur-[120px]"
          animate={{
            x: [0, -80, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-yellow-600/5 blur-[150px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-40 min-h-screen flex flex-col items-center justify-center">
        {/* Animated Icon */}
        <motion.div animate={floatingAnimation} className="mb-8">
          <div className="relative">
            <motion.div
              animate={pulseAnimation}
              className="absolute inset-0 rounded-full bg-yellow-400/30 blur-xl"
            />
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-2xl">
              <Trophy size={60} className="text-white" strokeWidth={1.5} />
            </div>
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 tracking-wider">
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              {t("championships") || "CHAMPIONSHIPS"}
            </span>
          </h1>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              {t("coming_soon_championships") || "Coming Soon"}
            </span>
          </h2>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <p
            className={`text-lg md:text-xl ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {t("championships_soon_desc") ||
              "Our championships page is under construction. Exciting tournaments and competitions are coming soon. Stay tuned for updates!"}
          </p>
        </motion.div>

        {/* Features Grid - Sports/Tournament themed */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 w-full"
        >
          {[
            {
              icon: Calendar,
              title: t("upcoming_tournaments") || "Upcoming Tournaments",
              desc:
                t("upcoming_tournaments_desc") ||
                "Stay tuned for exciting tournament schedules",
            },
            {
              icon: Award,
              title: t("amazing_prizes") || "Amazing Prizes",
              desc:
                t("amazing_prizes_desc") ||
                "Win exclusive rewards and recognition",
            },
            {
              icon: Users,
              title: t("global_competition") || "Global Competition",
              desc:
                t("global_competition_desc") ||
                "Compete with athletes from around the world",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`p-6 rounded-2xl text-center transition-all duration-300 ${
                isDark
                  ? "bg-[#0a0f2c] border border-[#1e2a5a] hover:border-yellow-400/50"
                  : "bg-white border border-gray-200 shadow hover:shadow-lg"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full bg-yellow-400/20 flex items-center justify-center mx-auto mb-4`}
              >
                <feature.icon size={32} className="text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Upcoming Tournaments Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="w-full max-w-3xl mx-auto mt-12"
        >
          <div
            className={`rounded-2xl overflow-hidden ${
              isDark
                ? "bg-[#0a0f2c]/50 border border-[#1e2a5a]"
                : "bg-white shadow-lg border border-gray-200"
            } backdrop-blur-sm p-1`}
          >
            <div
              className={`relative rounded-xl overflow-hidden p-6 ${
                isDark ? "bg-[#0a0f2c]" : "bg-white"
              }`}
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-2 mb-3 justify-center md:justify-start">
                    <Sparkles size={20} className="text-yellow-400" />
                    <span className="text-yellow-400 font-semibold uppercase tracking-wider">
                      {t("first_championship") || "First Championship"}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {t("summer_championship_2024") ||
                      "Summer Championship 2024"}
                  </h3>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start text-sm mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} className="text-yellow-400" />
                      {t("coming_soon_date") || "Coming Soon"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} className="text-yellow-400" />
                      {t("location_tbd") || "Location TBD"}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-500 transition flex items-center gap-2 mx-auto md:mx-0"
                  >
                    {t("notify_me") || "Notify Me"}
                    <ArrowRight size={18} />
                  </motion.button>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-16 h-16 rounded-xl ${
                        isDark
                          ? "bg-[#0a0f2c] border border-[#1e2a5a]"
                          : "bg-gray-100 border border-gray-200"
                      } flex items-center justify-center`}
                    >
                      <Trophy size={28} className="text-yellow-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Countdown / Under Construction Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              isDark
                ? "bg-yellow-400/10 border border-yellow-400/30"
                : "bg-yellow-50 border border-yellow-200"
            } backdrop-blur-sm`}
          >
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-sm font-medium text-yellow-600">
              {t("under_construction") ||
                "🏗️ Under Construction • Launching Soon"}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Custom CSS for gradient animation */}
      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
