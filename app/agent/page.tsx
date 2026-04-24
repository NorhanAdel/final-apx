"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Pencil,
  Users,
  LogOut,
  Share2,
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Handshake,
  Award,
  Heart,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useTheme } from "../context/ThemeContext";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import { GET_MY_AGENT_PROFILE } from "@/app/graphql/query/agent.queries";
import { GET_ALL_PLAYERS } from "@/app/graphql/query/player.queries";
import useTranslate from "../hooks/useTranslate";

import "swiper/css";
import "swiper/css/navigation";

interface AgentProfileData {
  id: string;
  first_name: string;
  last_name: string;
  bio: string;
  country: string;
  city: string;
  nationality: string;
  email_address: string;
  phone: string;
  birth_date: string;
  profile_image_url: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  profile_image_url: string;
  nationality: string;
  date_of_birth: string;
  age: number;
}

interface GetAllPlayersResponse {
  getAllPlayers: {
    data: Player[];
    total: number;
  };
}

export default function AgentProfile() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useTranslate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [agentData, setAgentData] = useState<AgentProfileData | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const isDark = theme === "dark";

  useEffect(() => {
    fetchAgentData();
    fetchPlayers();
  }, []);

  const fetchAgentData = async () => {
    try {
      const result = await fetchGraphQL<{ myAgentProfile: AgentProfileData }>(
        GET_MY_AGENT_PROFILE,
      );
      if (result.data?.myAgentProfile) {
        setAgentData(result.data.myAgentProfile);
      }
    } catch (error) {
      console.error("Failed to fetch agent profile:", error);
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
      path: "/agent/requests",
    },
    {
      label: t("Share AD"),
      icon: <Share2 size={18} />,
      path: "/agent/shareAd",
    },
    {
      label: t("My Players"),
      icon: <Users size={18} />,
      path: "/agent/my-players",
    },
    {
      label: t("Participation Prime"),
      icon: <Award size={18} />,
      path: "/agent/participationprime",
    },
    {
      label: t("Favorite Players"),
      icon: <Heart size={18} className="text-red-500" />,
      path: "/agent/favouritePlayers",
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
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-6">
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:w-[350px] aspect-square rounded-lg overflow-hidden">
            {agentData?.profile_image_url ? (
              <Image
                src={getFullImageUrl(agentData.profile_image_url)}
                fill
                alt={`${agentData.first_name} ${agentData.last_name}`}
                className="object-cover"
              />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center ${
                  isDark ? "bg-[#0a0f2c]" : "bg-gray-200"
                }`}
              >
                <Users size={64} className="text-yellow-400" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              {agentData?.first_name} {agentData?.last_name}
            </h1>

            {/* تم إزالة النجوم من هنا */}

            <div
              className={`text-sm ${
                isDark ? "text-gray-300" : "text-gray-700"
              } space-y-2`}
            >
              <div className="flex items-center justify-center md:justify-start gap-2">
                <MapPin size={14} />
                {agentData?.country || "Country"}, {agentData?.city || "City"}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center md:items-start">
                <span className="flex items-center gap-1">
                  <Mail size={14} />{" "}
                  {agentData?.email_address || "email@example.com"}
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={14} /> {agentData?.phone || "+123456789"}
                </span>
              </div>
            </div>

            {agentData?.bio && (
              <p
                className={`text-sm mt-2 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {agentData.bio}
              </p>
            )}

            {agentData?.is_verified && (
              <div className="flex justify-center md:justify-start mt-2">
                <span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full">
                  {t("Verified Agent")}
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => router.push("/agent/profile")}
          className={`w-full py-2.5 rounded-md mb-6 transition flex items-center justify-center gap-2
            ${
              isDark
                ? "bg-[#0A1A44] text-white hover:bg-[#132a66]"
                : "bg-yellow-300 text-black hover:bg-yellow-400"
            }`}
        >
          <Pencil size={18} />
          {t("Edit Profile")}
        </button>

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
                    onClick={() => router.push(`/players/${player.id}`)}
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
