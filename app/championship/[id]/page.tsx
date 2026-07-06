"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Pencil,
  Hourglass,
  ChevronDown,
  ChevronUp,
  Trophy,
} from "lucide-react";

import { toast } from "sonner";
import { useParams } from "next/navigation";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/app/context/ThemeContext"; // ✅ added

// =========================
// STATIC TRANSLATION (ONLY TEXT)
// =========================
const tDict: any = {
  ar: {
    loading: "جاري التحميل...",
    notFound: "المسابقة غير موجودة",
    yourAnswer: "إجابتك",
    submit: "إرسال الإجابة",
    submitting: "جاري الإرسال...",
    writeAnswer: "اكتب إجابتك",
    prizes: "الجوائز",
    winners: "الفائزين",
    soon: "🏆 سيتم الإعلان عن الفائزين قريباً...",
    endDate: "تاريخ الانتهاء",
  },
  en: {
    loading: "Loading...",
    notFound: "Championship Not Found",
    yourAnswer: "Your Answer",
    submit: "Submit Answer",
    submitting: "Submitting...",
    writeAnswer: "Write your answer",
    prizes: "Prizes",
    winners: "Winners",
    soon: "🏆 Winners will be announced soon...",
    endDate: "End Date",
  },
  zh: {
    loading: "加载中...",
    notFound: "比赛未找到",
    yourAnswer: "你的答案",
    submit: "提交",
    submitting: "提交中...",
    writeAnswer: "写下你的答案",
    prizes: "奖品",
    winners: "获胜者",
    soon: "🏆 即将公布获胜者...",
    endDate: "结束日期",
  },
  ru: {
    loading: "Загрузка...",
    notFound: "Чемпионат не найден",
    yourAnswer: "Ваш ответ",
    submit: "Отправить",
    submitting: "Отправка...",
    writeAnswer: "Введите ответ",
    prizes: "Призы",
    winners: "Победители",
    soon: "🏆 Скоро будут объявлены победители...",
    endDate: "Дата окончания",
  },
};

export default function CristianoChampionship() {
  const params = useParams();
  const id = params.id as string;

  const { theme } = useTheme(); 
  const isDark = theme === "dark";

  const [openPrizes, setOpenPrizes] = useState(false);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [champion, setChampion] = useState<any>(null);

  const lang =
    typeof window !== "undefined"
      ? localStorage.getItem("lang") || "ar"
      : "ar";

  const t = tDict[lang] || tDict.ar;

  const getImageUrl = (url: string | null) => {
    if (!url) return "/Chapm.png";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  const CHAMPION_QUERY = `
     query {
  champion(id: "${id}") {
    id
    title
    description
    photo_url
    winners_count
    status
    start_date
    expiry_date
    results_activated_at
    answers_count
    created_at
    updated_at

    prizes {
      id
      rank
      title
      description
    }

    winners {
      id
      rank
      user_id
      created_at

      answer {
        id
        user_id
        content
        created_at
      }

      prize {
        id
        rank
        title
        description
      }

      user {
        id
         
        username
        email
      }
    }

    my_answer {
      id
      user_id
      content
      created_at
    }
  }
}
  `;

  useEffect(() => {
    if (!id) return;

    const fetchChampion = async () => {
      try {
        setLoading(true);

        const res: any = await fetchGraphQL(CHAMPION_QUERY, {
          headers: { Accept: lang },
        });

        if (res.errors?.length) {
          toast.error(res.errors[0].message);
          return;
        }

        setChampion(res?.data?.champion);
      } catch (error) {
        toast.error("Failed to load championship");
      } finally {
        setLoading(false);
      }
    };

    fetchChampion();
  }, [id, lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!answer.trim()) {
      toast.error("Please enter your answer");
      return;
    }

    try {
      setSubmitting(true);

      const mutation = `
        mutation {
          submitChampionAnswer(
            championId: "${id}",
            content: "${answer}"
          ) {
            id
            content
            created_at
            user_id
          }
        }
      `;

      const res: any = await fetchGraphQL(mutation, {
        headers: { Accept: lang },
      });

      if (res.errors?.length) {
        toast.error(res.errors[0].message);
        return;
      }

      toast.success("Success");

      setChampion((prev: any) => ({
        ...prev,
        my_answer: res?.data?.submitChampionAnswer,
      }));

      setAnswer("");
    } catch {
      toast.error("Failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#050510] text-white" : "bg-gray-100 text-black"}`}>
        {t.loading}
      </div>
    );
  }

  if (!champion) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#050510] text-white" : "bg-gray-100 text-black"}`}>
        {t.notFound}
      </div>
    );
  }

  const hasWinners =
    champion?.results_activated_at && champion?.winners?.length > 0;

  return (
    <div
      className={`min-h-screen bg-cover bg-center flex flex-col items-center px-6 py-30 font-sans transition ${
        isDark ? "bg-[#050510]" : "bg-gray-100"
      }`}
      style={{
        backgroundImage: "url('/bgch.png')",
      }}
    >
      <h1 className="text-[#d4af37] text-2xl md:text-3xl font-black italic uppercase mb-16 mt-8 tracking-wider text-center">
        {champion.title}
      </h1>

      {/* CARD */}
      <div
        className={`relative w-full max-w-5xl rounded-2xl p-6 shadow-2xl backdrop-blur-sm transition ${
          isDark
            ? "bg-[#0a0a20]/90 border border-yellow-600/40"
            : "bg-white border border-gray-200"
        }`}
      >
        <div className="flex flex-col md:flex-row gap-6">

          <div className="w-full md:w-1/2 h-[350px] relative rounded-xl overflow-hidden border border-yellow-600/40">
            <Image
              src={getImageUrl(champion.photo_url)}
              alt={champion.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1">

            <p className={`text-lg md:text-xl font-bold italic text-center mb-8 leading-relaxed ${
              isDark ? "text-white" : "text-black"
            }`}>
              {champion.description}
            </p>

            {champion.my_answer ? (
              <div className={`rounded-xl p-5 text-center mb-6 border ${
                isDark
                  ? "bg-[#151535] border-green-600/40 text-white"
                  : "bg-green-50 border-green-300 text-black"
              }`}>
                <p className="text-green-400 font-black text-sm uppercase mb-2">
                  {t.yourAnswer}
                </p>

                <p className="font-bold">
                  {champion.my_answer.content}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder={t.writeAnswer}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className={`w-full rounded-lg py-4 px-6 mb-4 border transition ${
                    isDark
                      ? "bg-[#151535] text-white border-blue-900/30"
                      : "bg-white text-black border-gray-300"
                  }`}
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-900 to-blue-800 border border-yellow-600/50 rounded-lg py-3 text-white font-black"
                >
                  {submitting ? t.submitting : t.submit}
                </button>
              </form>
            )}

          </div>
        </div>

        <div className="mt-8 flex justify-end items-center gap-2 text-yellow-500 font-bold italic text-sm">
          <Hourglass size={16} className="animate-pulse" />
          <span>
            {t.endDate}:{" "}
            {new Date(champion.expiry_date).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* PRIZES */}
      <div className="w-full max-w-5xl mt-10">
        <button
          onClick={() => setOpenPrizes(!openPrizes)}
          className={`w-full flex justify-between items-center rounded-xl p-4 border transition ${
            isDark
              ? "bg-[#0a0a20]/80 border-yellow-600/40"
              : "bg-white border-gray-200"
          }`}
        >
          <h2 className="text-[#d4af37] text-2xl font-black italic uppercase">
            {t.prizes}
          </h2>

          {openPrizes ? (
            <ChevronUp size={22} className="text-yellow-600" />
          ) : (
            <ChevronDown size={22} className="text-yellow-600" />
          )}
        </button>

        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            openPrizes
              ? "max-h-[2000px] opacity-100 mt-2"
              : "max-h-0 opacity-0"
          }`}
        >
          <div
            className={`rounded-xl p-6 border ${
              isDark
                ? "bg-[#0a0a20]/75 border-yellow-600/40"
                : "bg-white border-gray-200"
            }`}
          >

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {champion.prizes.map((prize: any) => (
                <div
                  key={prize.id}
                  className={`rounded-2xl p-6 text-center border ${
                    isDark
                      ? "bg-[#101030]/70 border-yellow-600/30 text-white"
                      : "bg-gray-50 border-gray-200 text-black"
                  }`}
                >
                  <Trophy size={50} className="text-yellow-400 mx-auto" />
                  <h3 className="mt-4 text-yellow-400 text-3xl font-black italic">
                    #{prize.rank}
                  </h3>
                  <p className="font-black mt-2">{prize.title}</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {prize.description}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
