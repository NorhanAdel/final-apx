"use client";

import { LocateFixed, Star, ChevronLeft, ChevronRight, User } from "lucide-react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

export default function NewestPlayers() {
  const { theme } = useTheme();

  const players = [
    { name: "Ronaldo", img: "/b2.jpg" },
    { name: "Luis Diaz", img: "/b3.jpg" },
    { name: "Milito Rezkou", img: "/r3.png" },
    { name: "Player Four", img: "/r1.png" },
    { name: "Player Five", img: "/r2.png" },
  ];

  return (
    <div className="mt-14 px-3 sm:px-6 lg:px-10">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">

        <motion.h2
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          className={`text-lg sm:text-2xl font-bold italic tracking-wide ${
            theme === "dark" ? "text-white" : "text-[#F0B100]"
          }`}
        >
          Newest Players
        </motion.h2>

        <div className="flex gap-2">

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`prevPlayer w-9 h-9 flex items-center justify-center border rounded-md transition ${
              theme === "dark"
                ? "bg-[#0b1120] border-[#1e293b] text-white"
                : "bg-gray-200 border-gray-300 text-black"
            }`}
          >
            <ChevronLeft size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`nextPlayer w-9 h-9 flex items-center justify-center border rounded-md transition ${
              theme === "dark"
                ? "bg-[#0b1120] border-[#1e293b] text-white"
                : "bg-gray-200 border-gray-300 text-black"
            }`}
          >
            <ChevronRight size={16} />
          </motion.button>

        </div>
      </div>

      {/* Slider */}
      <Swiper
        modules={[Navigation]}
        navigation={{
          nextEl: ".nextPlayer",
          prevEl: ".prevPlayer",
        }}
        spaceBetween={20}
        breakpoints={{
          0: { slidesPerView: 1.1 },
          640: { slidesPerView: 1.5 },
          768: { slidesPerView: 2.2 },
          1024: { slidesPerView: 3.2 },
        }}
      >

        {players.map((p, i) => (
          <SwiperSlide key={i}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.04, y: -8 }}
              transition={{ duration: 0.4 }}
              className={`rounded-2xl overflow-hidden border shadow-lg transition-all ${
                theme === "dark"
                  ? "bg-[#0b1120] border-[#1e293b]"
                  : "bg-white border-gray-200"
              }`}
            >

              {/* Image */}
              <div className="relative w-full h-[220px] sm:h-[250px] overflow-hidden">
                <Image
                  src={p.img}
                  alt={p.name}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-110"
                />

                {/* overlay glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="p-4">

                {/* Name + Stars */}
                <div className="flex justify-between items-center mb-3">
                  <h3
                    className={`text-base sm:text-lg font-bold truncate ${
                      theme === "dark" ? "text-white" : "text-black"
                    }`}
                  >
                    {p.name}
                  </h3>

                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex text-[#FDC700]"
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={13} fill="currentColor" />
                    ))}
                  </motion.div>
                </div>

                {/* Info */}
                <div
                  className={`flex flex-col gap-2 text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >

                  <div className="flex justify-between items-center">
                    <span
                      className={`font-semibold ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Goalkeeper
                    </span>

                    <span className="flex items-center">
                      <LocateFixed size={12} className="text-[#FDC700] mr-1" />
                      Saudi Arabia
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#FDC700] flex items-center">
                      <User size={12} className="mr-1" />
                      412Y
                    </span>
                  </div>

                </div>

              </div>

            </motion.div>
          </SwiperSlide>
        ))}

      </Swiper>

    </div>
  );
}