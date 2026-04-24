"use client";

import {
  User,
  LayoutGrid,
  ChevronLeft,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useTheme } from "../../../context/ThemeContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

/* ================= TRANSLATION ================= */

const T: any = {
  en: {
    title: "Club Career",
    current: "Current Club",
    previous: "Previous Clubs (comma separated)",
    previousBtn: "Previous",
    submit: "Submit",
    update: "Update",
    saved: "Saved Successfully",
    error: "Something went wrong",
    saving: "Saving...",
  },
  ar: {
    title: "المسيرة الكروية",
    current: "النادي الحالي",
    previous: "الأندية السابقة (افصل بينهم بفاصلة)",
    previousBtn: "رجوع",
    submit: "إرسال",
    update: "تحديث",
    saved: "تم الحفظ بنجاح",
    error: "حدث خطأ",
    saving: "جاري الحفظ...",
  },
  pt: {
    title: "Carreira no Clube",
    current: "Clube Atual",
    previous: "Clubes Anteriores (separados por vírgula)",
    previousBtn: "Voltar",
    submit: "Enviar",
    update: "Atualizar",
    saved: "Salvo com sucesso",
    error: "Algo deu errado",
    saving: "Salvando...",
  },
  zh: {
    title: "俱乐部生涯",
    current: "当前俱乐部",
    previous: "之前俱乐部（用逗号分隔）",
    previousBtn: "返回",
    submit: "提交",
    update: "更新",
    saved: "保存成功",
    error: "出错了",
    saving: "保存中...",
  },
};

/* ================= MUTATION ================= */

const UPSERT_SCOUT_CLUB_CAREER = `
mutation UpsertScoutClubCareer($input: CreateScoutClubCareerInput!) {
  upsertScoutClubCareer(input: $input) {
    id
  }
}
`;

/* ================= QUERY ================= */

const GET_MY_CAREER = `
query {
  myScoutClubCareer {
    id
    current_club
    previous_clubs
  }
}
`;

export default function ClubCareer() {
  const router = useRouter();
  const { theme } = useTheme();

  const lang =
    typeof window !== "undefined"
      ? localStorage.getItem("lang") || "en"
      : "en";

  const t = T[lang];

  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState(false);

  const [form, setForm] = useState({
    current_club: "",
    previous_clubs: "",
  });

  /* ================= LOAD ================= */

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ query: GET_MY_CAREER }),
      });

      const json = await res.json();
      const data = json?.data?.myScoutClubCareer;

      if (data) {
        setExists(true);
        setForm({
          current_club: data.current_club || "",
          previous_clubs: data.previous_clubs || "",
        });
      }
    };

    fetchData();
  }, []);

  /* ================= CHANGE ================= */

  const handleChange = (e: any) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const input = {
      current_club: form.current_club?.trim(),
      previous_clubs: form.previous_clubs,
    };

    const res = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        query: UPSERT_SCOUT_CLUB_CAREER,
        variables: { input },
      }),
    });

    const json = await res.json();

    if (json?.errors) {
      toast.error(json.errors[0].message || t.error);
      setLoading(false);
      return;
    }

    setExists(true);
    toast.success(exists ? t.update : t.saved);

    router.push("/scout/profile");
    setLoading(false);
  };

  return (
    <div className={`min-h-screen py-20 flex items-center justify-center
      ${theme === "dark" ? "bg-[#020617] text-white" : "bg-[#f9fafb] text-black"}`}>

      <div className="w-full max-w-4xl px-6 py-10">

        {/* TITLE */}
        <h1 className="text-center text-3xl font-black italic mb-10 uppercase text-yellow-400">
          {t.title}
        </h1>

        {/* ICONS */}
        <div className="flex items-center justify-center gap-4 mb-12">

          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0f1c3d]">
            <User size={20} />
          </div>

          <div className="w-20 h-[1px] bg-gray-500"></div>

          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-yellow-500/20 border border-yellow-500">
            <LayoutGrid className="text-yellow-500" size={16} />
          </div>

        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            name="current_club"
            value={form.current_club}
            onChange={handleChange}
            placeholder={t.current}
            className="w-full px-4 py-4 rounded-xl bg-[#0a0f1e] border border-gray-800 text-white"
          />

          <textarea
            name="previous_clubs"
            value={form.previous_clubs}
            onChange={handleChange}
            placeholder={t.previous}
            className="w-full h-32 px-4 py-4 rounded-xl bg-[#0a0f1e] border border-gray-800 text-white"
          />

          {/* BUTTONS */}
          <div className="flex justify-between mt-10">

            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 px-10 py-3 rounded-md font-bold bg-[#081f55] border-x-2 border-yellow-500"
            >
              <ChevronLeft size={18} />
              {t.previousBtn}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-14 py-3 rounded-md font-bold bg-yellow-500 text-black"
            >
              {loading ? t.saving : exists ? t.update : t.submit}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}