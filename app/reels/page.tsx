"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Reply,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import { useAuth } from "@/app/context/auth-context";
import useTranslate from "@/app/hooks/useTranslate";
import { toast } from "sonner";
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

export default function ReelsPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { lang } = useTranslate();
  const isDark = theme === "dark";

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

  const gqlFetch = async (
    query: string,
    variables?: Record<string, unknown>,
    withAuth = false,
  ) => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "accept-language": lang || "en",
    };
    if (withAuth && token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });
    return res.json();
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
    const current = videoRefs.current[currentIndex];
    if (current) current.play().catch(() => {});
    videoRefs.current.forEach((v, i) => {
      if (v && i !== currentIndex) v.pause();
    });
  }, [currentIndex, reels]);

  useEffect(() => {
    if (reels.length > 0 && currentIndex === 0) {
      setTimeout(() => {
        videoRefs.current[0]?.play().catch(() => {});
      }, 500);
    }
  }, [reels]);

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
  toast.error("Login required 🔒");
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
            className="relative h-screen w-full  max-w-[420px] my-0 mx-auto snap-start"
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
<button
  onClick={toggleSound}
  className="absolute top-28 right-4 z-[999] text-white"
>
  {muted ? <VolumeX /> : <Volume2 />}
</button>

            <div className="absolute right-4 bottom-24 flex flex-col gap-6 z-10 text-white">
              <button
                onClick={() => toggleLike(reel.id)}
                className="flex flex-col items-center"
              >
                <Heart
                  size={26}
                  fill={isLiked ? "red" : "none"}
                  className={isLiked ? "text-red-500" : "text-white"}
                />
                <span className="text-xs">{reel.likes_count || 0}</span>
              </button>

              <button
                onClick={() => {
                  setOpenComments(reel.id);
                  fetchComments(reel.id);
                }}
                className="flex flex-col items-center"
              >
                <MessageCircle size={26} className="text-white" />
                <span className="text-xs">{commentsCount[reel.id] || 0}</span>
              </button>

              <span className="text-xs">👁 {reel.views_count || 0}</span>
              <MoreHorizontal size={22} />
            </div>

            {openComments === reel.id && (
              <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center">
                <div className="w-full max-w-md mx-4 bg-[#0a0a0f] rounded-2xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col">
                  <div className="flex justify-between items-center p-4 border-b border-gray-800">
                    <h3 className="text-white font-semibold">Comments</h3>
                    <button
                      onClick={() => {
                        setOpenComments(null);
                        setReplyToCommentId(null);
                        setEditCommentId(null);
                        setEditReplyId(null);
                      }}
                      className="bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 transition"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {comments[reel.id]?.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-gray-800/50 rounded-xl p-3"
                      >
                        {editCommentId === comment.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editCommentText}
                              onChange={(e) =>
                                setEditCommentText(e.target.value)
                              }
                              className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
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
                              className="bg-green-500 text-white px-3 py-2 rounded-lg text-xs font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditCommentId(null);
                                setEditCommentText("");
                              }}
                              className="bg-gray-600 text-white px-3 py-2 rounded-lg text-xs font-medium"
                            >
                              Cancel
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
                                  <span className="text-white text-xs font-medium">
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
                              <p className="text-white text-sm flex-1">
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
                                      className="text-blue-400 p-1"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        deleteComment(comment.id, reel.id)
                                      }
                                      className="text-red-500 p-1"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            <p className="text-gray-500 text-xs mt-1">
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
                              className="text-yellow-400 text-xs mt-2 flex items-center gap-1"
                            >
                              <Reply size={12} /> Reply
                            </button>

                            {replyToCommentId === comment.id && (
                              <div className="flex gap-2 mt-2">
                                <input
                                  type="text"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Write a reply..."
                                  className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                  autoFocus
                                />
                                <button
                                  onClick={() =>
                                    addComment(reel.id, comment.id)
                                  }
                                  className="bg-yellow-400 text-black px-3 py-2 rounded-lg text-xs font-medium"
                                >
                                  Reply
                                </button>
                              </div>
                            )}

                            {comment.replies && comment.replies.length > 0 && (
                              <div className="ml-3 mt-2 space-y-2 border-l-2 border-gray-700 pl-3">
                                {comment.replies.map((reply) => (
                                  <div
                                    key={reply.id}
                                    className="bg-gray-800/30 rounded-lg p-2"
                                  >
                                    {editReplyId === reply.id ? (
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={editReplyText}
                                          onChange={(e) =>
                                            setEditReplyText(e.target.value)
                                          }
                                          className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
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
                                          className="bg-green-500 text-white px-3 py-2 rounded-lg text-xs font-medium"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditReplyId(null);
                                            setEditReplyText("");
                                          }}
                                          className="bg-gray-600 text-white px-3 py-2 rounded-lg text-xs font-medium"
                                        >
                                          Cancel
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
                                            <span className="text-white text-xs font-medium">
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
                                          <p className="text-white text-xs flex-1">
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
                                                  className="text-blue-400 p-1"
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
                                                  className="text-red-500 p-1"
                                                >
                                                  <Trash2 size={12} />
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                        <p className="text-gray-500 text-xs mt-1">
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
                      <p className="text-gray-400 text-center py-8">
                        No comments yet
                      </p>
                    )}
                  </div>

                  <div className="p-4 border-t border-gray-800 flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-gray-800 rounded-xl px-4 py-2 text-white placeholder-gray-500 text-sm outline-none focus:ring-1 focus:ring-yellow-400"
                    />
                    <button
                      onClick={() => addComment(reel.id)}
                      className="bg-yellow-400 text-black px-4 py-2 rounded-xl font-semibold text-sm"
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
