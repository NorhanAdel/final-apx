"use client";

import { useEffect, useState } from "react";
import { Search, Heart, Star, Trophy, MapPin, User } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import { MY_FAVORITES_QUERY } from "@/app/graphql/query/favorite.queries";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";

const translateNationality = (val: string, lang: string) => {
  if (!val) return lang === "ar" ? "غير معروف" : "Unknown";

  const map: any = {
    Egyptian: {
      ar: "مصري",
      en: "Egyptian",
      pt: "Egípcio",
      zh: "埃及人",
    },
    American: {
      ar: "أمريكي",
      en: "American",
      pt: "Americano",
      zh: "美国人",
    },
  };

  return map[val]?.[lang] || val;
};

const translatePosition = (val: string, lang: string) => {
  if (!val) return lang === "ar" ? "لاعب" : "Player";

  const map: any = {
    "حارس مرمى": {
      ar: "حارس مرمى",
      en: "Goalkeeper",
      pt: "Goleiro",
      zh: "守门员",
    },
    مدافع: {
      ar: "مدافع",
      en: "Defender",
      pt: "Defensor",
      zh: "后卫",
    },
    مهاجم: {
      ar: "مهاجم",
      en: "Striker",
      pt: "Atacante",
      zh: "前锋",
    },
  };

  return map[val]?.[lang] || val;
};

export default function FavoritesPage() {
  const { theme } = useTheme();
  const lang =
    typeof window !== "undefined" ? localStorage.getItem("lang") || "en" : "en";

  const isDark = theme === "dark";

  const [players, setPlayers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);

    try {
      const result = await fetchGraphQL<{
        myFavorites: Array<{
          id: string;
          player: {
            id: string;
            first_name: string;
            last_name: string;
            position: string;
            nationality: string;
            profile_image_url: string;
            average_rating: number;
            date_of_birth: string;
            age: number;
          };
        }>;
      }>(MY_FAVORITES_QUERY, { search: search || undefined });

      const formatted = (result.data?.myFavorites || []).map((item: any) => {
        const p = item.player;

        const age =
          p?.age ||
          (p?.date_of_birth
            ? new Date().getFullYear() - new Date(p.date_of_birth).getFullYear()
            : 0);

        return {
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          image: p.profile_image_url
            ? p.profile_image_url.startsWith("http")
              ? p.profile_image_url
              : `${process.env.NEXT_PUBLIC_API_URL}${p.profile_image_url}`
            : "/b2.jpg",
          rating: p.average_rating || 0,
          position: translatePosition(p.position, lang),
          country: translateNationality(p.nationality, lang),
          age,
        };
      });

      setPlayers(formatted);
      setFiltered(formatted);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);

    const f = players.filter((p) =>
      p.name.toLowerCase().includes(value.toLowerCase()),
    );

    setFiltered(f);
  };

  const translations = {
    ar: {
      search: "ابحث عن اللاعبين...",
      loading: "جاري التحميل...",
      noData: "لا يوجد بيانات",
    },
    en: {
      search: "Search favorites...",
      loading: "Loading...",
      noData: "No data",
    },
    pt: {
      search: "Pesquisar favoritos...",
      loading: "Carregando...",
      noData: "Sem dados",
    },
    zh: {
      search: "搜索收藏...",
      loading: "加载中...",
      noData: "没有数据",
    },
  };

  const t = translations[lang as keyof typeof translations] || translations.en;

  const bg = isDark ? "bg-[#01040a]" : "bg-gray-100";
  const text = isDark ? "text-white" : "text-black";

  return (
    <div className={`min-h-screen py-28 px-4 ${bg} ${text}`}>
      <div className="max-w-7xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-60" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t.search}
            className="w-full py-3 pl-12 pr-4 rounded-lg bg-white/5 border border-white/10"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-center col-span-full">{t.loading}</p>
        ) : filtered.length === 0 ? (
          <p className="text-center col-span-full">{t.noData}</p>
        ) : (
          filtered.map((p) => (
            <div
              key={p.id}
              className="relative group overflow-hidden rounded-xl bg-[#030712] border border-white/5 shadow-lg transition-all duration-300 hover:border-yellow-500/30"
            >
              <div className="absolute top-3 right-3 z-20 bg-black/40 p-2 rounded-full">
                <Heart size={16} className="text-red-500 fill-red-500" />
              </div>

              <div className="relative aspect-[4/5] w-full">
                <img
                  src={p.image}
                  className="object-cover w-full h-full grayscale-[20%] group-hover:grayscale-0 transition"
                  alt={p.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-black uppercase">{p.name}</h3>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={
                          i < p.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-600"
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-between text-[10px] text-gray-300 font-bold">
                  <div className="flex items-center gap-1">
                    <Trophy size={12} className="text-yellow-400" />
                    {p.position}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={12} className="text-yellow-400" />
                    {p.country}
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={12} className="text-yellow-400" />
                    {p.age}Y
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}