"use client";

import { useRouter } from "next/navigation";
import { CircleDot } from "lucide-react";

interface PlayerNotFoundProps {
  levelCode: string;
  text: string;
  backText: string;
  isDark: boolean;
}

export default function PlayerNotFound({
  levelCode,
  text,
  backText,
  isDark,
}: PlayerNotFoundProps) {
  const router = useRouter();

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center ${
        isDark ? "bg-[#030712]" : "bg-slate-50"
      }`}
    >
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5">
          <CircleDot size={32} className="text-red-500" />
        </div>

        <p className="text-red-500 text-lg font-black">{text}</p>

        <button
          onClick={() => router.push(`/scales/${levelCode}`)}
          className="mt-4 text-amber-500 hover:text-amber-400 text-sm font-bold transition-colors"
        >
          {backText}
        </button>
      </div>
    </div>
  );
}
