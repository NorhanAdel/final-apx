"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Star,
  LayoutGrid,
  Users,
  Trophy,
  LogOut,
  Share2,
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  ArrowRightLeft,
  Heart,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import useTranslate from "../../hooks/useTranslate";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import {
  GET_MY_PLAYER_PROFILE,
  GET_ALL_PLAYERS,
} from "@/app/graphql/query/player.queries";

interface PlayerData {
  id: string;
  first_name: string;
  last_name: string;
  profile_image_url?: string;
  nationality?: string;
  date_of_birth?: string;
  age?: number;
  average_rating?: number;
  trust_level?: string;
  email_address?: string;
  phone?: string;
  country?: string;
  city?: string;
}

interface ClubData {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  logo_url?: string;
  cover_url?: string;
  rating?: number;
  description?: string;
  members_count?: number;
}

interface Member {
  name: string;
  img: string;
  id: string;
}

export default function ClubProfile() {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [swiperReady, setSwiperReady] = useState(false);
  const [clubData, setClubData] = useState<ClubData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setSwiperReady(true);
    fetchClubData();
    fetchMembers();
  }, []);

  const fetchClubData = async () => {
    try {
      const result = await fetchGraphQL<{ myPlayerProfile: PlayerData }>(
        GET_MY_PLAYER_PROFILE,
      );
      if (result.data?.myPlayerProfile) {
        const player = result.data.myPlayerProfile;
        setClubData({
          id: player.id,
          name: `${player.first_name} ${player.last_name}`,
          email: player.email_address || "email@gmail.com",
          phone: player.phone || "+966 123456",
          country: player.country || "Saudi Arabia",
          city: player.city || "",
          logo_url: player.profile_image_url,
          rating: player.average_rating || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching club data:", error);
    }
  };

  const fetchMembers = async () => {
    try {
      const result = await fetchGraphQL<{
        getAllPlayers: { data: PlayerData[]; total: number };
      }>(GET_ALL_PLAYERS, { skip: 0, take: 20 });
      if (result.data?.getAllPlayers?.data) {
        const formattedMembers = result.data.getAllPlayers.data.map(
          (player) => ({
            name: `${player.first_name} ${player.last_name}`,
            img: player.profile_image_url || "/b2.jpg",
            id: player.id,
          }),
        );
        setMembers(formattedMembers);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      setMembers([
        { name: "Ronald Richards", img: "/b2.jpg", id: "1" },
        { name: "John Doe", img: "/b2.jpg", id: "2" },
        { name: "Jane Smith", img: "/b2.jpg", id: "3" },
        { name: "Mike Johnson", img: "/b2.jpg", id: "4" },
        { name: "Sarah Williams", img: "/b2.jpg", id: "5" },
        { name: "David Brown", img: "/b2.jpg", id: "6" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const getFullImageUrl = (url?: string) => {
    if (!url) return "/Club.jpg";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  const menuButtons = [
    {
      label: t("Requests"),
      icon: <LayoutGrid size={18} />,
      path: "/profile/requests",
    },
    {
      label: t("Deals"),
      icon: <FileText size={18} />,
      path: "/profile/deals",
    },
    {
      label: t("My Transfers"),
      icon: <ArrowRightLeft size={18} />,
      path: "/profile/transfers",
    },
    {
      label: t("My Contract"),
      icon: <FileText size={18} />,
      path: "/profile/mycontract",
    },
    {
      label: t("Share AD"),
      icon: <Share2 size={18} />,
      path: "/profile/share",
    },
    {
      label: t("Participation Event"),
      icon: <Users size={18} />,
      path: "/profile/participationevent",
    },
    {
      label: t("Participation Prime"),
      icon: <Trophy size={18} />,
      path: "/profile/participationprime",
    },
    {
      label: t("Favorite Players"),
      icon: <Heart size={18} className="text-red-500" />,
      path: "/profile/favouritePlayers",
    },
    {
      label: t("Logout"),
      icon: <LogOut size={18} />,
      color: "text-red-600",
      action: () => setShowLogoutModal(true),
    },
  ];

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition
        ${
          theme === "dark" ? "bg-[#020617] text-white" : "bg-white text-black"
        }`}
      >
        <div className="text-yellow-400">{t("Loading...")}</div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex justify-center py-30 px-4 transition
      ${theme === "dark" ? "bg-[#020617] text-white" : "bg-white text-black"}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl w-full"
      >
        {/* ===== Logout Modal ===== */}
        <AnimatePresence>
          {showLogoutModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            >
              <motion.div
                initial={{ scale: 0.8, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 40 }}
                transition={{ duration: 0.3 }}
                className={`relative w-[90%] max-w-sm p-6 rounded-xl text-center
                ${theme === "dark" ? "bg-[#050B18]" : "bg-white"}`}
              >
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="absolute top-3 right-3"
                >
                  <X />
                </button>

                <h2 className="text-xl font-bold mb-3">{t("Logout")}</h2>
                <p className="text-gray-400 mb-5">
                  {t("Are you sure you want to logout?")}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className={`flex-1 py-2 rounded-md transition
                    ${
                      theme === "dark"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    {t("Cancel")}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-2 bg-red-600 text-white rounded-md hover:scale-105 transition"
                  >
                    {t("Logout")}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== Header ===== */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative w-[320px] h-[320px] rounded-lg overflow-hidden"
          >
            <Image
              src={getFullImageUrl(clubData?.logo_url)}
              fill
              alt="club"
              className="object-cover"
            />
          </motion.div>

          <div className="flex-1 space-y-3">
            <h1 className="text-3xl font-bold">
              {clubData?.name || "RONALD CLUB"}
            </h1>

            {/* 7 Stars Rating */}
            <div className="flex text-yellow-400">
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Star
                    size={20}
                    fill={i < (clubData?.rating || 0) ? "currentColor" : "none"}
                    className={
                      i < (clubData?.rating || 0)
                        ? "text-yellow-400"
                        : "text-gray-400"
                    }
                  />
                </motion.div>
              ))}
            </div>

            {/* Info */}
            <div className="text-gray-400 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                {clubData?.country || t("Saudi Arabia")}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <span className="flex items-center gap-1">
                  <Mail size={14} /> {clubData?.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={14} /> {clubData?.phone}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Edit Button ===== */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => router.push("/profile")}
          className={`w-full py-3 mb-6 rounded-md transition border-x-3 border-[#F0B100]
          ${
            theme === "dark" ? "bg-[#0B1739] text-white" : "bg-white text-black"
          }`}
        >
          {t("Edit Profile")}
        </motion.button>

        {/* ===== Menu ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {menuButtons.map((btn, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (btn.path) router.push(btn.path);
                if (btn.action) btn.action();
              }}
              className={`flex justify-between items-center border-x-3 border-[#F0B100] p-3 rounded-md transition
              ${
                theme === "dark"
                  ? "bg-[#0B1739] text-white"
                  : "bg-gray-100 text-black"
              }`}
            >
              <span className="text-sm">{btn.label}</span>
              <span className={btn.color || "text-yellow-400"}>{btn.icon}</span>
            </motion.button>
          ))}
        </div>

        {/* ===== Members Slider ===== */}
        <div className="relative px-10">
          {swiperReady && members.length > 0 && (
            <Swiper
              modules={[Navigation]}
              navigation={{
                prevEl: prevRef.current,
                nextEl: nextRef.current,
              }}
              spaceBetween={15}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="overflow-visible"
            >
              {members.map((m) => (
                <SwiperSlide key={m.id}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer
                    ${
                      theme === "dark"
                        ? "bg-[#051139] border-gray-700 hover:border-yellow-400"
                        : "bg-white shadow border-gray-200 hover:border-yellow-400"
                    }`}
                    onClick={() => router.push(`/players/${m.id}`)}
                  >
                    <div className="w-12 h-12 relative rounded-full overflow-hidden">
                      <Image
                        src={getFullImageUrl(m.img)}
                        fill
                        alt="member"
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm font-medium">{m.name}</p>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          {/* Navigation Buttons */}
          <button
            ref={prevRef}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 rounded-full p-2 transition"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>

          <button
            ref={nextRef}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 rounded-full p-2 transition"
          >
            <ChevronRight size={24} className="text-white" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
