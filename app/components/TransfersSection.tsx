"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useEffect, useRef, useState } from "react";
import "swiper/css";
import { ChevronLeft, ChevronRight, User, LocateFixed, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";

interface Transfer {
  id: string;
  player_id: string;
  from_club: string;
  to_club: string;
  club_name?: string;
  logo_url?: string;
  status?: string;
  transfer_date: string;
  completed_at?: string;
  created_at: string;
  playerName?: string;
  player?: {
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
  };
}

const ALL_TRANSFERS = `
query AllTransfers($filter: TransferFilterInput) {
  allTransfers(filter: $filter) {
    id
    player_id
    from_club
    to_club
    club_name
    logo_url
    status
    transfer_date
    completed_at
    created_at
    playerName
    player {
      first_name
      last_name
      profile_image_url
    }
  }
}
`;

const T: any = {
  en: { title: "Transfers", loading: "Loading..." },
  ar: { title: "الانتقالات", loading: "جاري التحميل..." },
  pt: { title: "Transferências", loading: "Carregando..." },
  zh: { title: "转会", loading: "加载中..." },
};

export default function TransfersSection({
  sportId,
}: {
  sportId?: string;
}) {
  const { theme } = useTheme();
  const { lang } = useTranslate();
  const isDark = theme === "dark";
  const isRTL = lang === "ar";

  const t = T[lang] || T.en;

  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    fetchTransfers();
  }, [lang, sportId]);

  const fetchTransfers = async () => {
    setLoading(true);

    const filterObj: Record<string, any> = {
      status: "Completed",
    };
    if (sportId) {
      filterObj.sport_id = sportId;
    }

    const res = await fetchGraphQL<{ allTransfers: Transfer[] }>(
      ALL_TRANSFERS,
      {
        filter: filterObj,
      },
    );

    if (res.data?.allTransfers) {
      setTransfers(res.data.allTransfers);
    } else {
      setTransfers([]);
    }

    setLoading(false);
  };

  const getFullImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://albatal.info";
    const path = url.startsWith("/") ? url : `/${url}`;
    return `${baseUrl}${path}`;
  };

  const isUuid = (val?: string) => !!val && /^[0-9a-fA-F-]{36}$/.test(val);

  if (loading) {
    return (
      <div className="mt-14 px-3 sm:px-6 lg:px-10">
        <div className="flex items-center justify-center py-20">
          <div className="relative inline-flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
            <span className="text-xs font-black text-yellow-400 tracking-widest uppercase">
              {t.loading}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (transfers.length === 0) return null;

  return (
    <div className="mt-14 px-3 sm:px-6 lg:px-10">
      <div className="flex justify-between items-center mb-6">
        <motion.h2
          initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          className={`text-lg sm:text-2xl font-bold italic tracking-wide ${
            isDark ? "text-white" : "text-[#F0B100]"
          }`}
        >
          {t.title}
        </motion.h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`prevTransfer w-9 h-9 flex items-center justify-center border rounded-md transition ${
              isDark
                ? "bg-[#0b1120] border-[#1e293b] text-white"
                : "bg-gray-200 border-gray-300 text-black"
            }`}
            ref={prevRef}
          >
            {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`nextTransfer w-9 h-9 flex items-center justify-center border rounded-md transition ${
              isDark
                ? "bg-[#0b1120] border-[#1e293b] text-white"
                : "bg-gray-200 border-gray-300 text-black"
            }`}
            ref={nextRef}
          >
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </motion.button>
        </div>
      </div>

      <Swiper
        modules={[Navigation]}
        navigation={{ nextEl: ".nextTransfer", prevEl: ".prevTransfer" }}
        dir={isRTL ? "rtl" : "ltr"}
        spaceBetween={20}
        breakpoints={{
          0: { slidesPerView: 1.1 },
          640: { slidesPerView: 1.5 },
          768: { slidesPerView: 2.2 },
          1024: { slidesPerView: 3.2 },
        }}
      >
        {transfers.map((transfer) => {
          const playerImg = getFullImageUrl(transfer.player?.profile_image_url);
          const clubLogo = getFullImageUrl(transfer.logo_url);

          const realPlayerName =
            transfer.player?.first_name || transfer.player?.last_name
              ? `${transfer.player.first_name || ""} ${
                  transfer.player.last_name || ""
                }`.trim()
              : null;

          const pName =
            realPlayerName ||
            (transfer.playerName && !isUuid(transfer.playerName)
              ? transfer.playerName
              : null) ||
            (lang === "ar" ? "لاعب" : "Player");

          return (
            <SwiperSlide key={transfer.id}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.04, y: -8 }}
                transition={{ duration: 0.4 }}
                className={`rounded-2xl overflow-hidden border shadow-lg transition-all cursor-pointer ${
                  isDark
                    ? "bg-[#0b1120] border-[#1e293b]"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-yellow-500/40 bg-gray-800 flex items-center justify-center">
                      {playerImg ? (
                        <Image
                          src={playerImg}
                          alt={pName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <User size={18} className="text-gray-400" />
                      )}
                    </div>
                    <h3
                      className={`text-base sm:text-lg font-bold truncate ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      {pName}
                    </h3>
                  </div>

                  <div
                    className={`w-full flex items-center justify-between p-3 rounded-xl mb-3
                    ${isDark ? "bg-[#071126]" : "bg-gray-100"}`}
                  >
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-xs text-gray-500">
                        {transfer.from_club}
                      </span>
                    </div>

                    <div className={`px-2 text-yellow-500 text-lg font-bold ${isRTL ? "rotate-180" : ""}`}>
                      →
                    </div>

                    <div className="flex flex-col items-center flex-1">
                      <span className="text-xs text-yellow-500 font-semibold">
                        {transfer.to_club}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`flex justify-between items-center text-xs ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-yellow-500/30 bg-white/5 flex items-center justify-center">
                        {clubLogo ? (
                          <Image
                            src={clubLogo}
                            alt={transfer.club_name || transfer.to_club}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Building2 size={10} className="text-yellow-500" />
                        )}
                      </div>
                      {transfer.club_name || transfer.to_club}
                    </span>
                    <span>
                      {new Date(transfer.transfer_date).toLocaleDateString(lang)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}