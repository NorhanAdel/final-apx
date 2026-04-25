"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Pencil,
  Mail,
  Phone,
  MapPin,
  User,
  Globe,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Heart,
  Video,
} from "lucide-react";
import { GET_MY_USER_PROFILE } from "@/app/graphql/query/user.queries";
import { LogoutButton } from "@/app/components/LogoutButton";
import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";

interface UserProfileData {
  id: string;
  first_name: string;
  last_name: string;
  bio?: string;
  email_address: string;
  phone?: string;
  country?: string;
  city?: string;
  nationality?: string;
  birth_date?: string;
  profile_image_url?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState<boolean>(false);

  const isDark = theme === "dark";

  useEffect(() => {
    fetchUserData();
  }, [lang]);

  const fetchUserData = async () => {
    try {
      const result = await fetchGraphQL<{ myUserProfile: UserProfileData }>(
        GET_MY_USER_PROFILE,
      );
      if (result.data?.myUserProfile) {
        const user = result.data.myUserProfile;
        // Check if user has completed their profile (has first_name and last_name)
        if (user.first_name && user.last_name) {
          setUserData(user);
          setHasProfile(true);
        } else {
          setHasProfile(false);
          setUserData(null);
        }
      } else {
        setHasProfile(false);
        setUserData(null);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      setHasProfile(false);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const getFullImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(
        lang === "ar"
          ? "ar-EG"
          : lang === "pt"
          ? "pt-PT"
          : lang === "zh"
          ? "zh-CN"
          : "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      );
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-[#020617]" : "bg-gray-100"
        }`}
      >
        <Loader2 size={40} className="animate-spin text-yellow-500" />
      </div>
    );
  }

  // If no profile exists, show message to complete registration
  if (!hasProfile) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center transition
        ${isDark ? "bg-[#020617] text-white" : "bg-white text-black"}`}
      >
        <div className="text-center max-w-md px-6">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-yellow-400/20 flex items-center justify-center">
            <User size={48} className="text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">
            {t("Complete Your Profile")}
          </h2>
          <p className="text-gray-500 mb-8">
            {t("Please complete your profile information to continue")}
          </p>
          <button
            onClick={() => router.push("/user/profile")}
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
    >
      <div className="max-w-6xl w-full py-16 sm:py-20">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-6">
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:w-[350px] aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
            {userData?.profile_image_url ? (
              <Image
                src={getFullImageUrl(userData.profile_image_url)}
                fill
                alt={`${userData.first_name} ${userData.last_name}`}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={64} className="text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              {userData?.first_name} {userData?.last_name}
            </h1>

            <div
              className={`text-sm ${
                isDark ? "text-gray-300" : "text-gray-700"
              } space-y-2`}
            >
              {(userData?.country || userData?.city) && (
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <MapPin size={14} />
                  {[userData?.country, userData?.city]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}

              {userData?.nationality && (
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Globe size={14} />
                  {userData.nationality}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center md:items-start">
                <span className="flex items-center gap-1">
                  <Mail size={14} /> {userData?.email_address}
                </span>
                {userData?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={14} /> {userData.phone}
                  </span>
                )}
              </div>

              {userData?.birth_date && (
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Calendar size={14} />
                  {formatDate(userData.birth_date)}
                </div>
              )}
            </div>

            {userData?.bio && (
              <p
                className={`text-sm mt-2 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {userData.bio}
              </p>
            )}

            <div className="flex justify-center md:justify-start mt-2">
              {userData?.is_verified ? (
                <span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle size={12} />
                  {t("Verified User")}
                </span>
              ) : (
                <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <AlertCircle size={12} />
                  {t("Pending Verification")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Button with border-x-3 */}
        <button
          onClick={() => router.push("/user/personal-information")}
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

        {/* Menu Buttons with border-x-3 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          <button
            onClick={() => router.push("/user/favourite-players")}
            className={`p-3 rounded-md flex justify-between items-center transition border-x-3 border-[#F0B100]
              ${
                isDark
                  ? "bg-[#051139] hover:bg-[#0A1A44]"
                  : "bg-white shadow hover:bg-gray-50"
              }`}
          >
            <span className="text-sm">{t("favoritePlayers")}</span>
            <Heart size={18} className="text-red-500" />
          </button>

          <button
            onClick={() => router.push("/user/favourite-reels")}
            className={`p-3 rounded-md flex justify-between items-center transition border-x-3 border-[#F0B100]
              ${
                isDark
                  ? "bg-[#051139] hover:bg-[#0A1A44]"
                  : "bg-white shadow hover:bg-gray-50"
              }`}
          >
            <span className="text-sm">{t("favoriteReels")}</span>
            <Video size={18} className="text-yellow-400" />
          </button>

          <LogoutButton variant="default" redirectTo="/" />
        </div>
      </div>
    </div>
  );
}
