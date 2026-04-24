"use client";

import { useEffect, useState } from "react";
import { Heart, Eye, MessageCircle } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

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

export default function LikedReelsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const res = await fetch(`${API_URL}/graphql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({
            query: MY_LIKED_REELS,
            variables: {
              skip: 0,
              take: 20,
            },
          }),
        });

        const json = await res.json();
        setReels(json?.data?.myLikedReels || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  const getVideoUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${API_URL}${url}`;
  };

  if (loading)
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          isDark ? "text-white bg-[#020617]" : "text-black bg-gray-100"
        }`}
      >
        Loading...
      </div>
    );

  return (
    <div
      className={`min-h-screen py-30 px-6  transition-all duration-300 ${
        isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-black"
      }`}
    >
      <h1 className="text-3xl text-center font-bold mb-10 text-yellow-500">
        Liked Reels
      </h1>

      {reels.length === 0 ? (
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          No liked videos yet
        </p>
      ) : (
        <div className="grid grid-cols-1  md:grid-cols-3 gap-6">
          {reels.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl overflow-hidden  hover:scale-[1.02] transition border ${
                isDark
                  ? "bg-[#0a0f1e] border-gray-800"
                  : "bg-white border-gray-300"
              }`}
            >
              {/* VIDEO */}
              <div className="relative w-full h-100 bg-black">
                <video
                  src={getVideoUrl(item.clip_url)}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>

              {/* INFO */}
              <div className="p-4 space-y-2">
                <div
                  className={`flex items-center justify-between text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Eye size={14} /> {item.views_count}
                  </span>

                  <span className="flex items-center gap-1 text-red-400">
                    <Heart size={14} /> {item.likes_count}
                  </span>

                  <span className="flex items-center gap-1">
                    <MessageCircle size={14} /> {item.comments_count}
                  </span>
                </div>

                <p className="text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}