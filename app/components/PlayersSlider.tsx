"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";
import { useEffect, useState } from "react";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";

import "swiper/css";
import "swiper/css/effect-coverflow";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

interface Ad {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  video_url?: string;
  views_count?: number;
  created_at?: string;
}

export default function PlayersSlider() {
  const { lang } = useTranslate();

  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAds();
  }, [lang]);

  const fetchAds = async () => {
    setLoading(true);

    const query = `
      query {
        activeAds {
          id
          title
          description
          image_url
          video_url
          views_count
          created_at
        }
      }
    `;

    try {
      const result = await fetchGraphQL<{ activeAds: Ad[] }>(
        query,
        {}
      );

      if (!result.data?.activeAds) {
        setAds([]);
        return;
      }

      const formatted = result.data.activeAds.map((ad) => ({
        ...ad,
        image_url: ad.image_url
          ? ad.image_url.startsWith("http")
            ? ad.image_url
            : `${API_URL}${ad.image_url}`
          : "/p1.png",
      }));

      setAds(formatted);
    } catch (err) {
      console.error("Fetch error:", err);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-2 sm:px-3 md:px-8 lg:px-12 pt-32 pb-10">

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : ads.length === 0 ? (
        <p className="text-center">No ads found</p>
      ) : (
        <Swiper
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          loop={true}
          modules={[EffectCoverflow]}
          breakpoints={{
            0: { slidesPerView: 1.4 },
            480: { slidesPerView: 1.6 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 120,
            modifier: 2,
            slideShadows: false,
          }}
          className="w-full"
        >
          {ads.map((ad) => (
            <SwiperSlide key={ad.id}>
              <Link href={`/football/${ad.id}`}>
                <div className="relative w-full h-[220px] sm:h-[260px] md:h-[280px] lg:h-[320px] rounded-xl overflow-hidden cursor-pointer group">

                  <Image
                    src={ad.image_url!}
                    alt={ad.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />

                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition" />

                  <div className="absolute bottom-3 left-3 text-white font-bold text-lg">
                    {ad.title}
                  </div>

                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}