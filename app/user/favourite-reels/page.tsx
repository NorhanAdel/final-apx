"use client";

import { useEffect, useState } from "react";
import { Heart, Eye, MessageCircle, HeartOff, Loader2 } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";
import BackButton from "@/app/components/BackButton";
import { toast } from "sonner";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";

const MY_LIKED_REELS = `
query MyLikedReels($skip: Int, $take: Int) {
  myLikedReels(skip: $skip, take: $take) {
    id
    clip_url
    start_time
    end_time
    views_count
    likes_count
    comments_count
    created_at
    hasLiked
  }
}
`;

const UNLIKE_REEL = `
mutation UnlikeReel($id: ID!) {
  unlikeReel(id: $id)
}
`;

export default function LikedReelsPage() {
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const isDark = theme === "dark";
  const isRTL = lang === "ar";

  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unliking, setUnliking] = useState<string | null>(null);

  const fetchReels = async () => {
    try {
      const result = await fetchGraphQL<{ myLikedReels: any[] }>(
        MY_LIKED_REELS,
        {
          skip: 0,
          take: 20,
        },
      );
      console.log("📹 Fetched reels:", result);
      setReels(result?.data?.myLikedReels || []);
    } catch (err) {
      console.log("Error fetching reels:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const handleUnlike = async (reelId: string) => {
    setUnliking(reelId);
    try {
      console.log("🗑️ Attempting to unlike reel:", reelId);
      
      const result = await fetchGraphQL<{ unlikeReel: boolean }>(
        UNLIKE_REEL,
        { id: reelId },
      );

      console.log("📋 Unlike result:", result);

      if (result.errors) {
        console.error("❌ GraphQL Errors:", result.errors);
        toast.error(result.errors[0]?.message || t("Failed to unlike reel"));
        return;
      }

      if (result.data?.unlikeReel === true) {
        console.log("✅ Successfully unliked reel:", reelId);
        toast.success(t("Removed from favorites"));
        setReels((prev) => prev.filter((r) => r.id !== reelId));
      } else {
        console.warn("⚠️ Unlike returned false or undefined");
        toast.error(t("Failed to unlike reel"));
      }
    } catch (err) {
      console.error("❌ Error unliking reel:", err);
      toast.error(t("Failed to unlike reel"));
    } finally {
      setUnliking(null);
    }
  };

  const getVideoUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  const formatDate = (dateString: string) => {
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
          month: "short",
          day: "numeric",
        },
      );
    } catch {
      return dateString;
    }
  };

  if (loading)
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          isDark ? "text-white bg-[#020617]" : "text-black bg-gray-100"
        }`}
      >
        <Loader2 size={32} className="animate-spin text-yellow-500 mr-2" />
        {t("loading")}...
      </div>
    );

  return (
    <div
      className={`min-h-screen py-30 px-6 transition-all duration-300 ${
        isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-black"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <BackButton className="mb-6" />

      <h1
        className={`text-3xl text-center font-bold mb-10 text-yellow-500 ${
          isRTL ? "text-right" : "text-left"
        }`}
      >
        {t("favoriteReels")}
      </h1>

      {reels.length === 0 ? (
        <p
          className={`text-center ${
            isDark ? "text-gray-400" : "text-gray-600"
          } ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("noLikedVideos")}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reels.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl overflow-hidden hover:scale-[1.02] transition border ${
                isDark
                  ? "bg-[#0a0f1e] border-gray-800"
                  : "bg-white border-gray-300"
              }`}
            >
              <div className="relative w-full h-100 bg-black">
                <video
                  src={getVideoUrl(item.clip_url)}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 space-y-2">
                <div
                  className={`flex items-center justify-between text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  } ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <span className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Eye size={14} /> {item.views_count}
                  </span>

                  <button
                    onClick={() => handleUnlike(item.id)}
                    disabled={unliking === item.id}
                    className={`flex items-center gap-1 transition hover:scale-110 ${
                      unliking === item.id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    title={t("Remove from favorites")}
                  >
                    {unliking === item.id ? (
                      <Loader2 size={14} className="animate-spin text-gray-500" />
                    ) : (
                      <Heart size={14} className="text-red-500 fill-red-500" />
                    )}
                    <span>{item.likes_count}</span>
                  </button>

                  <span className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <MessageCircle size={14} /> {item.comments_count}
                  </span>
                </div>

                <p className={`text-xs text-gray-500 ${isRTL ? "text-right" : "text-left"}`}>
                  {formatDate(item.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}