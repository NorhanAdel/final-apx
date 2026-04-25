"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Search,
  Heart,
  Star,
  Trophy,
  MapPin,
  User,
  StarHalf,
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import { TOGGLE_FAVORITE } from "@/app/graphql/mutation/favorite.mutations";
import { MY_FAVORITES_QUERY } from "@/app/graphql/query/favorite.queries";
import { toast } from "sonner";
import useTranslate from "@/app/hooks/useTranslate";
import BackButton from "@/app/components/BackButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

interface Player {
  id: string;
  favoriteId: string;
  name: string;
  image: string;
  rating: number;
  position: string;
  country: string;
  age: number;
  date_of_birth?: string;
}

interface FavoriteItem {
  id: string;
  player: {
    id: string;
    first_name: string;
    last_name: string;
    profile_image_url: string;
    average_rating: number;
    position: string;
    nationality: string;
    date_of_birth: string;
  };
}

interface FavoritesResponse {
  myFavorites: FavoriteItem[];
}

// فانكشن لحساب العمر من تاريخ الميلاد
const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

// فانكشن لعرض 7 نجوم
const renderSevenStars = (rating: number) => {
  const maxStars = 7;
  const maxOriginalRating = 5;
  let adjustedRating = rating;

  if (rating <= 5) {
    adjustedRating = (rating / maxOriginalRating) * maxStars;
  }

  const fullStars = Math.floor(adjustedRating);
  const hasHalfStar = adjustedRating - fullStars >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          size={12}
          className="text-yellow-400 fill-yellow-400"
        />
      ))}
      {hasHalfStar && (
        <StarHalf size={12} className="text-yellow-400 fill-yellow-400" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={12} className="text-gray-600" />
      ))}
    </div>
  );
};

export default function FavoritesPage() {
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const isDark = theme === "dark";

  const [players, setPlayers] = useState<Player[]>([]);
  const [filtered, setFiltered] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);

    try {
      const result = await fetchGraphQL<FavoritesResponse>(MY_FAVORITES_QUERY);

      const formatted: Player[] = (result?.data?.myFavorites || []).map(
        (item: FavoriteItem) => {
          const p = item.player;
          const age = calculateAge(p.date_of_birth);

          return {
            id: p.id,
            favoriteId: item.id,
            name: `${p.first_name} ${p.last_name}`,
            image: p.profile_image_url
              ? p.profile_image_url.startsWith("http")
                ? p.profile_image_url
                : `${API_URL}${p.profile_image_url}`
              : "/b2.jpg",
            rating: p.average_rating || 0,
            position: p.position || t("Player"),
            country: p.nationality || t("Unknown"),
            age,
            date_of_birth: p.date_of_birth,
          };
        },
      );

      setPlayers(formatted);
      setFiltered(formatted);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast.error(t("failedToLoadFavorites"));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (playerId: string) => {
    if (!currentUserId) {
      toast.error(t("userNotFound"));
      return;
    }

    setRemovingId(playerId);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error(t("pleaseLoginFirst"));
        return;
      }

      const result = await fetchGraphQL<{ toggleFavorite: boolean }>(
        TOGGLE_FAVORITE,
        {
          input: { playerId },
        },
      );

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const statusKey = `favorite_status_${currentUserId}_${playerId}`;
      const countKey = `favorite_count_${playerId}`;
      localStorage.removeItem(statusKey);
      localStorage.removeItem(countKey);

      const updatedPlayers = players.filter((p) => p.id !== playerId);
      setPlayers(updatedPlayers);
      setFiltered(updatedPlayers);

      toast.success(t("removedFromFavorites"));
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error(t("failedToRemove"));
    } finally {
      setRemovingId(null);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    const f = players.filter((p) =>
      p.name.toLowerCase().includes(value.toLowerCase()),
    );
    setFiltered(f);
  };

  const bg = isDark ? "bg-[#01040a]" : "bg-gray-100";
  const text = isDark ? "text-white" : "text-black";

  return (
    <div className={`min-h-screen py-28 px-4 ${bg} ${text}`}>
      <div className="max-w-7xl mx-auto mb-8">
        <BackButton className="mb-6" />
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-60" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t("searchFavorites")}
            className="w-full py-3 pl-12 pr-4 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-yellow-400"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-center col-span-full">{t("loading")}</p>
        ) : filtered.length === 0 ? (
          <p className="text-center col-span-full">{t("noData")}</p>
        ) : (
          filtered.map((p) => (
            <div
              key={p.id}
              className="relative group overflow-hidden rounded-xl bg-[#030712] border border-white/5 shadow-lg transition-all duration-300 hover:border-yellow-500/30 cursor-pointer"
              onClick={() => (window.location.href = `/players/${p.id}`)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFavorite(p.id);
                }}
                disabled={removingId === p.id}
                className="absolute top-3 right-3 z-20 bg-black/40 p-2 rounded-full hover:bg-black/60 transition cursor-pointer disabled:opacity-50"
              >
                <Heart size={16} className="text-red-500 fill-red-500" />
              </button>

              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-cover grayscale-[20%] group-hover:grayscale-0 transition"
                  unoptimized={p.image.startsWith("http")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-black uppercase">{p.name}</h3>
                  {renderSevenStars(p.rating)}
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
                    {p.age}
                    {t("Y")}
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
