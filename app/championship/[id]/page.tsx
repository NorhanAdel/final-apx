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

  const [openPrizes, setOpenPrizes] = useState(false);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [champion, setChampion] = useState<any>(null);

  // =========================
  // LANGUAGE
  // =========================
  const lang =
    typeof window !== "undefined"
      ? localStorage.getItem("lang") || "ar"
      : "ar";

  const t = tDict[lang] || tDict.ar;

  // =========================
  // IMAGE FIX (UNCHANGED)
  // =========================
  const getImageUrl = (url: string | null) => {
    if (!url) return "/Chapm.png";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  // =========================
  // QUERY (UNCHANGED)
  // =========================
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
        first_name
        last_name
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

  // =========================
  // FETCH (UNCHANGED)
  // =========================
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
        console.log(error);
        toast.error("Failed to load championship");
      } finally {
        setLoading(false);
      }
    };

    fetchChampion();
  }, [id, lang]);

  // =========================
  // SUBMIT (UNCHANGED)
  // =========================
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

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center text-white">
        {t.loading}
      </div>
    );
  }

  if (!champion) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center text-white">
        {t.notFound}
      </div>
    );
  }

  const hasWinners =
    champion?.results_activated_at && champion?.winners?.length > 0;

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center px-6 py-30 font-sans"
      style={{
        backgroundImage: "url('/bgch.png')",
        backgroundColor: "#050510",
      }}
    >
      {/* TITLE (UNCHANGED) */}
      <h1 className="text-[#d4af37] text-2xl md:text-3xl font-black italic uppercase mb-16 mt-8 tracking-wider text-center">
        {champion.title}
      </h1>

      {/* CARD (UNCHANGED UI) */}
     <div className="relative w-full max-w-5xl bg-[#0a0a20]/90 border border-yellow-600/40 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">

  <div className="flex flex-col md:flex-row gap-6">

    {/* IMAGE (LEFT SIDE) */}
    <div className="w-full md:w-1/2 h-[350px] relative rounded-xl overflow-hidden border border-yellow-600/40">
      <Image
        src={getImageUrl(champion.photo_url)}
        alt={champion.title}
        fill
        className="object-cover"
      />
    </div>

    {/* RIGHT SIDE CONTENT (UNCHANGED) */}
    <div className="flex-1">

      {/* DESCRIPTION */}
      <p className="text-white text-lg md:text-xl font-bold italic text-center mb-8 leading-relaxed">
        {champion.description}
      </p>

      {/* ANSWER */}
      {champion.my_answer ? (
        <div className="bg-[#151535] border border-green-600/40 rounded-xl p-5 text-center mb-6">
          <p className="text-green-400 font-black text-sm uppercase mb-2">
            {t.yourAnswer}
          </p>

          <p className="text-white text-lg font-bold">
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
            className="w-full bg-[#151535] border border-blue-900/30 rounded-lg py-4 px-6 text-white mb-4"
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

  {/* DATE (UNCHANGED) */}
  <div className="mt-8 flex justify-end items-center gap-2 text-yellow-500 font-bold italic text-sm">
    <Hourglass size={16} className="animate-pulse" />
    <span>
      {t.endDate}:{" "}
      {new Date(champion.expiry_date).toLocaleDateString()}
    </span>
  </div>

</div>
      {/* PRIZES (UNCHANGED UI) */}
      <div className="w-full max-w-5xl mt-10">

        <button
          onClick={() => setOpenPrizes(!openPrizes)}
          className="w-full flex justify-between items-center bg-[#0a0a20]/80 border border-yellow-600/40 rounded-xl p-4"
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
              ? "max-h-[2000px] opacity-100 translate-y-0 mt-2"
              : "max-h-0 opacity-0 -translate-y-3"
          }`}
        >
          <div className="bg-[#0a0a20]/75 border border-yellow-600/40 rounded-xl p-6 transition-all duration-500">

            {/* PRIZES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {champion.prizes.map((prize: any) => (
                <div
                  key={prize.id}
                  className="bg-[#101030]/70 border border-yellow-600/30 rounded-2xl p-6 text-center"
                >
                  <Trophy size={50} className="text-yellow-400 mx-auto" />

                  <h3 className="mt-4 text-yellow-400 text-3xl font-black italic">
                    #{prize.rank}
                  </h3>

                  <p className="text-white font-black mt-2">
                    {prize.title}
                  </p>

                  <p className="text-gray-400 text-sm mt-2">
                    {prize.description}
                  </p>
                </div>
              ))}
            </div>

            {/* WINNERS */}
            <div className="mt-10">
              <h3 className="text-yellow-400 text-xl font-black italic mb-4">
                {t.winners}
              </h3>

              {hasWinners ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {champion.winners.map((winner: any) => {
  const fullName =
    `${winner.user?.first_name || ""} ${winner.user?.last_name || ""}`.trim();

  return (
    <div
      key={winner.id}
      className="bg-[#101a45]/90 border border-yellow-500 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]"
    >
      <div className="flex items-center justify-between">
        <span className="text-yellow-400 font-black text-lg">
          #{winner.rank}
        </span>

        <span className="text-white font-bold">
          {fullName || winner.user?.username}
        </span>
      </div>

      <p className="text-gray-300 mt-2 text-sm">
        {winner.answer?.content}
      </p>
    </div>
  );
})}
                </div>
              ) : (
                <div className="text-center text-yellow-400 font-bold italic py-6 animate-pulse">
                  {t.soon}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
