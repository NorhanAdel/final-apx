"use client";

import React from "react";
import Image from "next/image";
import { Timer } from "lucide-react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

// =========================
// IMAGE FIX (same logic)
// =========================
const getImageUrl = (url: string | null) => {
  if (!url) return "/Chapm.png";
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
};

interface CardProps {
  id: string;
  title: string;
  date: string;
  image?: string;
}

const TournamentCard = ({ id, title, date, image }: CardProps) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/championship/${id}`)}
      className="group relative bg-[#050510] rounded-2xl border border-yellow-600/30 overflow-hidden cursor-pointer"
    >
      <div className="relative aspect-square w-full">

        <Image
          src={getImageUrl(image || null)}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent opacity-90 z-10" />

        <div className="absolute inset-0 z-20 p-5 flex flex-col justify-end">

          <h3 className="text-white text-xl font-black italic uppercase mb-6">
            {title}
          </h3>

          <div className="flex justify-end items-center gap-2 text-yellow-500 font-bold">
            <Timer size={16} />
            <span className="text-[13px] uppercase">
              {date}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TournamentCard;
