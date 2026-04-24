"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Star,
  Pencil,
  LayoutGrid,
  Users,
  Trophy,
  LogOut,
  Share2,
  Mail,
  Phone,
  MapPin,
  X,
  UserPlus,
  Heart,
  Award,
  ClipboardList,
  Send,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

const T: any = {
  en: {
    scout: "Scout",
    edit: "Edit Profile",
    logout: "Logout",
    cancel: "Cancel",
    sure: "Are you sure?",
    loading: "Loading...",
    requests: "Requests",
    share: "Share AD",
    fav: "Favourite Players",
    prime: "Participation Prime",
  },
  ar: {
    scout: "كشاف",
    edit: "تعديل الملف الشخصي",
    logout: "تسجيل الخروج",
    cancel: "إلغاء",
    sure: "هل أنت متأكد؟",
    loading: "جاري التحميل...",
    requests: "الطلبات",
    share: "مشاركة إعلان",
    fav: "اللاعبين المفضلين",
    prime: "المشاركة المميزة",
  },
  pt: {
    scout: "Olheiro",
    edit: "Editar Perfil",
    logout: "Sair",
    cancel: "Cancelar",
    sure: "Tem certeza?",
    loading: "Carregando...",
    requests: "Pedidos",
    share: "Compartilhar anúncio",
    fav: "Jogadores favoritos",
    prime: "Participação Prime",
  },
  zh: {
    scout: "球探",
    edit: "编辑资料",
    logout: "退出",
    cancel: "取消",
    sure: "你确定吗？",
    loading: "加载中...",
    requests: "请求",
    share: "分享广告",
    fav: "收藏球员",
    prime: "高级参与",
  },
};

export default function ClubProfile() {
  const router = useRouter();
  const { theme } = useTheme();
  const { lang } = useTranslate();

  const t = T[lang] || T.en;

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/graphql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: `query { myScoutProfile { id first_name last_name country phone email_address profile_image_url } }`,
          }),
        });

        const json = await res.json();
        setProfile(json?.data?.myScoutProfile || null);
      } catch {
        setProfile(null);
      }

      setLoading(false);
    };

    load();
  }, []);

  const dark = {
    bg: "bg-[#020617] text-white",
    btn: "bg-[#0A1A44] hover:bg-[#102B70] transition",
    menu: "bg-[#051139] hover:bg-[#0A1A44] border border-blue-900/30 transition",
    icon: "text-yellow-400",
  };

  const light = {
    bg: "bg-gray-100 text-black",
    btn: "bg-blue-600 hover:bg-blue-700 transition",
    menu: "bg-white hover:bg-gray-200 border border-gray-300 transition",
    icon: "text-yellow-500",
  };

  const th = theme === "dark" ? dark : light;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${th.bg}`}>
        {t.loading}
      </div>
    );
  }

  const imageUrl =
    profile?.profile_image_url?.trim()
      ? profile.profile_image_url.startsWith("http")
        ? profile.profile_image_url
        : `${API_URL}${profile.profile_image_url}`
      : "/Club.jpg";

  return (
    <div className={`min-h-screen md:p-10 flex justify-center relative ${th.bg}`}>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-white text-black p-6 rounded-xl w-96 relative text-center">

            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-3 right-3"
            >
              <X />
            </button>

            <h2 className="text-2xl font-bold mb-4">{t.logout}</h2>
            <p className="mb-6">{t.sure}</p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-gray-300 py-2 rounded"
              >
                {t.cancel}
              </button>

              <button className="flex-1 bg-red-600 text-white py-2 rounded">
                {t.logout}
              </button>
            </div>

          </div>
        </div>
      )}

      <div className="max-w-6xl py-30 w-full">

        <div className="flex flex-col md:flex-row gap-8 mb-6">

          <div className="relative w-full md:w-[400px] aspect-square rounded-md overflow-hidden border border-blue-900/40">
            <Image src={imageUrl} fill alt="profile" className="object-cover" unoptimized />
          </div>

          <div className="flex-1 space-y-4 pt-4">

            <h1 className="text-4xl font-black uppercase italic">
              {profile?.first_name} {profile?.last_name}
            </h1>

            <div className="flex gap-1 text-yellow-400">
              {[...Array(7)].map((_, i) => (
                <Star key={i} size={20} fill="currentColor" />
              ))}
            </div>

            <div className="space-y-2 text-sm">

              <div className="flex items-center gap-2">
                <Trophy size={16} className={th.icon} />
                <span className="bg-yellow-400 text-black px-2 text-xs font-bold rounded">
                  {t.scout}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={16} className={th.icon} />
                {profile?.country}
              </div>

              <div className="flex items-center gap-2">
                <Mail size={16} className={th.icon} />
                {profile?.email_address}
              </div>

              <div className="flex items-center gap-2">
                <Phone size={16} className={th.icon} />
                {profile?.phone}
              </div>

            </div>
          </div>
        </div>

        <button
          onClick={() => router.push("/scout/profile")}
          className={`w-full ${th.btn} py-3 rounded-md font-black uppercase mb-6 flex justify-center items-center gap-2 text-white`}
        >
          {t.edit} <Pencil size={18} />
        </button>

        <div className="grid md:grid-cols-2 gap-3 mb-12">

          <button
            onClick={() => router.push("/scout/profile/requests")}
            className={`${th.menu} p-4 flex justify-between rounded-lg`}
          >
            <span className="font-bold uppercase text-sm flex items-center gap-2">
              <ClipboardList size={18} /> {t.requests}
            </span>
          </button>

          <button
            onClick={() => router.push("/scout/profile/share")}
            className={`${th.menu} p-4 flex justify-between rounded-lg`}
          >
            <span className="font-bold uppercase text-sm flex items-center gap-2">
              <Send size={18} /> {t.share}
            </span>
          </button>

          <button
            onClick={() => router.push("/scout/profile/favouritePlayers")}
            className={`${th.menu} p-4 flex justify-between rounded-lg`}
          >
            <span className="font-bold uppercase text-sm flex items-center gap-2">
              <Heart size={18} /> {t.fav}
            </span>
          </button>

          <button
            onClick={() => router.push("/ParticipationPrime")}
            className={`${th.menu} p-4 flex justify-between rounded-lg`}
          >
            <span className="font-bold uppercase text-sm flex items-center gap-2">
              <Award size={18} /> {t.prime}
            </span>
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className={`${th.menu} p-4 flex justify-between rounded-lg`}
          >
            <span className="font-bold uppercase text-sm flex items-center gap-2 text-red-500">
              <LogOut size={18} /> {t.logout}
            </span>
          </button>

        </div>

      </div>
    </div>
  );
}