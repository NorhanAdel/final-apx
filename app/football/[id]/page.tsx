"use client";

import Image from "next/image";
import { Star, MapPin, Trophy, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useTranslate from "@/app/hooks/useTranslate"; // ✅ مهم

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

interface Ad {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  video_url?: string;
  views_count?: number;
  created_at?: string;
  target_role?: string;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}

export default function PlayerCard() {
  const { id } = useParams(); // ✅ جلب id من الرابط
  const { lang } = useTranslate(); // ✅ اللغة

  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAd = async () => {
      try {
        const res = await fetch(`${API_URL}/graphql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept-Language": lang, // 🔥 الترجمة من الباك
          },
          body: JSON.stringify({
            query: `
              query GetAdWithUser($id: ID!) {
                ad(id: $id) {
                  id
                  title
                  description
                  image_url
                  video_url
                  target_role
                  views_count
                  created_at
                  user {
                    first_name
                    last_name
                    role
                  }
                }
              }
            `,
            variables: {
              id,
            },
          }),
        });

        const json = await res.json();

        console.log("DETAIL RESPONSE:", json);

        if (!json?.data?.ad) {
          console.log("❌ Not Found");
          setAd(null);
          return;
        }

        setAd(json.data.ad);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAd();
  }, [id, lang]); // ✅ مهم عشان الترجمة تتغير

  if (!ad) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#020617] p-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-[#030a1f] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">

        {/* IMAGE */}
        <div className="relative w-full md:w-1/2 h-[400px] md:h-auto">
          <Image
            src={
              ad.image_url?.startsWith("http")
                ? ad.image_url
                : `${API_URL}${ad.image_url}`
            }
            alt={ad.title}
            fill
            className="object-cover object-top"
            priority
          />

          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#030a1f]/80 hidden md:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030a1f] to-transparent md:hidden" />
        </div>

        {/* CONTENT */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black italic uppercase text-white mb-6 tracking-tighter">
              {ad.title}
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed mb-8 italic">
              {ad.description}
            </p>

            <div className="flex justify-end mb-6">
              <span className="text-slate-500 text-xs font-mono">
                {new Date(ad.created_at || "").toDateString()}
              </span>
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t border-slate-800 pt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">

              {/* USER */}
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#FFD700] flex items-center justify-center bg-slate-700 text-white font-bold">
                  {ad.user?.first_name?.[0] || "U"}
                </div>

                <div>
                  <h3 className="text-white font-bold text-sm">
                    {ad.user
                      ? `${ad.user.first_name} ${ad.user.last_name}`
                      : "Unknown User"}
                  </h3>

                  <p className="text-[#FFD700] text-xs font-medium">
                    {ad.user?.role || "Player"}
                  </p>
                </div>
              </div>

              {/* STARS */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="fill-[#FFD700] text-[#FFD700]"
                  />
                ))}
              </div>
            </div>

            {/* STATS */}
            <div className="flex items-center justify-between mt-6 text-[10px] uppercase tracking-wider font-bold text-slate-300">
              <div className="flex items-center gap-1">
                <Trophy size={14} className="text-[#FFD700]" />
                <span>{ad.target_role || "Player"}</span>
              </div>

              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-[#FFD700]" />
                <span>Unknown</span>
              </div>

              <div className="flex items-center gap-1">
                <Calendar size={14} className="text-[#FFD700]" />
                <span>{ad.views_count ?? 0} Views</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}