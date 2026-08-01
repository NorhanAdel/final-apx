"use client";

import { useEffect, useState, useRef } from "react";
import useTranslate from "../hooks/useTranslate";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.28";

interface Video {
  id: string | number;
  title?: string;
  video_url: string;
  type?: string;
}

interface Props {
  videos?: Video[];
  playerId?: string;
}

interface TypeMap {
  ar: string;
  en: string;
  pt: string;
  zh: string;
}

interface TypeMapRecord {
  HIGHLIGHT: TypeMap;
  FULL_MATCH: TypeMap;
  TRAINING: TypeMap;
}

type SupportedLang = "ar" | "en" | "pt" | "zh";

export default function ReelsPlayer({ videos = [] }: Props) {
  const { t, lang } = useTranslate();

  const [selected, setSelected] = useState<string>("");

  const hasSetInitial = useRef(false);

  const isRTL = lang === "ar";

  const formatVideoType = (type?: string): string | null => {
    if (!type) return null;

    const arabicToKey: Record<string, string> = {
      "ملخص مهارات": "HIGHLIGHT",
      "مباراة كاملة": "FULL_MATCH",
      "تدريبات وتسديدات": "TRAINING",
      تدريب: "TRAINING",
    };

    const normalizedKey = arabicToKey[type] || type.toUpperCase();

    const typeMap: TypeMapRecord = {
      HIGHLIGHT: {
        ar: "🎬 ملخص مهارات",
        en: "🎬 Highlight",
        pt: "🎬 Melhores Momentos",
        zh: "🎬 集锦",
      },
      FULL_MATCH: {
        ar: "⚽ مباراة كاملة",
        en: "⚽ Full Match",
        pt: "⚽ Partida Completa",
        zh: "⚽ 全场比赛",
      },
      TRAINING: {
        ar: "🏋️ تدريبات وتسديدات",
        en: "🏋️ Training",
        pt: "🏋️ Treinamento",
        zh: "🏋️ 训练",
      },
    };

    const translation = typeMap[normalizedKey as keyof TypeMapRecord];

    if (!translation) return type;

    const currentLang = (lang || "en") as SupportedLang;
    return translation[currentLang] || translation["en"];
  };

  const getFullUrl = (url?: string): string => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  };

  useEffect(() => {
    if (!videos.length) return;

    if (!hasSetInitial.current) {
      hasSetInitial.current = true;
      const first = videos[0]?.video_url;

      if (first) {
        setSelected(getFullUrl(first));
      }
    }
  }, [videos]);

  const currentVideo = videos.find((v) => getFullUrl(v.video_url) === selected);

  if (!videos.length) {
    return (
      <div className="w-full py-16 flex items-center justify-center text-gray-400">
        {t("No videos available")}
      </div>
    );
  }

  return (
    <div className="w-full max-w-[900px] mx-auto mt-20 text-white">
      <h2 className="text-yellow-400 text-3xl font-bold text-center mb-6">
        {t("Videos") || "الفيديوهات"}
      </h2>

      <div className="relative rounded-xl overflow-hidden bg-black border border-[#1c2c55]">
        {currentVideo && (
          <div
            className={`absolute top-4 flex flex-wrap items-center gap-2 z-10 pointer-events-none ${
              isRTL ? "right-4" : "left-4"
            }`}
          >
            {currentVideo.type && (
              <span className="bg-black/60 backdrop-blur-md border border-yellow-400/50 text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                {formatVideoType(currentVideo.type)}
              </span>
            )}
            {currentVideo.title && (
              <span className="bg-black/60 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg border border-gray-700/50">
                {currentVideo.title}
              </span>
            )}
          </div>
        )}

        {selected && (
          <video
            key={selected}
            src={selected}
            controls
            playsInline
            className="w-full h-[420px] object-cover"
          />
        )}
      </div>

      <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
        {videos.map((v) => {
          const url = getFullUrl(v.video_url);

          return (
            <video
              key={v.id}
              src={url}
              onClick={() => setSelected(url)}
              className={`w-[150px] h-[90px] object-cover rounded-lg cursor-pointer border ${
                selected === url ? "border-yellow-400" : "border-[#1c2c55]"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
