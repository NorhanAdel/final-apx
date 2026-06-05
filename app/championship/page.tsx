"use client";

import React, { useEffect, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import TournamentCard from "../components/TournamentCard";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import { useTheme } from "../context/ThemeContext";
const CHAMPIONS_QUERY = `
  query {
    champions(skip: 0, take: 50) {
      champions {
        id
        title
        status
        answers_count
        winners_count
        created_at
        expiry_date
        photo_url
      }
      total
    }
  }
`;

// =========================
// TRANSLATION
// =========================
const tDict: any = {
  ar: {
    search: "بحث",
    sort: "ترتيب",
    noData: "لا يوجد مسابقات",
    newest: "الأحدث",
    oldest: "الأقدم",
    endingSoon: "الأقرب انتهاء",
    popular: "الأكثر تفاعلاً",
    winners: "أكبر عدد فائزين",
    active: "النشطة أولاً",
  },
  en: {
    search: "Search",
    sort: "Sort",
    noData: "No Champions Found",
    newest: "Newest",
    oldest: "Oldest",
    endingSoon: "Ending Soon",
    popular: "Most Popular",
    winners: "Most Winners",
    active: "Active First",
  },
  zh: {
    search: "搜索",
    sort: "排序",
    noData: "没有比赛",
    newest: "最新",
    oldest: "最旧",
    endingSoon: "即将结束",
    popular: "最受欢迎",
    winners: "最多获胜者",
    active: "优先活动",
  },
  ru: {
    search: "Поиск",
    sort: "Сортировка",
    noData: "Нет данных",
    newest: "Новые",
    oldest: "Старые",
    endingSoon: "Скоро заканчивается",
    popular: "Популярные",
    winners: "Больше победителей",
    active: "Активные",
  },
};

export default function TournamentGallery() {
  const [data, setData] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [lang, setLang] = useState("ar");
const { theme } = useTheme();
  const t = tDict[lang] || tDict.ar;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLang(localStorage.getItem("lang") || "ar");
    }
  }, []);

  const fetchData = async () => {
    const res: any = await fetchGraphQL(CHAMPIONS_QUERY, {
      headers: { Accept: lang },
    });

    const champions = res?.data?.champions?.champions || [];

    setData(champions);
    setFiltered(champions);
  };

  useEffect(() => {
    fetchData();
  }, [lang]);

  // =========================
  // SEARCH + SORT
  // =========================
  useEffect(() => {
    let result = [...data];

    // SEARCH
    if (search.trim()) {
      result = result.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // SORT LOGIC
    if (sort === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
    }

    if (sort === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      );
    }

    if (sort === "endingSoon") {
      result.sort(
        (a, b) =>
          new Date(a.expiry_date).getTime() -
          new Date(b.expiry_date).getTime()
      );
    }

    if (sort === "popular") {
      result.sort((a, b) => b.answers_count - a.answers_count);
    }

    if (sort === "winners") {
      result.sort((a, b) => b.winners_count - a.winners_count);
    }

    if (sort === "active") {
      result.sort((a, b) => {
        if (a.status === b.status) return 0;
        if (a.status === "Active") return -1;
        return 1;
      });
    }

    setFiltered(result);
  }, [search, sort, data]);

  // =========================
  // SORT OPTIONS (NO SELECT)
  // =========================
  const sortOptions = [
    { key: "newest", label: t.newest },
    { key: "oldest", label: t.oldest },
    { key: "endingSoon", label: t.endingSoon },
    { key: "popular", label: t.popular },
    { key: "winners", label: t.winners },
    { key: "active", label: t.active },
  ];

  return (
    <main
  className={`min-h-screen p-6 md:p-12 font-sans transition-colors duration-300 ${
    theme === "dark"
      ? "bg-[#020b1c] text-white"
      : "bg-gray-50 text-gray-900"
  }`}
>
      <div className="max-w-7xl mx-auto py-30">

        {/* SEARCH + SORT */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6">

          {/* SEARCH */}
          <div className="relative w-full lg:w-1/3">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
  theme === "dark" ? "text-gray-400" : "text-gray-500"
}`}
              size={18}
            />

            <input
              type="text"
              placeholder={t.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
           className={`w-full rounded-md py-2.5 pl-10 pr-4 text-sm border transition-colors ${
  theme === "dark"
    ? "bg-[#0a0a20] border-blue-900/30 text-white"
    : "bg-white border-gray-300 text-gray-900"
}`}
            />
          </div>

          {/* SORT BUTTONS (NO SELECT) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-400 text-xs uppercase font-bold mr-2">
              {t.sort}
            </span>

            {sortOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSort(opt.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-bold uppercase border transition
                ${
  sort === opt.key
    ? theme === "dark"
      ? "bg-blue-950 border-blue-600 text-white"
      : "bg-blue-100 border-blue-400 text-blue-900"
    : theme === "dark"
      ? "bg-[#0a0a20] border-blue-900/50 text-white hover:bg-blue-950"
      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
}
                `}
              >
                {opt.label}

                <ChevronDown size={14} className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.length > 0 ? (
            filtered.map((tItem) => (
              <TournamentCard
                key={tItem.id}
                id={tItem.id}
                title={tItem.title}
                image={tItem.photo_url}
                date={tItem.status}
              />
            ))
          ) : (
            <p className="text-white text-center col-span-2">
              {t.noData}
            </p>
          )}
        </div>

      </div>
    </main>
  );
}
