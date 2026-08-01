"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Send,
  Volume2,
  VolumeX,
  Reply,
  Edit,
  Trash2,
  X,
  Share2,
  Share,
  Copy,
  Check,
  Tag,
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import { useAuth } from "@/app/context/auth-context";
import useTranslate from "@/app/hooks/useTranslate";
import { toast } from "sonner";
import {
  fetchGraphQL,
  type FetchGraphQLResponse,
} from "@/app/lib/fetchGraphQL";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  user_name?: string;
  user_image?: string;
  role_translation?: string;
  created_at: string;
  hasLiked?: boolean;
  likes_count?: number;
  replies?: Comment[];
  parent_id?: string | null;
}

interface Reel {
  id: string;
  clip_url: string;
  event_type: string;
  views_count: number;
  likes_count: number;
  created_at: string;
}

const GET_RECENT_REELS = `
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
`;

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

const GET_REEL_COMMENTS = `
  query GetReelComments($reelId: ID!) {
    reelComments(reelId: $reelId) {
      id
      content
      user_id
      user_name
      user_image
      role_translation
      created_at
      likes_count
      hasLiked
      parent_id
      replies {
        id
        content
        user_id
        user_name
        user_image
        role_translation
        created_at
        likes_count
        hasLiked
        parent_id
      }
    }
  }
`;

const CREATE_COMMENT = `
  mutation CreateReelComment($input: CreateCommentInput!) {
    createReelComment(input: $input) {
      id
      content
      user_id
      created_at
      parent_id
    }
  }
`;

const UPDATE_COMMENT = `
  mutation UpdateReelComment($id: ID!, $input: UpdateCommentInput!) {
    updateReelComment(id: $id, input: $input) {
      id
      content
      updated_at
    }
  }
`;

const DELETE_COMMENT = `
  mutation DeleteReelComment($id: ID!) {
    deleteReelComment(id: $id)
  }
`;

const LIKE_COMMENT = `
  mutation LikeComment($id: ID!) {
    likeComment(id: $id)
  }
`;

const UNLIKE_COMMENT = `
  mutation UnlikeComment($id: ID!) {
    unlikeComment(id: $id)
  }
`;

const INCREMENT_REEL_VIEWS = `
  mutation IncrementReelViews($id: ID!) {
    incrementReelViews(id: $id)
  }
`;

const getFullImageUrl = (url?: string | null): string => {
  if (!url) return "/b3.jpg";
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

// Social Media Icons
const WhatsAppIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.298-.018-.459.13-.607.134-.133.297-.347.446-.52.15-.174.2-.298.3-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.61-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.273.298-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.656.862 5.109 2.318 7.079l-1.392 4.469 4.653-1.386C8.045 22.334 9.956 23 12 23c6.627 0 12-5.373 12-12S18.627 0 12 0zm3.37 16.318c-.149.416-.82.742-1.184.792-.336.047-.769.075-1.443-.322-1.195-.708-2.422-2.075-3.155-2.827-1.187-1.22-1.819-2.326-1.819-3.04 0-.715.353-1.294.77-1.631.16-.13.272-.186.391-.186.119 0 .283.014.403.014.118 0 .307-.049.481.372.104.252.357.923.389.992.032.069.052.149.019.238-.034.09-.053.11-.088.165-.035.055-.07.083-.115.133-.043.05-.078.069-.12.115-.04.046-.08.079-.033.155.047.076.208.345.445.669.477.655 1.054 1.41 1.79 1.879.384.245.845.441 1.324.553.081.019.156.008.215-.048.128-.125.332-.409.422-.55.09-.141.157-.116.267-.07.111.046.512.243.655.322.144.078.27.174.31.272.039.098.039.229-.01.374z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const TelegramIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.128.832.941z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function ReelsPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { t, lang } = useTranslate();
  const isDark = theme === "dark";
  const isRTL = lang === "ar";

  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentsCount, setCommentsCount] = useState<Record<string, number>>(
    {},
  );
  const [commentText, setCommentText] = useState("");
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [editReplyId, setEditReplyId] = useState<string | null>(null);
  const [editReplyText, setEditReplyText] = useState("");
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const viewsIncremented = useRef<Set<string>>(new Set());
  const [muted, setMuted] = useState(false);
  const [openShareModal, setOpenShareModal] = useState<string | null>(null);
  const [copiedReelId, setCopiedReelId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const formatReelEventType = (type?: string) => {
    if (!type) return null;
    const eventMap: Record<
      string,
      { ar: string; en: string; pt: string; zh: string }
    > = {
      GOAL: { ar: "⚽ هدف", en: "⚽ Goal", pt: "⚽ Gol", zh: "⚽ 进球" },
      ASSIST: {
        ar: "🅰️ صناعة هدف",
        en: "🅰️ Assist",
        pt: "🅰️ Assistência",
        zh: "🅰️ 助攻",
      },
      TACKLE: {
        ar: "🛡️ قطع كرة",
        en: "🛡️ Tackle",
        pt: "🛡️ Desarme",
        zh: "🛡️ 抢断",
      },
      DRIBBLE: {
        ar: "⚡ مراوغة",
        en: "⚡ Dribble",
        pt: "⚡ Drible",
        zh: "⚡ 过人",
      },
      HIGHLIGHT: {
        ar: "🌟 لقطة مميزة",
        en: "🌟 Highlight",
        pt: "🌟 Destaque",
        zh: "🌟 精彩",
      },
      OTHER: { ar: "📌 آخر", en: "📌 Other", pt: "📌 Outro", zh: "📌 其他" },
    };

    const key = type.toUpperCase();
    const normalizedLang = (lang || "ar").toLowerCase();
    const langKey = ["ar", "en", "pt", "zh"].includes(normalizedLang)
      ? (normalizedLang as "ar" | "en" | "pt" | "zh")
      : "ar";

    if (eventMap[key]) {
      return eventMap[key][langKey];
    }
    return type;
  };

  const getReelShareUrl = (reelId: string) => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/reels?id=${reelId}`;
  };

  const handleNativeShare = async (reel: Reel) => {
    const shareUrl = getReelShareUrl(reel.id);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: reel.event_type
            ? `Reel: ${reel.event_type}`
            : "Apex Talent Reel",
          text: t("check_out_reel") || "شاهد هذا الريل المميز على Apex Talent!",
          url: shareUrl,
        });
        toast.success(t("shared_successfully") || "تمت المشاركة بنجاح!");
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Native share error:", err);
        }
      }
    } else {
      handleCopyLink(reel);
    }
  };

  const handleCopyLink = (reel: Reel) => {
    const shareUrl = getReelShareUrl(reel.id);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedReelId(reel.id);
      toast.success(t("link_copied") || "تم نسخ رابط الريل بنجاح!");
      setTimeout(() => setCopiedReelId(null), 2500);
    }
  };

  const gqlFetch = async <T = any,>(
    query: string,
    variables?: Record<string, unknown>,
    _withAuth = false,
  ): Promise<FetchGraphQLResponse<T>> => {
    return await fetchGraphQL<T>(query, variables);
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    const json = await gqlFetch(GET_RECENT_REELS);
    const reelsData = json?.data?.recentReels || [];
    setReels(reelsData);

    for (const reel of reelsData) {
      fetchCommentsCount(reel.id);
    }

    setIsInitialLoad(false);
  };

  const fetchCommentsCount = async (reelId: string) => {
    const json = await gqlFetch(GET_REEL_COMMENTS, { reelId }, true);
    const commentsData = json?.data?.reelComments || [];
    setCommentsCount((prev) => ({ ...prev, [reelId]: commentsData.length }));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const index = Math.round(container.scrollTop / container.clientHeight);
    const newIndex = Math.min(Math.max(0, index), reels.length - 1);
    if (newIndex !== currentIndex) {
      videoRefs.current[currentIndex]?.pause();
      setCurrentIndex(newIndex);
    }
  };

  useEffect(() => {
    if (isInitialLoad) return;
    const current = videoRefs.current[currentIndex];
    if (current) {
      current.muted = muted;
      current.volume = muted ? 0 : 1;
      const playPromise = current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (current) {
            current.muted = true;
            current.play().catch(() => {});
          }
        });
      }
    }
    videoRefs.current.forEach((v, i) => {
      if (v && i !== currentIndex) v.pause();
    });
  }, [currentIndex, reels, muted, isInitialLoad]);

  useEffect(() => {
    if (reels.length > 0 && !isInitialLoad) {
      setTimeout(() => {
        const firstVideo = videoRefs.current[0];
        if (firstVideo) {
          firstVideo.muted = false;
          firstVideo.volume = 1;
          firstVideo.play().catch(() => {});
          setMuted(false);
        }
      }, 500);
    }
  }, [reels, isInitialLoad]);

  useEffect(() => {
    const handleFirstUserInteraction = () => {
      setMuted(false);
      const current = videoRefs.current[currentIndex];
      if (current) {
        current.muted = false;
        current.volume = 1;
        current.play().catch(() => {});
      }
      window.removeEventListener("click", handleFirstUserInteraction);
      window.removeEventListener("touchstart", handleFirstUserInteraction);
    };

    window.addEventListener("click", handleFirstUserInteraction);
    window.addEventListener("touchstart", handleFirstUserInteraction);

    return () => {
      window.removeEventListener("click", handleFirstUserInteraction);
      window.removeEventListener("touchstart", handleFirstUserInteraction);
    };
  }, [currentIndex]);

  useEffect(() => {
    const reel = reels[currentIndex];
    if (reel && !viewsIncremented.current.has(reel.id)) {
      viewsIncremented.current.add(reel.id);
      gqlFetch(INCREMENT_REEL_VIEWS, { id: reel.id }).catch(console.error);
    }
  }, [currentIndex, reels]);

  const toggleSound = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = newMuted;
        video.volume = newMuted ? 0 : 1;
      }
    });
  };

  const toggleLike = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error(t("Login required") || "Login required 🔒");
      return;
    }

    const isLiked = liked[id];
    setLiked((prev) => ({ ...prev, [id]: !isLiked }));
    setReels((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, likes_count: r.likes_count + (isLiked ? -1 : 1) }
          : r,
      ),
    );
    await gqlFetch(isLiked ? UNLIKE_REEL : LIKE_REEL, { id }, true).catch(
      console.error,
    );
  };

  const fetchComments = async (reelId: string) => {
    const json = await gqlFetch(GET_REEL_COMMENTS, { reelId }, true);
    const commentsData = json?.data?.reelComments || [];
    setComments((prev) => ({ ...prev, [reelId]: commentsData }));
    setCommentsCount((prev) => ({ ...prev, [reelId]: commentsData.length }));
  };

  const addComment = async (reelId: string, parentId?: string) => {
    const token = localStorage.getItem("token");
    const text = parentId ? replyText : commentText;
    if (!token || !text.trim()) return;

    const json = await gqlFetch(
      CREATE_COMMENT,
      {
        input: {
          target_type: "REEL",
          target_id: reelId,
          content: text,
          ...(parentId && { parent_id: parentId }),
        },
      },
      true,
    );

    if (json.data?.createReelComment) {
      await fetchComments(reelId);
      if (parentId) {
        setReplyText("");
        setReplyToCommentId(null);
      } else setCommentText("");
    }
  };

  const updateComment = async (
    id: string,
    newContent: string,
    reelId: string,
    isReply = false,
  ) => {
    const token = localStorage.getItem("token");
    if (!token || !newContent.trim()) return;

    const json = await gqlFetch(
      UPDATE_COMMENT,
      { id, input: { content: newContent } },
      true,
    );
    if (json.data?.updateReelComment) {
      await fetchComments(reelId);
      if (isReply) {
        setEditReplyId(null);
        setEditReplyText("");
      } else {
        setEditCommentId(null);
        setEditCommentText("");
      }
    }
  };

  const deleteComment = async (id: string, reelId: string) => {
    const json = await gqlFetch(DELETE_COMMENT, { id }, true);
    if (json.data?.deleteReelComment) {
      await fetchComments(reelId);
    }
  };

  const toggleLikeComment = async (
    commentId: string,
    reelId: string,
    currentLiked: boolean,
  ) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setComments((prev) => {
      const updated = { ...prev };
      const updateRecursive = (list: Comment[]): Comment[] =>
        list.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              hasLiked: !currentLiked,
              likes_count: (c.likes_count || 0) + (currentLiked ? -1 : 1),
            };
          }
          return c.replies ? { ...c, replies: updateRecursive(c.replies) } : c;
        });
      updated[reelId] = updateRecursive(updated[reelId] || []);
      return updated;
    });

    await gqlFetch(
      currentLiked ? UNLIKE_COMMENT : LIKE_COMMENT,
      { id: commentId },
      true,
    ).catch(console.error);
  };

  const togglePlay = (reelId: string, index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPaused((prev) => ({ ...prev, [reelId]: false }));
    } else {
      video.pause();
      setIsPaused((prev) => ({ ...prev, [reelId]: true }));
    }
  };

  const canEditDelete = (commentUserId: string) => user?.id === commentUserId;

  const UserAvatar = ({
    src,
    alt,
    size = 24,
  }: {
    src?: string;
    alt: string;
    size?: number;
  }) => {
    const fullUrl = getFullImageUrl(src);
    return (
      <div
        className="relative rounded-full overflow-hidden shrink-0"
        style={{ width: size, height: size }}
      >
        <Image
          src={fullUrl}
          alt={alt}
          fill
          className="object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/b3.jpg";
          }}
          unoptimized
        />
      </div>
    );
  };

  const bg = isDark ? "bg-[#020B1D]" : "bg-gray-100";

  return (
    <div
      className={`h-screen overflow-y-scroll snap-y snap-mandatory ${bg}`}
      onScroll={handleScroll}
      style={{ scrollSnapType: "y mandatory" }}
    >
      <div className="h-0 w-full shrink-0 snap-start" />

      {reels.map((reel, index) => {
        const videoSrc = getFullImageUrl(reel.clip_url);
        const isLiked = liked[reel.id] || false;

        return (
          <div
            key={reel.id}
            className="relative h-screen w-full max-w-[420px] my-0 mx-auto snap-start"
          >
            <video
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              src={videoSrc}
              className="w-full h-full object-cover bg-black"
              loop
              playsInline
              autoPlay
              muted={muted}
              onClick={() => togglePlay(reel.id, index)}
            />
            {isPaused[reel.id] && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="bg-black/40 rounded-full p-5 backdrop-blur-sm">
                  ▶
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/80 pointer-events-none" />

            {/* Reel Event Type Badge - Position based on RTL */}
            {reel.event_type && (
              <div
                className={`absolute top-28 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-yellow-400/50 text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg pointer-events-none ${
                  isRTL ? "right-4" : "left-4"
                }`}
              >
                <Tag size={13} className="text-yellow-400" />
                <span>{formatReelEventType(reel.event_type)}</span>
              </div>
            )}

            <button
              onClick={toggleSound}
              className={`absolute top-28 z-[999] text-white hover:text-yellow-400 transition ${
                isRTL ? "left-4" : "right-4"
              }`}
            >
              {muted ? (
                <VolumeX className="hover:text-yellow-400" />
              ) : (
                <Volume2 className="hover:text-yellow-400" />
              )}
            </button>

            {/* Action Buttons - Position based on RTL */}
            <div
              className={`absolute bottom-24 flex flex-col gap-6 z-10 ${
                isRTL ? "left-4" : "right-4"
              }`}
            >
              <button
                onClick={() => toggleLike(reel.id)}
                className="flex flex-col items-center group"
              >
                <Heart
                  size={26}
                  fill={isLiked ? "red" : "none"}
                  className={`transition ${
                    isLiked
                      ? "text-red-500"
                      : "text-white group-hover:text-yellow-400"
                  }`}
                />
                <span
                  className={`text-xs ${
                    isLiked
                      ? "text-red-500"
                      : "text-white group-hover:text-yellow-400"
                  } transition`}
                >
                  {reel.likes_count || 0}
                </span>
              </button>

              <button
                onClick={() => {
                  setOpenComments(reel.id);
                  fetchComments(reel.id);
                }}
                className="flex flex-col items-center group"
              >
                <MessageCircle
                  size={26}
                  className="text-white group-hover:text-yellow-400 transition"
                />
                <span className="text-xs text-white group-hover:text-yellow-400 transition">
                  {commentsCount[reel.id] || 0}
                </span>
              </button>

              <button
                onClick={() => setOpenShareModal(reel.id)}
                className="flex flex-col items-center group"
              >
                <Share2
                  size={26}
                  className="text-white group-hover:text-yellow-400 transition"
                />
                <span className="text-xs text-white group-hover:text-yellow-400 transition"></span>
              </button>

              <div className="flex flex-col items-center group">
                <span className="text-white group-hover:text-yellow-400 transition text-lg">
                  👁
                </span>
                <span className="text-xs text-white group-hover:text-yellow-400 transition">
                  {reel.views_count || 0}
                </span>
              </div>
            </div>

            {openShareModal === reel.id && (
              <div
                onClick={() => setOpenShareModal(null)}
                className={`fixed inset-0 z-[100] backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer ${
                  isDark ? "bg-black/80" : "bg-white/80"
                }`}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={`w-full max-w-sm rounded-2xl p-5 shadow-2xl flex flex-col gap-4 transition-all duration-200 cursor-default animate-in fade-in zoom-in-95 ${
                    isDark
                      ? "bg-[#0b1329] border border-gray-800 text-white"
                      : "bg-white border border-gray-200 text-gray-900"
                  }`}
                >
                  <div
                    className={`flex justify-between items-center border-b pb-3 ${
                      isDark ? "border-gray-800" : "border-gray-200"
                    }`}
                  >
                    <h3 className="text-base font-semibold flex items-center gap-2 text-yellow-500">
                      <Share2 size={18} />
                      {t("share_reel_title")}
                    </h3>
                    <button
                      onClick={() => setOpenShareModal(null)}
                      className={`rounded-full p-1.5 transition ${
                        isDark
                          ? "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-black"
                      }`}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      handleNativeShare(reel);
                      setOpenShareModal(null);
                    }}
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-bold py-2.5 px-4 rounded-xl flex items-center justify-between transition shadow-md"
                  >
                    <div className="flex flex-col text-right">
                      <span className="text-sm font-bold">
                        {t("share_via_any_app")}
                      </span>
                      <span className="text-[10px] text-black/80 font-normal">
                        {t("share_via_apps_desc")}
                      </span>
                    </div>
                    <Share size={18} />
                  </button>

                  <div className="flex flex-col gap-2">
                    <span
                      className={`text-xs font-medium ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {t("quick_share")}
                    </span>
                    <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `شاهد هذا الريل على Apex Talent:\n${getReelShareUrl(
                            reel.id,
                          )}`,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition ${
                          isDark
                            ? "bg-green-950/40 hover:bg-green-900/60 border-green-800/40 text-green-400"
                            : "bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center font-bold text-sm">
                          <WhatsAppIcon />
                        </div>
                        <span className="text-[10px] truncate max-w-full">
                          {t("whatsapp")}
                        </span>
                      </a>

                      <button
                        onClick={() => {
                          handleCopyLink(reel);
                          toast.info(
                            t("instagram_share_notice") ||
                              "تم نسخ رابط الريل! يمكنك لصقه ومشاركته في إنستغرام 📸",
                          );
                          if (typeof window !== "undefined") {
                            window.open("https://www.instagram.com/", "_blank");
                          }
                        }}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition ${
                          isDark
                            ? "bg-rose-950/40 hover:bg-rose-900/60 border-rose-800/40 text-rose-400"
                            : "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center font-bold text-sm">
                          <InstagramIcon />
                        </div>
                        <span className="text-[10px] truncate max-w-full">
                          {t("instagram")}
                        </span>
                      </button>

                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(
                          getReelShareUrl(reel.id),
                        )}&text=${encodeURIComponent(
                          "شاهد هذا الريل على Apex Talent",
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition ${
                          isDark
                            ? "bg-blue-950/40 hover:bg-blue-900/60 border-blue-800/40 text-blue-400"
                            : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-sm">
                          <TelegramIcon />
                        </div>
                        <span className="text-[10px] truncate max-w-full">
                          {t("telegram")}
                        </span>
                      </a>

                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                          getReelShareUrl(reel.id),
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition ${
                          isDark
                            ? "bg-indigo-950/40 hover:bg-indigo-900/60 border-indigo-800/40 text-indigo-400"
                            : "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center font-bold text-sm">
                          <FacebookIcon />
                        </div>
                        <span className="text-[10px] truncate max-w-full">
                          {t("facebook")}
                        </span>
                      </a>

                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                          getReelShareUrl(reel.id),
                        )}&text=${encodeURIComponent(
                          "شاهد هذا الريل على Apex Talent",
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition ${
                          isDark
                            ? "bg-gray-800/70 hover:bg-gray-700 border-gray-700 text-gray-300"
                            : "bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-700/30 flex items-center justify-center font-bold text-sm">
                          <XIcon />
                        </div>
                        <span className="text-[10px] truncate max-w-full">
                          {t("x_platform")}
                        </span>
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      className={`text-xs font-medium ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {t("copy_reel_link")}:
                    </label>
                    <div
                      className={`flex items-center gap-2 border rounded-xl p-1.5 pl-3 ${
                        isDark
                          ? "bg-gray-900/90 border-gray-700/80 text-gray-200"
                          : "bg-gray-50 border-gray-300 text-gray-800"
                      }`}
                    >
                      <input
                        type="text"
                        readOnly
                        value={getReelShareUrl(reel.id)}
                        className="bg-transparent text-xs flex-1 outline-none select-all text-left dir-ltr"
                      />
                      <button
                        onClick={() => handleCopyLink(reel)}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 transition shrink-0 shadow-sm"
                      >
                        {copiedReelId === reel.id ? (
                          <>
                            <Check size={14} />
                            <span>{t("copied")}</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>{t("copy")}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {openComments === reel.id && (
              <div
                onClick={() => {
                  setOpenComments(null);
                  setReplyToCommentId(null);
                  setEditCommentId(null);
                  setEditReplyId(null);
                }}
                className={`fixed inset-0 z-[100] backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer ${
                  isDark ? "bg-black/80" : "bg-white/80"
                }`}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={`w-full max-w-md mx-4 rounded-2xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col cursor-default ${
                    isDark
                      ? "bg-[#0b1329] border border-gray-800 text-white"
                      : "bg-white border border-gray-200 text-gray-900"
                  }`}
                >
                  <div
                    className={`flex justify-between items-center p-4 border-b ${
                      isDark ? "border-gray-800" : "border-gray-200"
                    }`}
                  >
                    <h3
                      className={`font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {t("comments")}
                    </h3>
                    <button
                      onClick={() => {
                        setOpenComments(null);
                        setReplyToCommentId(null);
                        setEditCommentId(null);
                        setEditReplyId(null);
                      }}
                      className={`rounded-full p-2 transition ${
                        isDark
                          ? "bg-gray-800 hover:bg-gray-700 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {comments[reel.id]?.map((comment) => (
                      <div
                        key={comment.id}
                        className={`rounded-xl p-3 ${
                          isDark ? "bg-gray-800/50" : "bg-gray-100"
                        }`}
                      >
                        {editCommentId === comment.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editCommentText}
                              onChange={(e) =>
                                setEditCommentText(e.target.value)
                              }
                              className={`flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 ${
                                isDark
                                  ? "bg-gray-700 text-white"
                                  : "bg-white text-gray-900 border border-gray-300"
                              }`}
                              autoFocus
                            />
                            <button
                              onClick={() =>
                                updateComment(
                                  comment.id,
                                  editCommentText,
                                  reel.id,
                                  false,
                                )
                              }
                              className="bg-green-500 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-green-600 transition"
                            >
                              {t("save")}
                            </button>
                            <button
                              onClick={() => {
                                setEditCommentId(null);
                                setEditCommentText("");
                              }}
                              className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                                isDark
                                  ? "bg-gray-600 hover:bg-gray-500 text-white"
                                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                              }`}
                            >
                              {t("cancel")}
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-2">
                              <UserAvatar
                                src={comment.user_image}
                                alt={comment.user_name || "User"}
                                size={24}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs font-medium ${
                                      isDark ? "text-white" : "text-gray-900"
                                    }`}
                                  >
                                    {comment.user_name || "User"}
                                  </span>
                                  {comment.role_translation && (
                                    <span className="text-yellow-400 text-[10px]">
                                      {comment.role_translation}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-start">
                              <p
                                className={`text-sm flex-1 ${
                                  isDark ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {comment.content}
                              </p>
                              <div className="flex gap-1 ml-2">
                                <button
                                  onClick={() =>
                                    toggleLikeComment(
                                      comment.id,
                                      reel.id,
                                      comment.hasLiked || false,
                                    )
                                  }
                                  className="flex items-center gap-0.5"
                                >
                                  <Heart
                                    size={14}
                                    fill={comment.hasLiked ? "red" : "none"}
                                    className={
                                      comment.hasLiked
                                        ? "text-red-500"
                                        : "text-gray-500"
                                    }
                                  />
                                  <span className="text-xs text-gray-400">
                                    {comment.likes_count || 0}
                                  </span>
                                </button>
                                {canEditDelete(comment.user_id) && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditCommentId(comment.id);
                                        setEditCommentText(comment.content);
                                      }}
                                      className="text-blue-400 p-1 hover:text-blue-300 transition"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        deleteComment(comment.id, reel.id)
                                      }
                                      className="text-red-500 p-1 hover:text-red-400 transition"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            <p
                              className={`text-xs mt-1 ${
                                isDark ? "text-gray-500" : "text-gray-400"
                              }`}
                            >
                              {new Date(
                                comment.created_at,
                              ).toLocaleDateString()}
                            </p>

                            <button
                              onClick={() =>
                                setReplyToCommentId(
                                  replyToCommentId === comment.id
                                    ? null
                                    : comment.id,
                                )
                              }
                              className="text-yellow-400 text-xs mt-2 flex items-center gap-1 hover:text-yellow-300 transition"
                            >
                              <Reply size={12} /> {t("reply")}
                            </button>

                            {replyToCommentId === comment.id && (
                              <div className="flex gap-2 mt-2">
                                <input
                                  type="text"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder={t("write_reply")}
                                  className={`flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 ${
                                    isDark
                                      ? "bg-gray-700 text-white"
                                      : "bg-white text-gray-900 border border-gray-300"
                                  }`}
                                  autoFocus
                                />
                                <button
                                  onClick={() =>
                                    addComment(reel.id, comment.id)
                                  }
                                  className="bg-yellow-400 text-black px-3 py-2 rounded-lg text-xs font-medium hover:bg-yellow-300 transition"
                                >
                                  {t("reply")}
                                </button>
                              </div>
                            )}

                            {comment.replies && comment.replies.length > 0 && (
                              <div
                                className={`ml-3 mt-2 space-y-2 border-l-2 pl-3 ${
                                  isDark ? "border-gray-700" : "border-gray-300"
                                }`}
                              >
                                {comment.replies.map((reply) => (
                                  <div
                                    key={reply.id}
                                    className={`rounded-lg p-2 ${
                                      isDark ? "bg-gray-800/30" : "bg-gray-50"
                                    }`}
                                  >
                                    {editReplyId === reply.id ? (
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={editReplyText}
                                          onChange={(e) =>
                                            setEditReplyText(e.target.value)
                                          }
                                          className={`flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none ${
                                            isDark
                                              ? "bg-gray-700 text-white"
                                              : "bg-white text-gray-900 border border-gray-300"
                                          }`}
                                          autoFocus
                                        />
                                        <button
                                          onClick={() =>
                                            updateComment(
                                              reply.id,
                                              editReplyText,
                                              reel.id,
                                              true,
                                            )
                                          }
                                          className="bg-green-500 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-green-600 transition"
                                        >
                                          {t("save")}
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditReplyId(null);
                                            setEditReplyText("");
                                          }}
                                          className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                                            isDark
                                              ? "bg-gray-600 hover:bg-gray-500 text-white"
                                              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                          }`}
                                        >
                                          {t("cancel")}
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="flex items-center gap-2 mb-1">
                                          <UserAvatar
                                            src={reply.user_image}
                                            alt={reply.user_name || "User"}
                                            size={20}
                                          />
                                          <div className="flex items-center gap-2">
                                            <span
                                              className={`text-xs font-medium ${
                                                isDark
                                                  ? "text-white"
                                                  : "text-gray-900"
                                              }`}
                                            >
                                              {reply.user_name || "User"}
                                            </span>
                                            {reply.role_translation && (
                                              <span className="text-yellow-400 text-[10px]">
                                                {reply.role_translation}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex justify-between items-start">
                                          <p
                                            className={`text-xs flex-1 ${
                                              isDark
                                                ? "text-white"
                                                : "text-gray-900"
                                            }`}
                                          >
                                            {reply.content}
                                          </p>
                                          <div className="flex gap-1">
                                            <button
                                              onClick={() =>
                                                toggleLikeComment(
                                                  reply.id,
                                                  reel.id,
                                                  reply.hasLiked || false,
                                                )
                                              }
                                              className="flex items-center gap-0.5"
                                            >
                                              <Heart
                                                size={12}
                                                fill={
                                                  reply.hasLiked
                                                    ? "red"
                                                    : "none"
                                                }
                                                className={
                                                  reply.hasLiked
                                                    ? "text-red-500"
                                                    : "text-gray-500"
                                                }
                                              />
                                              <span className="text-xs text-gray-500">
                                                {reply.likes_count || 0}
                                              </span>
                                            </button>
                                            {canEditDelete(reply.user_id) && (
                                              <>
                                                <button
                                                  onClick={() => {
                                                    setEditReplyId(reply.id);
                                                    setEditReplyText(
                                                      reply.content,
                                                    );
                                                  }}
                                                  className="text-blue-400 p-1 hover:text-blue-300 transition"
                                                >
                                                  <Edit size={12} />
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    deleteComment(
                                                      reply.id,
                                                      reel.id,
                                                    )
                                                  }
                                                  className="text-red-500 p-1 hover:text-red-400 transition"
                                                >
                                                  <Trash2 size={12} />
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                        <p
                                          className={`text-xs mt-1 ${
                                            isDark
                                              ? "text-gray-500"
                                              : "text-gray-400"
                                          }`}
                                        >
                                          {new Date(
                                            reply.created_at,
                                          ).toLocaleDateString()}
                                        </p>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                    {comments[reel.id]?.length === 0 && (
                      <p
                        className={`text-center py-8 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {t("no_comments")}
                      </p>
                    )}
                  </div>

                  <div
                    className={`p-4 border-t flex gap-2 ${
                      isDark ? "border-gray-800" : "border-gray-200"
                    }`}
                  >
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={t("add_comment")}
                      className={`flex-1 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-yellow-400 ${
                        isDark
                          ? "bg-gray-800 text-white placeholder-gray-500"
                          : "bg-gray-100 text-gray-900 placeholder-gray-400"
                      }`}
                    />
                    <button
                      onClick={() => addComment(reel.id)}
                      className="bg-yellow-400 text-black px-4 py-2 rounded-xl font-semibold text-sm hover:bg-yellow-300 transition"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="h-0 w-full shrink-0 snap-start" />
    </div>
  );
}
