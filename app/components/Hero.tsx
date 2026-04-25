"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Tv, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import { GET_ALL_HERO_VIDEOS } from "@/app/graphql/query/hero.queries";

const BASE_API = process.env.NEXT_PUBLIC_API_URL;

interface Video {
  id: string;
  title: string;
  video_url: string;
  order: number;
  created_at: string;
}

interface HeroVideosResponse {
  allHeroVideos: Video[];
}

export default function Hero() {
  const { theme } = useTheme();
  const { t, lang: currentLang } = useTranslate();

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVideos();
  }, [currentLang]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const resp = await fetchGraphQL<HeroVideosResponse>(GET_ALL_HERO_VIDEOS);

      if (resp.data?.allHeroVideos) {
        const formatted: Video[] = resp.data.allHeroVideos.map((v) => ({
          ...v,
          video_url:
            v.video_url && v.video_url.startsWith("http")
              ? v.video_url
              : `${BASE_API}${v.video_url}`,
        }));
        setVideos(formatted);
      } else {
        setVideos([]);
      }
    } catch (err) {
      console.error("Error fetching videos:", err);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.clientWidth / 3; // عرض 3 فيديوهات
      scrollContainerRef.current.scrollBy({
        left: -cardWidth,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.clientWidth / 3; // عرض 3 فيديوهات
      scrollContainerRef.current.scrollBy({
        left: cardWidth,
        behavior: "smooth",
      });
    }
  };

  const handlePlayVideo = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      if (playingIndex === index) {
        video.pause();
        setPlayingIndex(null);
      } else {
        videoRefs.current.forEach((v, i) => {
          if (v && i !== index) {
            v.pause();
          }
        });
        video.play();
        setPlayingIndex(index);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const video = videoRefs.current[index];
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  const handleVideoEnded = (index: number) => {
    if (playingIndex === index) {
      setPlayingIndex(null);
    }
  };

  return (
    <section
      dir={currentLang === "ar" ? "rtl" : "ltr"}
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
              Cr Super 7 Bourse
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

        {/* VIDEOS - Horizontal Scroll - Shows exactly 3 videos */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">{t("loading")}</div>
        ) : videos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">{t("no_videos")}</div>
        ) : (
          <div className="relative py-12 px-4">
            {/* Scroll Buttons - Always visible since we have enough videos */}
            {videos.length > 3 && (
              <>
                <button
                  onClick={scrollLeft}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 rounded-full p-3 transition-all duration-300 shadow-lg"
                >
                  <ChevronLeft size={32} className="text-white" />
                </button>
                <button
                  onClick={scrollRight}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 rounded-full p-3 transition-all duration-300 shadow-lg"
                >
                  <ChevronRight size={32} className="text-white" />
                </button>
              </>
            )}

            {/* Horizontal Scroll Container - Shows exactly 3 videos at a time */}
            <div className="flex justify-center">
              <div className="w-full max-w-5xl mx-auto overflow-hidden">
                <div
                  ref={scrollContainerRef}
                  className="flex overflow-x-auto scroll-smooth pb-4 hide-scrollbar"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    scrollSnapType: "x mandatory",
                  }}
                >
                  <style jsx>{`
                    .hide-scrollbar::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  <div className="flex-none w-full flex gap-6 px-2">
                    {videos.map((video, index) => (
                      <div
                        key={video.id}
                        className="relative w-[calc((100%/3)-16px)] flex-shrink-0 h-[320px] sm:h-[360px] md:h-[400px] overflow-hidden group cursor-pointer rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
                        style={{
                          scrollSnapAlign: "start",
                          flex: "0 0 auto",
                          width: "calc((100% / 3) - 16px)",
                          minWidth: "calc((100% / 3) - 16px)",
                        }}
                        onClick={() => handlePlayVideo(index)}
                      >
                        <video
                          ref={(el) => {
                            if (el) videoRefs.current[index] = el;
                          }}
                          className="w-full h-full object-cover transition duration-500"
                          muted={isMuted}
                          loop={false}
                          playsInline
                          onEnded={() => handleVideoEnded(index)}
                        >
                          <source src={video.video_url} type="video/mp4" />
                        </video>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                        {/* Play/Pause Overlay Button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          {playingIndex === index ? (
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/90 rounded-full flex items-center justify-center text-black text-2xl transition-transform hover:scale-110">
                              ⏸
                            </div>
                          ) : (
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/90 rounded-full flex items-center justify-center text-black text-2xl transition-transform hover:scale-110">
                              ▶
                            </div>
                          )}
                        </div>

                        {/* Mute/Unmute Button */}
                        <button
                          onClick={(e) => toggleMute(e, index)}
                          className="absolute bottom-4 right-4 w-9 h-9 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition z-10"
                        >
                          {isMuted ? (
                            <VolumeX size={18} className="text-white" />
                          ) : (
                            <Volume2 size={18} className="text-white" />
                          )}
                        </button>

                        <div className="absolute bottom-4 left-4 text-sm sm:text-base font-semibold text-white">
                          {video.title || t("video")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
