"use client";

import { Camera, Video, Megaphone, Trophy } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import BackButton from "@/app/components/BackButton";
import useTranslate from "../../hooks/useTranslate";

type PlanCardProps = {
  title: string;
  color: string;
  photos: string;
  videos: string;
  promo: string;
  price: string;
  gold?: boolean;
};

export default function ParticipationPrime() {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center py-38 px-4
      ${isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-black"}`}
    >
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>

        <h1
          className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-16 text-center
          ${isDark ? "text-[#FFD400]" : "text-yellow-600"}`}
        >
          {t("participationPrime")}
        </h1>

        <div className="flex flex-col sm:flex-row flex-wrap gap-10 items-center justify-center">
          <PlanCard
            title={t("bronzePrime")}
            color="from-[#c98b3c] to-[#7a4a13]"
            photos={`2 ${t("photos")}`}
            videos={`1 ${t("video")}`}
            promo={`1 ${t("freePromotion")}`}
            price="50"
            isDark={isDark}
          />

          <div className="sm:scale-110">
            <PlanCard
              title={t("goldPrime")}
              color="from-yellow-400 to-yellow-600"
              gold
              photos={`10 ${t("photos")}`}
              videos={`5 ${t("videos")}`}
              promo={`3 ${t("freePromotion")}`}
              price="120"
              isDark={isDark}
            />
          </div>

          <PlanCard
            title={t("silverPrime")}
            color="from-gray-300 to-gray-500"
            photos={`5 ${t("photos")}`}
            videos={`2 ${t("videos")}`}
            promo={`2 ${t("freePromotion")}`}
            price="80"
            isDark={isDark}
          />
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  title,
  color,
  photos,
  videos,
  promo,
  price,
  gold,
  isDark,
}: PlanCardProps & { isDark: boolean }) {
  const { t } = useTranslate();

  return (
    <div
      className={`relative w-[320px] rounded-xl p-6 shadow-xl transition
        ${
          isDark
            ? "bg-[#06122c] border border-[#1a2b55]"
            : "bg-white border border-gray-200"
        }
        ${gold ? "shadow-yellow-500/30" : ""}`}
    >
      <div className="absolute -top-5 left-0 flex items-center">
        <div
          className={`bg-gradient-to-r ${color} text-black font-bold px-7 py-2 flex items-center gap-2 text-sm rounded-tl-xl rounded-br-xl`}
        >
          <Trophy size={16} className="text-[#FFD400]" />
          {title}
        </div>
      </div>

      <div
        className={`mt-12 space-y-4 text-base
        ${isDark ? "text-gray-300" : "text-gray-600"}`}
      >
        <div
          className={`flex items-center gap-2 pb-2
          ${isDark ? "border-b border-gray-700" : "border-b border-gray-200"}`}
        >
          <Camera size={16} className="text-[#FFD400]" />
          {photos}
        </div>

        <div
          className={`flex items-center gap-2 pb-2
          ${isDark ? "border-b border-gray-700" : "border-b border-gray-200"}`}
        >
          <Video size={16} className="text-[#FFD400]" />
          {videos}
        </div>

        <div className="flex items-center gap-2">
          <Megaphone size={16} className="text-[#FFD400]" />
          {promo}
        </div>
      </div>

      <div
        className={`flex justify-end mt-6 font-bold text-lg
        ${isDark ? "text-[#FFD400]" : "text-yellow-600"}`}
      >
        ${price}
      </div>

      <button
        className={`mt-4 w-full py-2 rounded-md transition
          ${
            isDark
              ? "bg-[#021448] border-x-2 border-[#FFD400] text-white hover:bg-[#123a8a]"
              : "bg-yellow-400 text-black hover:bg-yellow-500"
          }`}
      >
        {t("upgrade")}
      </button>
    </div>
  );
}
