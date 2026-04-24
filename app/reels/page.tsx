"use client";

import { useEffect, useState, useRef } from "react";
import { Heart, MessageCircle, Send, MoreHorizontal } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

/* ================= TYPES ================= */
interface Reel {
  id: string;
  clip_url: string;
  event_type: string;
  views_count: number;
  likes_count: number;
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
}

/* ================= COMPONENT ================= */
export default function ReelsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState("");

  const [openComments, setOpenComments] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const viewed = useRef<Set<string>>(new Set());

  /* ================= FETCH REELS ================= */
  useEffect(() => {
    const fetchReels = async () => {
      const res = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              recentReels {
                id
                clip_url
                event_type
                views_count
                likes_count
                created_at
              }
            }
          `,
        }),
      });

      const json = await res.json();
      setReels(json?.data?.recentReels || []);
    };

    fetchReels();
  }, []);

  /* ================= SCROLL ================= */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const index = Math.round(
      e.currentTarget.scrollTop / e.currentTarget.clientHeight
    );

    setCurrentIndex(index);

    const reel = reels[index];
    if (reel) incrementView(reel.id);
  };

  /* ================= LIKE ================= */
  const toggleLike = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Login required");

    const saved = JSON.parse(localStorage.getItem("likedReels") || "{}");

    if (saved[id]) return;

    saved[id] = true;
    localStorage.setItem("likedReels", JSON.stringify(saved));
    setLiked(saved);

    setReels((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, likes_count: r.likes_count + 1 } : r
      )
    );

    await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation {
            likeReel(id: "${id}")
          }
        `,
      }),
    });
  };

  /* ================= VIEWS ================= */
  const incrementView = async (id: string) => {
    if (viewed.current.has(id)) return;
    viewed.current.add(id);

    await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation {
            incrementReelViews(id: "${id}")
          }
        `,
      }),
    });

    setReels((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, views_count: r.views_count + 1 } : r
      )
    );
  };

  /* ================= FETCH COMMENTS ================= */
  const fetchComments = async (reelId: string) => {
    const res = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query {
            reelComments(reelId: "${reelId}") {
              id
              content
              user_id
              created_at
            }
          }
        `,
      }),
    });

    const json = await res.json();

    setComments((prev) => ({
      ...prev,
      [reelId]: json?.data?.reelComments || [],
    }));
  };

  /* ================= ADD COMMENT ================= */
  const addComment = async (reelId: string) => {
    const token = localStorage.getItem("token");
    if (!token || !commentText) return;

    await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation {
            createReelComment(input: {
              target_type: REEL
              target_id: "${reelId}"
              content: "${commentText}"
            }) {
              id
              content
              user_id
              created_at
            }
          }
        `,
      }),
    });

    fetchComments(reelId);
    setCommentText("");
    setReplyTo(null);
  };

  /* ================= DELETE COMMENT ================= */
  const deleteComment = async (commentId: string, reelId: string) => {
    const token = localStorage.getItem("token");

    await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation {
            deleteReelComment(id: "${commentId}")
          }
        `,
      }),
    });

    setComments((prev) => ({
      ...prev,
      [reelId]: prev[reelId].filter((c) => c.id !== commentId),
    }));
  };

  const bg = isDark ? "bg-[#020B1D]" : "bg-gray-100";

  return (
    <div
      className={`h-screen overflow-y-scroll py-30 snap-y snap-mandatory ${bg}`}
      onScroll={handleScroll}
    >
      {reels.map((reel, index) => {
        const videoSrc = reel.clip_url.startsWith("http")
          ? reel.clip_url
          : `${API_URL}${reel.clip_url}`;

        const isLiked = liked[reel.id];

        return (
          <div
            key={reel.id}
            className="relative h-screen w-full max-w-[420px] my-10 mx-auto snap-start"
          >
            <video
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              src={videoSrc}
              className="w-full h-full object-cover bg-black"
              autoPlay={currentIndex === index}
              muted
              loop
              playsInline
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/80" />

            <div className="absolute right-4 bottom-24 flex flex-col gap-6 z-10 text-white">
              <button onClick={() => toggleLike(reel.id)} className="flex flex-col items-center">
                <Heart
                  size={26}
                  fill={isLiked ? "red" : "none"}
                  className={isLiked ? "text-red-500" : "text-white"}
                />
                <span className="text-xs">{reel.likes_count}</span>
              </button>

              <button
                onClick={() => {
                  setOpenComments(reel.id);
                  fetchComments(reel.id);
                }}
                className="flex flex-col items-center"
              >
                <MessageCircle size={26} className="text-white" />
                <span className="text-xs">
                  {comments[reel.id]?.length || 0}
                </span>
              </button>

              <span className="text-xs">👁 {reel.views_count}</span>

              <MoreHorizontal size={22} />
            </div>

          </div>
        );
      })}
    </div>
  );
}