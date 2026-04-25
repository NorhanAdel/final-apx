"use client";

import { useEffect, useState, useRef } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import { SEND_REQUEST_MUTATION } from "@/app/graphql/mutation/request.mutations";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Video {
  id: string | number;
  title?: string;
  video_url: string;
}

interface Props {
  videos?: Video[];
  playerId?: string;
}

export default function ReelsPlayer({ videos = [], playerId }: Props) {
  const { t } = useTranslate();
  const [selected, setSelected] = useState<string>("");
  const [likes, setLikes] = useState(6);
  const [liked, setLiked] = useState(false);
  const [sending, setSending] = useState(false);
  const hasSetInitial = useRef(false);

  const getFullUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  };

  useEffect(() => {
    if (!videos.length) return;

    if (!hasSetInitial.current) {
      hasSetInitial.current = true;
      const timer = setTimeout(() => {
        const first = videos[0]?.video_url;
        if (first) setSelected(getFullUrl(first));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [videos]);

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikes((prev) => (!liked ? prev + 1 : prev - 1));
  };

  const handleSendRequest = async () => {
    if (!playerId) {
      toast.error(t("Player ID not found"));
      return;
    }

    setSending(true);

    try {
      const result = await fetchGraphQL<{
        sendRequest: {
          id: string;
          type: string;
          status: string;
          player_id: string;
          sender_id: string;
          created_at: string;
        };
      }>(SEND_REQUEST_MUTATION, {
        input: {
          player_id: playerId,
          type: "CLUB_OFFER",
          message: "We have an offer for you",
        },
      });

      if (result.errors) {
        toast.error(result.errors[0].message);
      } else if (result.data?.sendRequest) {
        toast.success(t("Request sent successfully!"));
      }
    } catch (error) {
      console.error("Error sending request:", error);
      toast.error(t("Failed to send request. Please try again."));
    } finally {
      setSending(false);
    }
  };

  if (!videos.length) return null;

  return (
    <div className="w-full max-w-[900px] mx-auto mt-20 text-white">
      <h2 className="text-yellow-400 text-3xl font-bold text-center mb-6">
        {t("Reels")}
      </h2>

      {/* Main Video */}
      <div className="relative rounded-xl overflow-hidden bg-black border border-[#1c2c55]">
        {selected && (
          <video
            key={selected}
            src={selected}
            controls
            className="w-full h-[420px] object-cover"
          />
        )}

        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
          <Heart
            onClick={handleLike}
            className={`cursor-pointer transition ${
              liked ? "text-red-500 fill-red-500" : "text-white"
            }`}
            size={18}
          />
          <span className="text-sm">{likes}</span>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 mt-4 overflow-x-auto">
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
