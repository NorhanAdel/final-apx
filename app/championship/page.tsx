"use client";

import React, { useEffect, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import TournamentCard from "../components/TournamentCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

const CHAMPIONS_QUERY = `
  query {
    champions(skip: 0, take: 50) {
      champions {
        id
        title
        status
        answers_count
      }
      total
    }
  }
`;

export default function TournamentGallery() {
  const [data, setData] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const gqlFetch = async (query: string) => {
    const res = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });
    return res.json();
  };

  // جلب الداتا
  useEffect(() => {
    const fetchData = async () => {
      const res = await gqlFetch(CHAMPIONS_QUERY);
      const champions = res?.data?.champions?.champions || [];
      setData(champions);
      setFiltered(champions);
    };

    fetchData();
  }, []);

  // Search + Sort
  useEffect(() => {
    let result = [...data];

    // Search
    if (search.trim()) {
      result = result.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort
    if (sort === "newest") {
      result.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sort === "popular") {
      result.sort((a, b) => b.answers_count - a.answers_count);
    } else if (sort === "rated") {
      result.sort((a, b) => b.answers_count - a.answers_count);
    }

    setFiltered(result);
  }, [search, sort, data]);

  const sortOptions = [
    { key: "rated", label: "Highest Rated" },
    { key: "newest", label: "Newest" },
    { key: "popular", label: "Most Popular" },
  ];

  const handleSort = (key: string) => {
    setSort(key);
  };

  return (
    <main className="min-h-screen bg-[#020208] p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto py-30">

        {/* SEARCH + SORT */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6">

          {/* SEARCH */}
          <div className="relative w-full lg:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0a0a20] border border-blue-900/30 rounded-md py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-700 transition"
            />
          </div>

          {/* SORT (بدون select) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-400 text-xs italic mr-2 font-bold uppercase tracking-widest">
              Sort
            </span>

            {sortOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleSort(opt.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-bold uppercase transition-colors border
                  ${
                    sort === opt.key
                      ? "bg-blue-950 border-blue-600 text-white"
                      : "bg-[#0a0a20] border-blue-900/50 text-white hover:bg-blue-950"
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
            filtered.map((t) => (
             <TournamentCard
  key={t.id}
  id={t.id}
  title={t.title}
  date={t.status || "No date"}
/>
            ))
          ) : (
            <p className="text-white text-center col-span-2">
              No Champions Found
            </p>
          )}
        </div>
      </div>
    </main>
  );
}