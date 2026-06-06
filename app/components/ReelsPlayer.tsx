"use client";

import { useEffect, useState, useRef } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import { SEND_REQUEST_MUTATION } from "@/app/graphql/mutation/request.mutations";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.28";

interface Video {
  id: string | number;
  title?: string;
  video_url: string;
  likes_count?: number;
  is_liked?: boolean;
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

const UNLIKE_REEL = `
mutation UnlikeReel($id: ID!) {
  unlikeReel(id: $id)
}
`;

export default function ReelsPlayer({ videos = [], playerId }: Props) {
  const { t } = useTranslate();

  const [selected, setSelected] = useState<string>("");

  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});

  const [loadingLike, setLoadingLike] = useState(false);
  const [sending, setSending] = useState(false);

  const hasSetInitial = useRef(false);

  // =========================
  // FULL URL
  // =========================
  const getFullUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  };

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    if (!videos.length) return;

    if (!hasSetInitial.current) {
      hasSetInitial.current = true;
      const first = videos[0]?.video_url;

      if (first) {
        setSelected(getFullUrl(first));
      }
    }

    const likesObj: Record<string, number> = {};
    const likedObj: Record<string, boolean> = {};

    videos.forEach((video) => {
      const id = String(video.id);
      likesObj[id] = video.likes_count || 0;
      likedObj[id] = video.is_liked || false;
    });

    setLikesMap(likesObj);
    setLikedVideos(likedObj);
  }, [videos]);

  const currentVideo = videos.find(
    (v) => getFullUrl(v.video_url) === selected
  );

  const currentId = currentVideo ? String(currentVideo.id) : "";

  const currentLikes = likesMap[currentId] ?? 0;
  const isLiked = likedVideos[currentId] || false;

  // =========================
  // LIKE / UNLIKE
  // =========================
  const handleLike = async () => {
    if (!currentId || loadingLike) return;

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error(t("Login required"));
      return;
    }

    try {
      setLoadingLike(true);

      const alreadyLiked = likedVideos[currentId] || false;

      // optimistic update
      setLikedVideos((prev) => ({
        ...prev,
        [currentId]: !alreadyLiked,
      }));

      setLikesMap((prev) => ({
        ...prev,
        [currentId]: alreadyLiked
          ? Math.max((prev[currentId] ?? 0) - 1, 0)
          : (prev[currentId] ?? 0) + 1,
      }));

      const mutation = alreadyLiked ? UNLIKE_REEL : LIKE_REEL;

      const result = await fetchGraphQL(mutation, {
        id: currentId,
      });

      if (result.errors) {
        // rollback
        setLikedVideos((prev) => ({
          ...prev,
          [currentId]: alreadyLiked,
        }));

        setLikesMap((prev) => ({
          ...prev,
          [currentId]: alreadyLiked
            ? (prev[currentId] ?? 0) + 1
            : Math.max((prev[currentId] ?? 0) - 1, 0),
        }));

        toast.error(result.errors[0].message);
        return;
      }

      toast.success(alreadyLiked ? t("Unliked") : t("Liked"));
    } catch (error) {
      console.error(error);
      toast.error(t("Like failed"));
    } finally {
      setLoadingLike(false);
    }
  };

  // =========================
  // SEND REQUEST
  // =========================
  const handleSendRequest = async () => {
    if (!playerId) {
      toast.error(t("Player ID not found"));
      return;
    }

    setSending(true);

    try {
      const result = await fetchGraphQL<{
        sendRequest: { id: string };
      }>(SEND_REQUEST_MUTATION, {
        input: {
          player_id: playerId,
          type: "CLUB_OFFER",
          message: "We have an offer for you",
        },
      });

      if (result.errors) {
        toast.error(result.errors[0].message);
      } else {
        toast.success(t("Request sent successfully!"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("Failed to send request. Please try again."));
    } finally {
      setSending(false);
    }
  };

  if (!videos.length) {
    return (
      <div className="w-full py-16 flex items-center justify-center text-gray-400">
        {t("No videos available")}
      </div>
    );
  }

  return (
    <div className="w-full max-w-[900px] mx-auto mt-20 text-white">
      <h2 className="text-yellow-400 text-3xl font-bold text-center mb-6">
        {t("Reels")}
      </h2>

      {/* VIDEO */}
      <div className="relative rounded-xl overflow-hidden bg-black border border-[#1c2c55]">
        {selected && (
          <video
            key={selected}
            src={selected}
            controls
            playsInline
            className="w-full h-[420px] object-cover"
          />
        )}

        {/* LIKE */}
        {/* <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
          <Heart
            onClick={handleLike}
            className={`cursor-pointer transition ${
              isLiked ? "text-red-500 fill-red-500" : "text-white"
            } ${loadingLike ? "opacity-50 pointer-events-none" : ""}`}
            size={18}
          />
          <span className="text-sm">{currentLikes}</span>
        </div> */}
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
        {videos.map((v) => {
          const url = getFullUrl(v.video_url);

          return (
            <video
              key={v.id}
              src={url}
              onClick={() => setSelected(url)}
              className={`w-[150px] h-[90px] object-cover rounded-lg cursor-pointer border ${
                selected === url ? "border-yellow-400" : "border-[#1c2c55]"
              }`}
            />
          );
        })}
      </div>

      {/* SEND REQUEST */}
      <button
        onClick={handleSendRequest}
        disabled={sending}
        className="w-full mt-6 py-3 bg-[#0a1a3a] hover:bg-[#11265e] rounded-lg font-semibold disabled:opacity-50 transition"
      >
        {sending ? t("Sending...") : t("Send Request")}
      </button>
    </div>
  );
}
