"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Tv } from "lucide-react";
import Image from "next/image";
import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";

const BASE_API = process.env.NEXT_PUBLIC_API_URL;

interface Video {
  id: string;
  title: string;
  video_url: string;
  order: number;
  created_at: string;
}

export default function Hero({ lang }: { lang: string }) {
  const { theme } = useTheme();
  const { t } = useTranslate(lang);

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    fetchVideos();
  }, [lang]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const query = `
        query {
          allHeroVideos {
            id
            title
            video_url
            order
            created_at
          }
        }
      `;

      const resp = await fetchGraphQL<{ allHeroVideos: Video[] }>(query);
      const json = resp.data || ({ allHeroVideos: [] } as any);

      const formatted: Video[] = (json.allHeroVideos || []).map((v: any) => ({
        ...v,
        video_url:
          v.video_url && v.video_url.startsWith("http")
            ? v.video_url
            : `${BASE_API}${v.video_url}`,
      }));

      setVideos(formatted);
    } catch (err) {
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-12 py-30 md:py-30
      ${theme === "dark" ? "bg-[#020617]" : "bg-white"}`}
    >
      <div
        className={`relative w-full max-w-7xl rounded-3xl overflow-hidden shadow-2xl border
        ${
          theme === "dark"
            ? "bg-[#0b0b0b] border-white/10"
            : "bg-white border-black/10"
        }`}
      >
        {/* glow */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute w-64 sm:w-96 h-64 sm:h-96 bg-[#FF6900] blur-[200px] -top-40 -left-40 rounded-full"></div>
          <div className="absolute w-64 sm:w-80 h-64 sm:h-80 bg-[#F0B100] blur-[200px] bottom-0 right-0 rounded-full"></div>
        </div>

        <div className="relative grid md:grid-cols-2 items-center px-6 md:px-12 py-6 md:py-5 gap-8 md:gap-10">
          {/* TEXT */}
          <div className="space-y-4 text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight
              ${theme === "dark" ? "text-white" : "text-black"}`}
            >
              Super7
            </motion.h1>

            <p
              className={`max-w-md mx-auto md:mx-0 ${
                theme === "dark" ? "text-white/70" : "text-black/70"
              }`}
            >
              {t("hero_description")}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center md:justify-start">
              <button
                className={`px-6 sm:px-8 py-2 sm:py-3 text-black font-semibold rounded-lg hover:scale-105 transition ${
                  theme === "dark" ? "bg-white" : "bg-[#F0B100]"
                }`}
              >
                {t("discover_more")}
              </button>

              <a
                href="#"
                className="flex items-center gap-2 text-[#F0B100] font-semibold hover:gap-3 transition"
              >
                <Tv size={20} />
                {t("watch_tv")}
              </a>
            </div>
          </div>

          {/* IMAGE */}
          <div className="relative flex justify-center mt-6 md:mt-0">
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="relative w-64 sm:w-80 md:w-[420px] h-64 sm:h-80 md:h-[420px]"
            >
              <Image
                src="/h.png"
                alt="player"
                fill
                className="object-contain"
              />
            </motion.div>
          </div>
        </div>

        {/* VIDEOS */}
        {loading ? (
          <p className="text-center">{t("loading")}</p>
        ) : videos.length === 0 ? (
          <p className="text-center">{t("no_videos")}</p>
        ) : (
          <div className="grid grid-cols-1 p-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-7xl">
            {videos.map((video, i) => (
              <div
                key={video.id}
                className="relative h-52 overflow-hidden group cursor-pointer rounded-lg shadow-lg"
                onMouseEnter={() => videoRefs.current[i]?.play()}
                onMouseLeave={() => {
                  if (videoRefs.current[i]) {
                    videoRefs.current[i].pause();
                    videoRefs.current[i].currentTime = 0;
                  }
                }}
              >
                <video
                  ref={(el) => {
                    if (el) videoRefs.current[i] = el;
                  }}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                  muted
                  loop
                  playsInline
                >
                  <source src={video.video_url} type="video/mp4" />
                </video>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/80 rounded-full flex items-center justify-center text-black text-lg">
                    ▶
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 text-sm font-semibold text-white">
                  {video.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
