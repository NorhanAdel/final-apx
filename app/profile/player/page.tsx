"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Star,
  LayoutGrid,
  Users,
  Trophy,
  Share2,
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  FileText,
  ArrowRightLeft,
  Heart,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import useTranslate from "../../hooks/useTranslate";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import {
  GET_MY_PLAYER_PROFILE,
  GET_ALL_PLAYERS,
} from "@/app/graphql/query/player.queries";
import { LogoutButton } from "@/app/components/LogoutButton";

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
  is_verified?: boolean;
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
  is_verified?: boolean;
}

interface Member {
  name: string;
  img: string;
  id: string;
}

interface MenuButton {
  label: string;
  icon: React.ReactNode;
  path?: string;
  color?: string;
  action?: () => void;
}

export default function ClubProfile() {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const router = useRouter();
  const [swiperReady, setSwiperReady] = useState(false);
  const [clubData, setClubData] = useState<ClubData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
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
          email: player.email_address || "",
          phone: player.phone || "",
          country: player.country || "",
          city: player.city || "",
          logo_url: player.profile_image_url,
          rating: player.average_rating || 0,
        });
        setIsVerified(player.is_verified || false);
        setHasProfile(true);
      } else {
        setHasProfile(false);
        setClubData(null);
      }
    } catch (error) {
      console.error("Error fetching club data:", error);
      setHasProfile(false);
      setClubData(null);
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
            img: player.profile_image_url || "",
            id: player.id,
          }),
        );
        setMembers(formattedMembers);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const getFullImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  const menuButtons: MenuButton[] = [
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

  // If no profile exists, show message to complete registration
  if (!hasProfile) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center transition
        ${
          theme === "dark" ? "bg-[#020617] text-white" : "bg-white text-black"
        }`}
      >
        <div className="text-center max-w-md px-6">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-yellow-400/20 flex items-center justify-center">
            <Users size={48} className="text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">
            {t("Complete Your Profile")}
          </h2>
          <p className="text-gray-500 mb-8">
            {t("Please complete your profile information to continue")}
          </p>
          <button
            onClick={() => router.push("/profile")}
            className="px-8 py-3 bg-yellow-400 text-black font-semibold rounded-md hover:bg-yellow-500 transition"
          >
            {t("Complete Registration")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex justify-center py-40 px-4 transition
      ${theme === "dark" ? "bg-[#020617] text-white" : "bg-white text-black"}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl w-full"
      >
        {/* ===== Header ===== */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative w-[320px] h-[320px] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800"
          >
            {clubData?.logo_url ? (
              <Image
                src={getFullImageUrl(clubData.logo_url)}
                fill
                alt="club"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Users size={64} className="text-gray-400" />
              </div>
            )}
          </motion.div>

          <div className="flex-1 space-y-3">
            <h1 className="text-3xl font-bold">{clubData?.name || ""}</h1>

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
              {clubData?.country && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  {clubData.country}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                {clubData?.email && (
                  <span className="flex items-center gap-1">
                    <Mail size={14} /> {clubData.email}
                  </span>
                )}
                {clubData?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={14} /> {clubData.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Verification Status Badge */}
            <div className="flex justify-start">
              {isVerified ? (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-xs">
                  <CheckCircle size={12} />
                  {t("Verified Player")}
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-xs">
                  <AlertCircle size={12} />
                  {t("Pending Verification")}
                </span>
              )}
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

          {/* Logout Button */}
          <LogoutButton variant="default" />
        </div>

        {/* ===== Members Slider ===== */}
        {members.length > 0 && (
          <div className="relative px-10">
            {swiperReady && (
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
                      <div className="w-12 h-12 relative rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700">
                        {m.img ? (
                          <Image
                            src={getFullImageUrl(m.img)}
                            fill
                            alt="member"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users size={20} className="text-gray-500" />
                          </div>
                        )}
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
        )}
      </motion.div>
    </div>
  );
}
