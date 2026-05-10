"use client";

import React from "react";
import Image from "next/image";
import { Timer } from "lucide-react";
import { useRouter } from "next/navigation";

interface CardProps {
  id: string;
  title: string;
  date: string;
}

const TournamentCard = ({ id, title, date }: CardProps) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/championship/${id}`)}
      className="group relative bg-[#050510] border border-yellow-600/30 overflow-hidden hover:border-yellow-500 transition-all duration-300 shadow-2xl cursor-pointer"
    >
      <div className="relative aspect-square w-full">
        <Image
          src="/Chapm.png"
          alt="Tournament Background"
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent opacity-90 z-10" />

        <div className="absolute inset-0 z-20 p-5 flex flex-col justify-end">
          <h3 className="text-white text-xl md:text-2xl font-black italic uppercase leading-tight drop-shadow-lg mb-6">
            {title}
          </h3>

          <div className="flex justify-end items-center gap-2 text-yellow-500 font-bold">
            <Timer size={16} />

            <span className="text-[13px] tracking-tighter uppercase">
              {date}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentCard;