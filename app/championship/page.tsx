"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
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

const tDict: any = {
  ar: {
    search: "بحث",
    sort: "ترتيب",
    noData: "لا يوجد مسابقات",
    all: "كل المسابقات",
    newest: "الأحدث",
    oldest: "الأقدم",
    endingSoon: "الأقرب انتهاء",
    popular: "الأكثر تفاعلاً",
    winners: "أكبر عدد فائزين",
    active: "النشطة أولاً",
  },
};

export default function TournamentGallery() {
  const [data, setData] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("all"); // ✅ default = all
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

  useEffect(() => {
    let result = [...data];

    // SEARCH
    if (search.trim()) {
      result = result.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // SORT
    switch (sort) {
      case "all":
        // default: no sorting
        break;

      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
        break;

      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
        );
        break;

      case "endingSoon":
        result.sort(
          (a, b) =>
            new Date(a.expiry_date).getTime() -
            new Date(b.expiry_date).getTime()
        );
        break;

      case "popular":
        result.sort((a, b) => b.answers_count - a.answers_count);
        break;

      case "winners":
        result.sort((a, b) => b.winners_count - a.winners_count);
        break;

      case "active":
        result.sort((a, b) => {
          if (a.status === b.status) return 0;
          return a.status === "Active" ? -1 : 1;
        });
        break;
    }

    setFiltered(result);
  }, [search, sort, data]);

  const sortOptions = [
    { key: "all", label: t.all }, // ✅ NEW
    { key: "newest", label: t.newest },
    { key: "oldest", label: t.oldest },
    { key: "endingSoon", label: t.endingSoon },
    { key: "popular", label: t.popular },
    { key: "winners", label: t.winners },
    { key: "active", label: t.active },
  ];

  return (
    <main
      className={`min-h-screen transition-all duration-300 ${
        theme === "dark"
          ? "bg-[#020817] text-white"
          : "bg-slate-50 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 py-30">
        {/* Search + Filter */}
        <div
          className={`rounded-xl p-6 mb-12 border backdrop-blur-xl ${
            theme === "dark"
              ? "bg-white/5 border-white/10"
              : "bg-white shadow-sm border-gray-200"
          }`}
        >
          <div className="flex flex-col lg:flex-row gap-8 justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-[380px]">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.search}
                className={`w-full rounded pl-12 pr-4 py-4 outline-none border transition ${
                  theme === "dark"
                    ? "bg-[#07111f] border-white/10"
                    : "bg-white border-gray-200"
                }`}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {sortOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSort(opt.key)}
                  className={`px-3 py-1 rounded text-sm font-semibold transition-all duration-300 ${
                    sort === opt.key
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg"
                      : theme === "dark"
                      ? "bg-white/5 border border-white/10 hover:bg-white/10"
                      : "bg-white border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-7">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <TournamentCard
                key={item.id}
                id={item.id}
                title={item.title}
                image={item.photo_url}
                date={item.status}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-gray-400">
              {t.noData}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
