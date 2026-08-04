"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Pencil,
  Users,
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Award,
  Heart,
  Send,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useTheme } from "../context/ThemeContext";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import useTranslate from "../hooks/useTranslate";

import "swiper/css";
import "swiper/css/navigation";
import { MY_SCOUT_PROFILE } from "../graphql/query/scout.queries";
import { GET_ALL_PLAYERS } from "../graphql/query/player.queries";
import { LogoutButton } from "../components/LogoutButton";

interface ScoutProfileData {
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

interface MenuButton {
  label: string;
  icon: React.ReactNode;
  path?: string;
  color?: string;
  action?: () => void;
}

export default function ScoutProfilePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const [scoutData, setScoutData] = useState<ScoutProfileData | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState<boolean>(false);

  const isDark = theme === "dark";
  const isRTL = lang === "ar";

  useEffect(() => {
    fetchScoutData();
    fetchPlayers();
  }, []);

  const fetchScoutData = async () => {
    try {
      const result = await fetchGraphQL<{ myScoutProfile: ScoutProfileData }>(
        MY_SCOUT_PROFILE,
      );
      if (result.data?.myScoutProfile) {
        setScoutData(result.data.myScoutProfile);
        setHasProfile(true);
      } else {
        setHasProfile(false);
        setScoutData(null);
      }
    } catch (error) {
      console.error("Failed to fetch scout profile:", error);
      setHasProfile(false);
      setScoutData(null);
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
      } else {
        setPlayers([]);
      }
    } catch (error) {
      console.error("Failed to fetch players:", error);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const getFullImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  const menuButtons: MenuButton[] = [
    {
      label: t("Requests"),
      icon: <ClipboardList size={18} />,
      path: "/scout/profile/requests",
    },
    {
      label: t("Share AD"),
      icon: <Send size={18} />,
      path: "/scout/profile/share",
    },
    {
      label: t("My Players"),
      icon: <Users size={18} />,
      path: "/scout/profile/my-players",
    },
    {
      label: t("My Contract"),
      icon: <FileText size={18} />,
      path: "/scout/profile/mycontract",
    },
    {
      label: t("Participation Prime"),
      icon: <Award size={18} />,
      path: "/scout/profile/participationprime",
    },
    {
      label: t("favoritePlayers"),
      icon: <Heart size={18} className="text-red-500" />,
      path: "/scout/profile/favouritePlayers",
    },
  ];

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-[#020617]" : "bg-gray-100"
        }`}
      >
        <div className="text-yellow-400 animate-pulse">{t("Loading...")}</div>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center transition
        ${isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-black"}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="text-center max-w-md px-6">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-yellow-400/20 flex items-center justify-center">
            <Users size={48} className="text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">
            {t("Complete Your Profile")}
          </h2>
          <p className={`mb-8 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {t("Please complete your profile information to continue")}
          </p>
          <button
            onClick={() => router.push("/scout/profile")}
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
      className={`min-h-screen font-sans py-40 px-4 sm:px-6 md:p-10 flex justify-center relative transition
      ${isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-black"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-6xl w-full py-16 sm:py-20">
        <div
          className={`flex flex-col md:flex-row gap-6 items-center md:items-start mb-6 ${
            isRTL ? "md:flex-row" : ""
          }`}
        >
          <div
            className={`relative w-full max-w-[280px] sm:max-w-[320px] md:w-[350px] aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 ${
              isRTL ? "order-1" : "order-1"
            }`}
          >
            {scoutData?.profile_image_url ? (
              <Image
                src={getFullImageUrl(scoutData.profile_image_url)}
                fill
                alt={`${scoutData.first_name} ${scoutData.last_name}`}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Users size={64} className="text-gray-400" />
              </div>
            )}
          </div>

          <div
            className={`flex-1 text-center md:text-left space-y-3 ${
              isRTL ? "md:text-right order-2" : "md:text-left order-2"
            }`}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              {scoutData?.first_name} {scoutData?.last_name}
            </h1>

            <div
              className={`text-sm ${
                isDark ? "text-gray-300" : "text-gray-700"
              } space-y-2`}
            >
              {(scoutData?.country || scoutData?.city) && (
                <div
                  className={`flex items-center justify-center md:justify-start gap-2 ${
                    isRTL ? "md:justify-start" : "md:justify-start"
                  }`}
                >
                  <MapPin size={14} />
                  {[scoutData?.country, scoutData?.city]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}

              <div
                className={`flex flex-col sm:flex-row gap-2 sm:gap-6 items-center ${
                  isRTL ? "md:items-start" : "md:items-start"
                }`}
              >
                {scoutData?.email_address && (
                  <span className="flex items-center gap-1">
                    <Mail size={14} /> {scoutData.email_address}
                  </span>
                )}
                {scoutData?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={14} /> {scoutData.phone}
                  </span>
                )}
              </div>
            </div>

            {scoutData?.bio && (
              <p
                className={`text-sm mt-2 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {scoutData.bio}
              </p>
            )}

            {/* Verification Status Badge */}
            <div
              className={`flex justify-center md:justify-start mt-2 ${
                isRTL ? "md:justify-start" : "md:justify-start"
              }`}
            >
              {scoutData?.is_verified ? (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-xs">
                  <CheckCircle size={12} />
                  {t("Verified Scout")}
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

        {/* Edit Profile Button with border-x-3 */}
        <button
          onClick={() => router.push("/scout/profile")}
          className={`w-full py-2.5 rounded-md mb-6 transition flex items-center justify-center gap-2 border-x-3 border-[#F0B100]
            ${
              isDark
                ? "bg-[#0A1A44] text-white hover:bg-[#132a66]"
                : "bg-yellow-300 text-black hover:bg-yellow-400"
            }`}
        >
          <Pencil size={18} />
          {t("Edit Profile")}
        </button>

        {/* Menu Buttons with border-x-3 and RTL support */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {menuButtons.map((btn, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (btn.path) router.push(btn.path);
                if (btn.action) btn.action();
              }}
              className={`p-3 rounded-md flex items-center transition border-x-3 border-[#F0B100]
                ${isDark ? "bg-[#051139]" : "bg-white shadow"} ${
                isRTL ? "flex-row-reverse justify-between" : "justify-between"
              }`}
            >
              <span className={`text-sm ${isRTL ? "order-2" : "order-1"}`}>
                {btn.label}
              </span>
              <span
                className={`${isRTL ? "order-1" : "order-2"} ${
                  btn.color || (isDark ? "text-yellow-400" : "text-yellow-600")
                }`}
              >
                {btn.icon}
              </span>
            </button>
          ))}

          {/* Logout Button */}
          <LogoutButton variant="default" />
        </div>

        {players.length > 0 && (
          <div className="relative mt-10">
            <h2
              className={`text-xl font-bold mb-4 ${
                isDark ? "text-white" : "text-gray-800"
              } ${isRTL ? "text-right" : "text-left"}`}
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
                    <div className="w-12 h-12 relative rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700">
                      {player.profile_image_url ? (
                        <Image
                          src={getFullImageUrl(player.profile_image_url)}
                          fill
                          alt={`${player.first_name} ${player.last_name}`}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users size={20} className="text-gray-500" />
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
