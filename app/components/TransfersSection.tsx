"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useEffect, useRef, useState } from "react";
import "swiper/css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";

interface Transfer {
  id: string;
  player_id: string;
  from_club: string;
  to_club: string;
  club_name?: string;
  status?: string;
  transfer_date: string;
  completed_at?: string;
  created_at: string;
  playerName?: string;
}

const ALL_TRANSFERS = `
query AllTransfers($filter: TransferFilterInput) {
  allTransfers(filter: $filter) {
    id
    player_id
    from_club
    to_club
    club_name
    status
    transfer_date
    completed_at
    created_at
    playerName
  }
}
`;

const T: any = {
  en: { title: "Transfers", loading: "Loading..." },
  ar: { title: "الانتقالات", loading: "جاري التحميل..." },
  pt: { title: "Transferências", loading: "Carregando..." },
  zh: { title: "转会", loading: "加载中..." },
};

export default function TransfersSection() {
  const { theme } = useTheme();
  const { lang } = useTranslate();

  const t = T[lang] || T.en;

  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    fetchTransfers();
  }, [lang]);

  const fetchTransfers = async () => {
    setLoading(true);

    // 🔥 FIX: removed lang argument
    const res = await fetchGraphQL<{ allTransfers: Transfer[] }>(
      ALL_TRANSFERS,
      {
        filter: {
          status: "Completed",
        },
      }
    );

    if (res.data?.allTransfers) {
      setTransfers(res.data.allTransfers);
    } else {
      setTransfers([]);
    }

    setLoading(false);
  };

  return (
    <section
      className={`mt-8 pb-16 w-full overflow-hidden transition-all duration-300
      ${theme === "dark" ? "bg-[#020617] text-white" : "text-[#F0B100]"}`}
    >
      <div className="flex items-center justify-between px-4 mb-6">
        <h2 className="text-2xl font-bold italic uppercase tracking-widest">
          {t.title}
        </h2>

        <div className="flex gap-2">
          <button ref={prevRef} className="w-10 h-10 border flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>

          <button ref={nextRef} className="w-10 h-10 border flex items-center justify-center">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center">{t.loading}</p>
      ) : (
        <div className="px-4">
          <Swiper
            modules={[Navigation]}
            spaceBetween={20}
            slidesPerView={1.2}
            onSwiper={(swiper) => {
              setTimeout(() => {
                if (
                  swiper.params.navigation &&
                  typeof swiper.params.navigation !== "boolean"
                ) {
                  swiper.params.navigation.prevEl = prevRef.current;
                  swiper.params.navigation.nextEl = nextRef.current;
                  swiper.navigation.destroy();
                  swiper.navigation.init();
                  swiper.navigation.update();
                }
              });
            }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1536: { slidesPerView: 4 },
            }}
          >
            {transfers.map((t) => (
              <SwiperSlide key={t.id}>
                <div
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-4 shadow-xl h-full transition
                  ${
                    theme === "dark"
                      ? "bg-[#0b1a3a] border-[#132a55]"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="text-center">
                    <h3 className="font-black italic text-lg uppercase">
                      {t.playerName || t.player_id}
                    </h3>

                    <p className="text-xs mt-1 text-gray-400">
                      {new Date(t.transfer_date).toLocaleDateString(lang)}
                    </p>
                  </div>

                  <div
                    className={`w-full flex items-center justify-between p-3 rounded-xl
                    ${theme === "dark" ? "bg-[#071126]" : "bg-gray-100"}`}
                  >
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-xs">{t.from_club}</span>
                    </div>

                    <div className="px-2 text-[#facc15] text-lg animate-pulse">
                      →
                    </div>

                    <div className="flex flex-col items-center flex-1">
                      <span className="text-xs text-[#facc15]">
                        {t.to_club}
                      </span>
                    </div>
                  </div>

                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </section>
  );
}