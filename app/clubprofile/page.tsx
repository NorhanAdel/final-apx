"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Star,
  FileText,
  ArrowLeftRight,
  Megaphone,
  Calendar,
  UserCheck,
  Award,
  Users,
  Trophy,
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  Handshake,
  Eye,
  Heart,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useTheme } from "../context/ThemeContext";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import { GET_MY_CLUB_PROFILE } from "@/app/graphql/query/club.queries";
import { GET_ALL_PLAYERS } from "@/app/graphql/query/player.queries";
import useTranslate from "../hooks/useTranslate";

import "swiper/css";
import "swiper/css/navigation";

interface ClubProfileData {
  id: string;
  club_name: string;
  email_address: string;
  phone: string;
  country: string;
  city: string;
  bio: string;
  logo_url: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface MyClubProfileResponse {
  myClubProfile: ClubProfileData;
}

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  profile_image_url: string;
  nationality: string;
  date_of_birth: string;
  age: number;
  average_rating: number;
  trust_level: string;
}

interface GetAllPlayersResponse {
  getAllPlayers: {
    data: Player[];
    total: number;
  };
}

export default function ClubProfile() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useTranslate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [clubData, setClubData] = useState<ClubProfileData | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const isDark = theme === "dark";

  useEffect(() => {
    fetchClubData();
    fetchPlayers();
  }, []);

  const fetchClubData = async () => {
    try {
      const result = await fetchGraphQL<MyClubProfileResponse>(
        GET_MY_CLUB_PROFILE,
      );
      if (result.data?.myClubProfile) {
        setClubData(result.data.myClubProfile);
      }
    } catch (error) {
      console.error("Failed to fetch club profile:", error);
    }
  };

  const fetchPlayers = async () => {
    try {
      const result = await fetchGraphQL<GetAllPlayersResponse>(
        GET_ALL_PLAYERS,
        { skip: 0, take: 10 },
      );
      if (result.data?.getAllPlayers?.data) {
        setPlayers(result.data.getAllPlayers.data);
      }
    } catch (error) {
      console.error("Failed to fetch players:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFullImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  const menuButtons = [
    {
      label: t("Requests"),
      icon: <Handshake size={18} />,
      path: "/clubprofile/sent-request",
    },
    {
      label: t("Deals"),
      icon: <FileText size={18} />,
      path: "/clubprofile/deals",
    },
    {
      label: t("Transfers"),
      icon: <ArrowLeftRight size={18} />,
      path: "/clubprofile/transfers",
    },
    {
      label: t("Share AD"),
      icon: <Megaphone size={18} />,
      path: "/clubprofile/shareAd",
    },
    {
      label: t("Events"),
      icon: <Calendar size={18} />,
      path: "/clubprofile/events",
    },
    {
      label: t("My Players"),
      icon: <UserCheck size={18} />,
      path: "/clubprofile/my-players",
    },
    {
      label: t("My Scouts"),
      icon: <Eye size={18} />,
      path: "/clubprofile/my-scouts",
    },
    {
      label: t("Participation Prime"),
      icon: <Award size={18} />,
      path: "/clubprofile/participationprime",
    },
    {
      label: t("Favorite Players"),
      icon: <Heart size={18} className="text-red-500" />,
      path: "/clubprofile/favouritePlayers",
    },
    {
      label: t("Logout"),
      icon: <LogOut size={18} />,
      color: "text-red-600",
      action: () => setShowLogoutModal(true),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-[#020617]" : "bg-gray-100"
        }`}
      >
        <div className="text-yellow-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen font-sans py-35 px-4 sm:px-6 sm:py-25 md:p-10 flex justify-center relative transition
      ${isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-black"}`}
    >
      {showLogoutModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className={`w-full max-w-sm sm:max-w-md rounded-xl p-6 sm:p-8 relative text-center
            ${isDark ? "bg-[#050B18]" : "bg-white"}`}
          >
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-3 right-3 text-gray-400"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              {t("Logout")}
            </h2>

            <p
              className={`${
                isDark ? "text-gray-400" : "text-gray-600"
              } mb-6 text-sm sm:text-base`}
            >
              {t("Are you sure you want to logout?")}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className={`${
                  isDark ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
                } flex-1 py-2 rounded-md`}
              >
                {t("Cancel")}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2 bg-red-600 text-white rounded-md"
              >
                {t("Logout")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl w-full py-16 sm:py-20">
        {/* Club Info */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-6">
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:w-[350px] aspect-square rounded-lg overflow-hidden">
            {clubData?.logo_url ? (
              <Image
                src={getFullImageUrl(clubData.logo_url)}
                fill
                alt={clubData.club_name || "Club Logo"}
                className="object-cover"
              />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center ${
                  isDark ? "bg-[#0a0f2c]" : "bg-gray-200"
                }`}
              >
                <Trophy size={64} className="text-yellow-400" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              {clubData?.club_name || "Club Name"}
            </h1>

            <div className="flex justify-center md:justify-start text-[#FFD700]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="currentColor" />
              ))}
            </div>

            <div
              className={`text-sm ${
                isDark ? "text-gray-300" : "text-gray-700"
              } space-y-2`}
            >
              <div className="flex items-center justify-center md:justify-start gap-2">
                <MapPin size={14} />
                {clubData?.country || "Country"}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center md:items-start">
                <span className="flex items-center gap-1">
                  <Mail size={14} />{" "}
                  {clubData?.email_address || "email@example.com"}
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={14} /> {clubData?.phone || "+123456789"}
                </span>
              </div>
            </div>

            {clubData?.bio && (
              <p
                className={`text-sm mt-2 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {clubData.bio}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => router.push("/clubprofile/profile")}
          className={`w-full py-2.5 rounded-md mb-6 transition
            ${
              isDark
                ? "bg-[#0A1A44] text-white hover:bg-[#132a66]"
                : "bg-yellow-300 text-black hover:bg-yellow-400"
            }`}
        >
          {t("Edit Profile")}
        </button>

        {/* Menu Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {menuButtons.map((btn, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (btn.path) router.push(btn.path);
                if (btn.action) btn.action();
              }}
              className={`p-3 rounded-md flex justify-between items-center transition
                ${isDark ? "bg-[#051139]" : "bg-white shadow"}`}
            >
              <span className="text-sm">{btn.label}</span>
              <span
                className={
                  btn.color || (isDark ? "text-yellow-400" : "text-yellow-600")
                }
              >
                {btn.icon}
              </span>
            </button>
          ))}
        </div>

        {/* Players Swiper */}
        {players.length > 0 && (
          <div className="relative mt-10">
            <h2
              className={`text-xl font-bold mb-4 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              {t("Players")}
            </h2>
            <Swiper
              modules={[Navigation]}
              navigation={{
                nextEl: ".nextBtn",
                prevEl: ".prevBtn",
              }}
              spaceBetween={15}
              breakpoints={{
                0: { slidesPerView: 1.2 },
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {players.map((player) => (
                <SwiperSlide key={player.id}>
                  <div
                    className={`p-4 rounded-xl flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform
                    ${isDark ? "bg-[#051139]" : "bg-white shadow"}`}
                    onClick={() => router.push(`/player/${player.id}`)}
                  >
                    <div className="w-12 h-12 relative rounded-full overflow-hidden">
                      {player.profile_image_url ? (
                        <Image
                          src={getFullImageUrl(player.profile_image_url)}
                          fill
                          alt={`${player.first_name} ${player.last_name}`}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-500 flex items-center justify-center">
                          <Users size={20} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {player.first_name} {player.last_name}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star
                          size={12}
                          className="text-yellow-400 fill-yellow-400"
                        />
                        <span className="text-xs text-gray-500">
                          {player.average_rating?.toFixed(1) || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <button className="prevBtn hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-full p-2">
              <ChevronLeft size={24} className="text-white" />
            </button>

            <button className="nextBtn hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-full p-2">
              <ChevronRight size={24} className="text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
