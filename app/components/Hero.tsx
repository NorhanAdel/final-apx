"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Tv } from "lucide-react";
import Image from "next/image";
import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import { GET_ALL_HERO_VIDEOS } from "@/app/graphql/query/hero.queries";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

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
          video_url: v.video_url?.startsWith("http")
            ? v.video_url
            : `${BASE_API}${v.video_url}`,
        }));
        setVideos(formatted);
      } else {
        setVideos([]);
      }
    } catch (err) {
      console.error(err);
      setVideos([]);
    } finally {
      setLoading(false);
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
          if (v && i !== index) v.pause();
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
    if (playingIndex === index) setPlayingIndex(null);
  };

  const VideoCard = (video: Video, index: number) => (
    <div
      onClick={() => handlePlayVideo(index)}
      className="
        relative w-full h-[230px] sm:h-[260px] md:h-[300px]
        rounded-xl overflow-hidden cursor-pointer
      "
    >
      <video
        ref={(el) => {
          videoRefs.current[index] = el;
        }}
        className="w-full h-full object-cover"
        muted={isMuted}
        playsInline
        onEnded={() => handleVideoEnded(index)}
      >
        <source src={video.video_url} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/30" />

      <div className="absolute inset-0 flex items-center justify-center text-white text-2xl">
        {playingIndex === index ? "⏸" : "▶"}
      </div>

      <button
        onClick={(e) => toggleMute(e, index)}
        className="absolute bottom-3 right-3 bg-black/60 p-2 rounded-full"
      >
        {isMuted ? <VolumeX /> : <Volume2 />}
      </button>

      <div className="absolute bottom-3 left-3 text-white text-sm">
        {video.title}
      </div>
    </div>
  );

  return (
    <section
      dir={currentLang === "ar" ? "rtl" : "ltr"}
      className={`min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-12 py-20
      ${theme === "dark" ? "bg-[#020617]" : "bg-white"}`}
    >
      <div
        className={`relative w-full max-w-7xl rounded-3xl overflow-hidden mt-10 shadow-2xl border
        ${
          theme === "dark"
            ? "bg-[#0b0b0b] border-white/10"
            : "bg-white border-black/10"
        }`}
      >
        {/* HERO */}
        <div className="relative grid md:grid-cols-2 items-center px-6 md:px-12 py-6 md:py-5 gap-8 md:gap-10">
          {/* TEXT */}
          <div className="space-y-4 text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
            Super 7 Bourse
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

          <div className="flex justify-center">
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="relative w-64 sm:w-80 md:w-[420px] h-64 sm:h-80 md:h-[420px]"
            >
              <Image src="/h.png" alt="player" fill className="object-contain" />
            </motion.div>
          </div>
        </div>

        {/* VIDEOS */}
        <div className="py-10 px-4">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : videos.length === 0 ? (
            <div className="text-center py-8">No videos</div>
          ) : (
            <Swiper
              spaceBetween={15}
              slidesPerView={1.2}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {videos.map((v, i) => (
                <SwiperSlide key={v.id}>
                  {VideoCard(v, i)}
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </section>
  );
}
