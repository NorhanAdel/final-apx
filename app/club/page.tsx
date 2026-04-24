"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Star,
  LayoutGrid,
  Users,
  Trophy,
  LogOut,
  Mail,
  Phone,
  MapPin,
  X,
  Share2,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useTheme } from "../context/ThemeContext";

import "swiper/css";
import "swiper/css/navigation";

/* ================= TYPES ================= */
type RatingBarProps = {
  value: number;
  isDark: boolean;
};

/* ================= COMPONENT ================= */
export default function ClubProfile() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const members = [
    { name: "Ronald Richards", img: "/b2.jpg" },
    { name: "Ronald Richards", img: "/b2.jpg" },
    { name: "Ronald Richards", img: "/b2.jpg" },
    { name: "Ronald Richards", img: "/b2.jpg" },
  ];

  const menuButtons = [
    {
      label: "Requests",
      icon: <LayoutGrid size={18} />,
      path: "/agent/profile/requests",
    },
    {
      label: "Share AD",
      icon: <Share2 size={18} />,
      path: "/profile/share",
    },
    {
      label: "Favourite Players",
      icon: <Users size={18} />,
      path: "/players",
    },
    {
      label: "My Scout",
      icon: <Trophy size={18} />,
      path: "/club/scout",
    },
    {
      label: "Participation Prime",
      icon: <Trophy size={18} />,
      path: "/ParticipationPrime",
    },
    {
      label: "Logout",
      icon: <LogOut size={18} />,
      color: "text-red-600",
      action: () => setShowLogoutModal(true),
    },
  ];

  return (
    <div
      className={`min-h-screen font-sans md:p-10 flex justify-center transition
      ${isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-black"}`}
    >
      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-xl p-10 text-center relative
            ${isDark ? "bg-[#050B18]" : "bg-white"}`}
          >
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 text-gray-500"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-4">Logout</h2>

            <p
              className={`${
                isDark ? "text-gray-400" : "text-gray-600"
              } mb-6`}
            >
              Are you sure you want to logout?
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className={`flex-1 py-3 rounded-md
                  ${isDark ? "bg-[#0A1A44]" : "bg-gray-200"}`}
              >
                Cancel
              </button>

              <button className="flex-1 py-3 bg-red-600 text-white rounded-md">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl py-20 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-6">
          <div
            className={`relative w-full md:w-[400px] aspect-square rounded-md overflow-hidden
            ${
              isDark
                ? "border border-blue-900/50"
                : "border border-gray-200"
            }`}
          >
            <Image src="/Club.jpg" fill alt="Club" />
          </div>

          <div className="flex-1 space-y-4">
            <h1 className="text-4xl font-bold">RONALD CLUB</h1>

            <div className="flex text-[#FFD700]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="currentColor" />
              ))}
            </div>

            <div
              className={`${
                isDark ? "text-gray-300" : "text-gray-600"
              } space-y-2`}
            >
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                Saudi Arabia
              </div>

              <div className="flex gap-6 flex-wrap">
                <span className="flex items-center gap-2">
                  <Mail size={16} /> email@gmail.com
                </span>
                <span className="flex items-center gap-2">
                  <Phone size={16} /> +966 123456
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={() => router.push("/agent/profile")}
          className={`w-full py-3 rounded-md mb-6
            ${
              isDark
                ? "bg-[#0A1A44] text-white hover:bg-[#132a66]"
                : "bg-yellow-400 text-black hover:bg-yellow-500"
            }`}
        >
          Edit Profile
        </button>

        {/* Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12">
          {menuButtons.map((btn, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (btn.path) router.push(btn.path);
                if (btn.action) btn.action();
              }}
              className={`p-4 rounded-md flex justify-between items-center transition
                ${isDark ? "bg-[#051139]" : "bg-white shadow"}`}
            >
              <span>{btn.label}</span>
              <span
                className={
                  btn.color ||
                  (isDark ? "text-yellow-400" : "text-yellow-600")
                }
              >
                {btn.icon}
              </span>
            </button>
          ))}
        </div>

        {/* Ratings */}
        <div className="mb-12">
          <h2
            className={`text-center text-2xl mb-6
            ${isDark ? "text-[#FFD700]" : "text-yellow-600"}`}
          >
            Ratings
          </h2>

          <div className="space-y-4">
            <RatingBar value={95} isDark={isDark} />
            <RatingBar value={75} isDark={isDark} />
            <RatingBar value={55} isDark={isDark} />
          </div>
        </div>

        {/* Swiper */}
        <Swiper modules={[Navigation]} spaceBetween={20} slidesPerView={2}>
          {members.map((m, i) => (
            <SwiperSlide key={i}>
              <div
                className={`p-4 rounded-xl flex items-center gap-4
                ${isDark ? "bg-[#051139]" : "bg-white shadow"}`}
              >
                <Image
                  src={m.img}
                  width={50}
                  height={50}
                  alt="avatar"
                  className="rounded-full"
                />
                <p>{m.name}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

/* ================= RATING BAR ================= */
function RatingBar({ value, isDark }: RatingBarProps) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex-1 h-2 rounded-full
        ${isDark ? "bg-[#0A1A44]" : "bg-gray-300"}`}
      >
        <div
          className="h-full bg-yellow-400"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}