"use client";

import { useEffect, useState, useRef } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

interface Video {
  id: string | number;
  video_url: string;
  likesCount?: number;
  isLiked?: boolean;
}

interface Props {
  videos?: Video[];
  playerId?: string;
}

const LIKE_REEL = `
mutation LikeReel($id: ID!) {
  likeReel(id: $id)
}
`;

const GET_REELS = `
query {
  recentReels {
    id
    clip_url
    likes_count
    views_count
  }
}
`;

export default function ReelsPlayer({
  videos = [],
  playerId,
}: Props) {
  const [reels, setReels] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] =
    useState<Video | null>(null);

  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const initRef = useRef(false);

  // =========================
  // SAME FETCH SYSTEM
  // =========================
  const gqlFetch = async (
    query: string,
    variables?: any,
    withAuth = false
  ) => {
    const token = localStorage.getItem("token");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (withAuth && token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    return res.json();
  };

  const getFullUrl = (url?: string) => {
    if (!url) return "";

    if (url.startsWith("http")) return url;

    return `${API_URL}${url}`;
  };

  // =========================
  // LOAD REELS (SYNC FIX)
  // =========================
  const fetchReels = async () => {
    const res: any = await gqlFetch(GET_REELS);

    const data = res?.data?.recentReels || [];

    const mapped = data.map((r: any) => ({
      id: r.id,
      video_url: r.clip_url,
      likesCount: r.likes_count,
    }));

    setReels(mapped);

    if (!initRef.current && mapped.length) {
      initRef.current = true;

      setSelectedVideo(mapped[0]);

      setLikes(mapped[0].likesCount || 0);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  // =========================
  // SELECT VIDEO
  // =========================
  const handleSelect = (v: Video) => {
    setSelectedVideo(v);
    setLikes(v.likesCount || 0);
    setLiked(false);
  };

  // =========================
  // LIKE (FIXED)
  // =========================
  const handleLike = async () => {
    if (!selectedVideo?.id || loading) return;

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Login required 🔒");
      return;
    }

    try {
      setLoading(true);

      const res: any = await gqlFetch(
        LIKE_REEL,
        { id: selectedVideo.id },
        true
      );

      if (res.errors) {
        toast.error(res.errors[0].message);
        return;
      }

      // 🔥 Optimistic update
      const newState = !liked;

      setLiked(newState);

      setLikes((prev) =>
        newState ? prev + 1 : prev - 1
      );

      // 🔥 IMPORTANT: refresh from server to avoid zero after reload issue
      setTimeout(() => {
        fetchReels();
      }, 300);

      toast.success(newState ? "Liked ❤️" : "Unliked 💔");
    } catch (err) {
      console.error(err);
      toast.error("Like failed");
    } finally {
      setLoading(false);
    }
  };

  if (!reels.length) return null;

  return (
    <div className="w-full max-w-[900px] mx-auto mt-20 text-white">
      <h2 className="text-yellow-400 text-3xl font-bold text-center mb-6">
        Reels
      </h2>

      {/* MAIN VIDEO */}
      <div className="relative rounded-xl overflow-hidden bg-black">
        {selectedVideo && (
          <video
            src={getFullUrl(selectedVideo.video_url)}
            controls
            className="w-full h-[420px] object-cover"
          />
        )}

        {/* LIKE */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
          <Heart
            onClick={handleLike}
            className={`cursor-pointer transition ${
              liked
                ? "text-red-500 fill-red-500"
                : "text-white"
            } ${
              loading
                ? "opacity-50 pointer-events-none"
                : ""
            }`}
            size={18}
          />

          <span className="text-sm">{likes}</span>
        </div>
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-3 mt-4 overflow-x-auto">
        {reels.map((v) => (
          <video
            key={v.id}
            src={getFullUrl(v.video_url)}
            onClick={() => handleSelect(v)}
            className={`w-[150px] h-[90px] object-cover rounded-lg cursor-pointer border ${
              selectedVideo?.id === v.id
                ? "border-yellow-400"
                : "border-[#1c2c55]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
