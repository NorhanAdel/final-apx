"use client";

import { Camera, Video, Megaphone, Trophy } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface PlanCardProps {
  title: string;
  color: string;
  photos: string;
  videos: string;
  promo: string;
  price: string;
  gold?: boolean;
  theme: "dark" | "light";
}

export default function ParticipationPrime() {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center py-38 sm:py-38 md:py-28 transition
      ${theme === "dark" ? "bg-[#020b1c] text-white" : "bg-[#f9fafb] text-black"}`}
    >
      <h1
        className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-10 sm:mb-16
        ${theme === "dark" ? "text-yellow-400" : "text-[#F0B100]"}`}
      >
        Participation Prime
      </h1>

      <div className="flex flex-col sm:flex-row flex-wrap gap-6 sm:gap-10 items-center justify-center">

        <PlanCard
          title="Bronze Prime"
          color="from-[#c98b3c] to-[#7a4a13]"
          photos="2 Photos"
          videos="1 Video"
          promo="1 Free Promotion"
          price="50"
          theme={theme}
        />

        <div className="scale-100 sm:scale-110">
          <PlanCard
            title="Gold Prime"
            color="from-yellow-400 to-yellow-600"
            gold
            photos="10 Photos"
            videos="5 Video"
            promo="3 Free Promotion"
            price="120"
            theme={theme}
          />
        </div>

        <PlanCard
          title="Silver Prime"
          color="from-gray-300 to-gray-500"
          photos="5 Photos"
          videos="2 Video"
          promo="2 Free Promotion"
          price="80"
          theme={theme}
        />

      </div>
    </div>
  );
}

// ================= PLAN CARD =================
function PlanCard({
  title,
  color,
  photos,
  videos,
  promo,
  price,
  gold = false,
  theme,
}: PlanCardProps) {
  return (
    <div
      className={`relative w-[320px] sm:w-[280px] md:w-[300px] lg:w-[320px] rounded-xl p-6 shadow-xl transition
      ${theme === "dark"
        ? "bg-[#06122c] border border-[#1a2b55]"
        : "bg-white border border-gray-200 shadow"
      } ${gold ? "shadow-yellow-500/30" : ""}`}
    >

      {/* Ribbon */}
      <div className="absolute -top-5 left-0 flex items-center">
        <div
          className={`bg-gradient-to-r ${color} text-black font-bold px-7 py-2 flex items-center gap-2 text-sm sm:text-base`}
        >
          <Trophy size={16} className="text-[#FFD400]" />
          {title}
        </div>
      </div>

      {/* Content */}
      <div className={`mt-12 space-y-4 text-base sm:text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
        <div className="flex items-center gap-2 border-b border-gray-400/30 pb-2">
          <Camera size={16} className="text-[#FFD400]" />
          {photos}
        </div>

        <div className="flex items-center gap-2 border-b border-gray-400/30 pb-2">
          <Video size={16} className="text-[#FFD400]" />
          {videos}
        </div>

        <div className="flex items-center gap-2">
          <Megaphone size={16} className="text-[#FFD400]" />
          {promo}
        </div>
      </div>

      {/* Price */}
      <div className={`flex justify-end mt-6 italic font-bold text-lg ${theme === "dark" ? "text-[#FFD400]" : "text-[#F0B100]"}`}>
        ${price}
      </div>

      {/* Button */}
      <button
        className={`mt-4 w-full py-2 rounded-md transition
        ${theme === "dark"
          ? "bg-[#021448] border-x-3 border-[#FFD400] hover:bg-[#123a8a] text-white"
          : "bg-[#F0B100] text-black hover:bg-yellow-500"
        }`}
      >
        Upgrade
      </button>

    </div>
  );
}