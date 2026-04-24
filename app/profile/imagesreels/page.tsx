"use client";

import {
  User,
  Trophy,
  DollarSign,
  Image as ImageIcon,
  Plus,
  Loader2,
  X,
  ChevronDown,
} from "lucide-react";
import { useState, ChangeEvent, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "../../context/ThemeContext";
import useTranslate from "../../hooks/useTranslate";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import { uploadGraphQL } from "../../lib/uploadGraphQL";
import {
  UPLOAD_PHOTO,
  UPLOAD_VIDEO,
  DELETE_PHOTO,
  DELETE_VIDEO,
} from "@/app/graphql/mutation/player.mutations";
import { GET_MY_PHOTOS_AND_VIDEOS } from "@/app/graphql/query/player.queries";

interface Sport {
  id: string;
  name: string;
}

interface PlayerPhoto {
  id: string;
  image_url: string;
  caption?: string;
  created_at: string;
}

interface PlayerVideo {
  id: string;
  video_url: string;
  title: string;
  type: string;
  duration_seconds: number;
  created_at: string;
  is_reel?: boolean;
}

interface UserProfile {
  id: string;
  playerProfile?: {
    id: string;
  };
}

function getFullUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("blob:") || url.startsWith("http")) return url;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function ShareAsReelToggle({
  videoId,
  isReel,
  isDark,
  onToggle,
  isLoading,
  t,
}: {
  videoId: string;
  isReel: boolean;
  isDark: boolean;
  onToggle: (videoId: string) => void;
  isLoading: boolean;
  t: (key: string) => string;
}) {
  return (
    <div className="flex items-center gap-2 mt-2">
      <span
        className={`text-[11px] italic font-semibold ${
          isDark ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {t("Share as Reels")}
      </span>
      <button
        onClick={() => onToggle(videoId)}
        disabled={isLoading}
        className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none disabled:opacity-50 ${
          isReel ? "bg-green-500" : isDark ? "bg-gray-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-[3px] w-[18px] h-[18px] rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${
            isReel
              ? "translate-x-[22px] bg-white"
              : "translate-x-[3px] bg-white"
          }`}
        >
          {isLoading && (
            <Loader2 size={10} className="animate-spin text-gray-400" />
          )}
        </span>
      </button>
    </div>
  );
}

// Title Modal Component
function TitleModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  isDark,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string) => void;
  isLoading: boolean;
  isDark: boolean;
  t: (key: string) => string;
}) {
  const [title, setTitle] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!title.trim()) {
      toast.error(t("Please enter a title"));
      return;
    }
    onConfirm(title.trim());
    setTitle("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${
          isDark ? "bg-[#0b1736] border border-[#1e2d5a]" : "bg-white"
        }`}
      >
        <h2
          className={`text-xl font-bold mb-4 ${
            isDark ? "text-white" : "text-gray-800"
          }`}
        >
          {t("Enter Video Title")}
        </h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("Video title...")}
          className={`w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-400 transition-all ${
            isDark
              ? "bg-[#0b1736] border border-[#1e2d5a] text-white placeholder-gray-500"
              : "bg-white border border-gray-300 text-black placeholder-gray-400"
          }`}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConfirm();
            if (e.key === "Escape") onClose();
          }}
        />
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className={`flex-1 py-2 rounded-xl transition ${
              isDark
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-200 text-black hover:bg-gray-300"
            }`}
          >
            {t("Cancel")}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 py-2 rounded-xl bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition disabled:opacity-50"
          >
            {isLoading ? t("Uploading...") : t("Upload")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ImagesReels() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t, lang } = useTranslate();

  const [video, setVideo] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PlayerPhoto[]>([]);
  const [reels, setReels] = useState<PlayerVideo[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSportId, setSelectedSportId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [togglingReelId, setTogglingReelId] = useState<string | null>(null);
  const [playerProfileId, setPlayerProfileId] = useState<string | null>(null);
  const [hasNewUploads, setHasNewUploads] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingVideoFile, setPendingVideoFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const result = await fetchGraphQL<{
          sports: Sport[];
          myPhotos: PlayerPhoto[];
          myVideos: PlayerVideo[];
        }>(GET_MY_PHOTOS_AND_VIDEOS);

        if (result.data) {
          const fetchedSports = result.data.sports || [];
          setSports(fetchedSports);
          if (fetchedSports.length > 0) {
            setSelectedSportId(fetchedSports[0].id.toString());
          }
          setPhotos(result.data.myPhotos || []);
          setReels(result.data.myVideos || []);
          if (result.data.myVideos?.length > 0) {
            setVideo(result.data.myVideos[0].video_url);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingPage(false);
      }
    };

    const getUserProfile = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user: UserProfile = JSON.parse(storedUser);
          if (user.playerProfile?.id) {
            setPlayerProfileId(user.playerProfile.id);
          }
        }
      } catch (err) {
        console.error("Error getting user profile:", err);
      }
    };

    getUserProfile();
    fetchInitialData();
  }, [lang]);

  const handleToggleReel = async (videoId: string) => {
    setTogglingReelId(videoId);

    try {
      const result = await fetchGraphQL<{
        toggleVideoReelStatus: { is_reel: boolean };
      }>(
        `mutation ToggleReel($videoId: String!) {
          toggleVideoReelStatus(videoId: $videoId) {
            is_reel
          }
        }`,
        { videoId },
      );

      if (result.errors) {
        toast.error(result.errors[0].message);
      } else if (result.data) {
        const newIsReel = result.data.toggleVideoReelStatus.is_reel;
        setReels((prev) =>
          prev.map((v) =>
            v.id === videoId ? { ...v, is_reel: newIsReel } : v,
          ),
        );
        toast.success(
          newIsReel ? t("Added to Reels!") : t("Removed from Reels"),
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(t("Failed to update reel status"));
    } finally {
      setTogglingReelId(null);
    }
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    const tempId = `temp-${Date.now()}`;
    const tempPhoto = {
      id: tempId,
      image_url: localUrl,
      caption: "",
      created_at: "",
    } as PlayerPhoto;
    setPhotos((prev) => [...prev, tempPhoto]);

    setIsUploading(true);
    const tid = toast.loading(t("Uploading photo..."));

    try {
      const result = await uploadGraphQL<{ uploadPlayerPhoto: PlayerPhoto }>(
        UPLOAD_PHOTO,
        { file, input: { is_main: false, caption: "" } },
      );

      if (result.errors) throw new Error(result.errors[0].message);

      if (result.data?.uploadPlayerPhoto) {
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === tempId ? result.data!.uploadPlayerPhoto : p,
          ),
        );
        setHasNewUploads(true);
        toast.success(t("Photo uploaded!"), { id: tid });
      }
    } catch (err) {
      setPhotos((prev) => prev.filter((p) => p.id !== tempId));
      toast.error(err instanceof Error ? err.message : t("Upload failed"), {
        id: tid,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error(t("Video is too large. Max 50MB allowed."));
      return;
    }

    if (!selectedSportId) {
      toast.error(t("Please select a sport from the dropdown first"));
      return;
    }

    setPendingVideoFile(file);
    setIsModalOpen(true);
  };

  const handleVideoUploadWithTitle = async (title: string) => {
    if (!pendingVideoFile) return;

    const file = pendingVideoFile;
    const localUrl = URL.createObjectURL(file);
    const tempId = `v-${Date.now()}`;
    const tempVideo = {
      id: tempId,
      video_url: localUrl,
      title: title,
      type: "HIGHLIGHT",
      duration_seconds: 0,
      created_at: "",
      is_reel: false,
    } as PlayerVideo;

    setReels((prev) => [...prev, tempVideo]);
    setVideo(localUrl);
    setIsModalOpen(false);
    setIsUploading(true);
    const tid = toast.loading(t("Uploading video..."));

    try {
      const result = await uploadGraphQL<{ uploadPlayerVideo: PlayerVideo }>(
        UPLOAD_VIDEO,
        {
          file,
          input: {
            title: title,
            type: "HIGHLIGHT",
            sport_id: selectedSportId,
            duration_seconds: Math.floor(file.size / (1024 * 1024)) || 30,
            create_reel: false,
          },
        },
      );

      if (result.errors) throw new Error(result.errors[0].message);

      if (result.data?.uploadPlayerVideo) {
        const newVideo = result.data.uploadPlayerVideo;
        setReels((prev) => prev.map((v) => (v.id === tempId ? newVideo : v)));
        setVideo(newVideo.video_url);
        setHasNewUploads(true);
        toast.success(t("Video uploaded!"), { id: tid });
        setTimeout(() => {
          toast.info(
            t(
              "Video is being processed. You can create reels in a few moments.",
            ),
          );
        }, 1000);
      }
    } catch (err) {
      setReels((prev) => prev.filter((v) => v.id !== tempId));
      setVideo(reels.length > 0 ? reels[0].video_url : null);
      toast.error(err instanceof Error ? err.message : t("Upload failed"), {
        id: tid,
      });
    } finally {
      setIsUploading(false);
      setPendingVideoFile(null);
    }
  };

  const handleDelete = async (id: string, type: "image" | "video") => {
    const mutation = type === "image" ? DELETE_PHOTO : DELETE_VIDEO;
    const variables = type === "image" ? { photoId: id } : { videoId: id };

    try {
      const result = await fetchGraphQL(mutation, variables);
      if (result.errors) throw new Error(result.errors[0].message);

      if (type === "image") {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
      } else {
        setReels((prev) => {
          const remainingReels = prev.filter((v) => v.id !== id);
          if (video === prev.find((v) => v.id === id)?.video_url) {
            setVideo(
              remainingReels.length > 0 ? remainingReels[0].video_url : null,
            );
          }
          return remainingReels;
        });
      }
      toast.success(t("Deleted successfully"));
    } catch (err) {
      console.error(err);
      toast.error(t("Delete failed"));
    }
  };

  const handleSubmitProfile = async () => {
    let finalPlayerId = playerProfileId;

    if (!finalPlayerId) {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user: UserProfile = JSON.parse(storedUser);
          finalPlayerId = user.playerProfile?.id || null;
        }
      } catch (err) {
        console.error("Error getting user profile:", err);
      }
    }

    if (!finalPlayerId) {
      try {
        const result = await fetchGraphQL<{ myPlayerProfile: { id: string } }>(
          `query GetMyPlayerId {
          myPlayerProfile {
            id
          }
        }`,
        );
        if (result.data?.myPlayerProfile?.id) {
          finalPlayerId = result.data.myPlayerProfile.id;
          try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              const user = JSON.parse(storedUser);
              if (!user.playerProfile) {
                user.playerProfile = {};
              }
              user.playerProfile.id = finalPlayerId;
              localStorage.setItem("user", JSON.stringify(user));
            }
          } catch (e) {
            console.error("Failed to update localStorage:", e);
          }
        }
      } catch (err) {
        console.error("Failed to fetch player ID:", err);
      }
    }

    if (!finalPlayerId) {
      toast.error("Player profile not found");
      router.push("/");
      return;
    }

    if (!hasNewUploads) {
      router.push(`/players/${finalPlayerId}`);
      return;
    }

    toast.success(t("Profile submitted successfully!"));

    setTimeout(() => {
      router.push(`/players/${finalPlayerId}`);
    }, 1500);
  };

  const isDark = theme === "dark";

  if (isLoadingPage) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-[#020617]" : "bg-gray-50"
        }`}
      >
        <Loader2
          className={`animate-spin ${
            isDark ? "text-yellow-400" : "text-yellow-600"
          } w-12 h-12`}
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-32 ${
        isDark ? "bg-[#020617] text-white" : "bg-gray-50 text-black"
      }`}
    >
      {/* Title Modal */}
      <TitleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPendingVideoFile(null);
        }}
        onConfirm={handleVideoUploadWithTitle}
        isLoading={isUploading}
        isDark={isDark}
        t={t}
      />

      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-center text-3xl font-bold mb-10 text-yellow-400">
          {t("Images & Reels")}
        </h1>

        <div className="flex justify-center items-center gap-6 mb-10">
          <Step icon={<User />} isDark={isDark} />
          <Line isDark={isDark} />
          <Step icon={<Trophy />} isDark={isDark} />
          <Line isDark={isDark} />
          <Step icon={<DollarSign />} isDark={isDark} />
          <Line isDark={isDark} />
          <Step active icon={<ImageIcon />} isDark={isDark} />
        </div>

        <h3
          className={`font-semibold mb-6 ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {t("Photos")}
        </h3>
        <div className="flex gap-6 mb-16 flex-wrap items-center">
          {photos.map((p) => (
            <PhotoCard
              key={p.id}
              img={p.image_url}
              onDelete={() => handleDelete(p.id, "image")}
              isDark={isDark}
            />
          ))}
          <label
            className={`w-24 h-24 rounded-full border-2 border-transparent flex items-center justify-center cursor-pointer hover:border-slate-800 hover:bg-slate-900/50 transition-all ${
              isDark ? "bg-[#0b1120]" : "bg-gray-100"
            }`}
          >
            <Plus size={30} className="text-blue-500" />
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h3
            className={`font-semibold ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {t("Reels & Highlights")}
          </h3>
          <div className="relative w-64">
            <label
              className={`absolute -top-2 left-2 px-1 text-[10px] z-10 ${
                isDark
                  ? "bg-[#020617] text-gray-500"
                  : "bg-gray-50 text-gray-500"
              }`}
            >
              {t("Target Sport")}
            </label>
            <select
              value={selectedSportId}
              onChange={(e) => setSelectedSportId(e.target.value)}
              className={`w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-400 appearance-none transition-all cursor-pointer ${
                isDark
                  ? "bg-[#0b1736] border border-[#1e2d5a] text-white"
                  : "bg-white border border-gray-300 text-black"
              }`}
            >
              {sports.map((s) => (
                <option
                  key={s.id}
                  value={s.id.toString()}
                  className={isDark ? "bg-[#0b1736]" : "bg-white"}
                >
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-3.5 text-gray-500 pointer-events-none"
              size={16}
            />
          </div>
        </div>

        <div
          className={`w-full h-[450px] rounded-2xl overflow-hidden mb-6 relative border ${
            isDark ? "bg-black border-[#1e293b]" : "bg-gray-900 border-gray-200"
          }`}
        >
          {video ? (
            <video
              src={getFullUrl(video)}
              controls
              className="w-full h-full object-contain"
              key={video}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
              <ImageIcon size={48} className="mb-2 opacity-20" />
              <p className="text-sm">{t("No video selected")}</p>
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
              <Loader2 className="animate-spin text-yellow-400 w-10 h-10" />
            </div>
          )}
          {!video && !isUploading && (
            <label className="absolute inset-0 flex items-center justify-center cursor-pointer group">
              <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                <Plus size={32} className="text-black" />
              </div>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="flex items-start gap-6 flex-wrap mb-10">
          {reels.map((r) => (
            <div key={r.id} className="flex flex-col items-start">
              <div className="relative group">
                <div
                  onClick={() => setVideo(r.video_url)}
                  className={`w-32 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    video === r.video_url
                      ? "border-yellow-400"
                      : isDark
                      ? "border-[#1e293b]"
                      : "border-gray-300"
                  }`}
                >
                  <video
                    src={getFullUrl(r.video_url)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(r.id, "video");
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X size={14} />
                </button>
              </div>
              <p
                className={`text-xs mt-1 max-w-[128px] truncate ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
                title={r.title}
              >
                {r.title}
              </p>
              <ShareAsReelToggle
                videoId={r.id}
                isReel={r.is_reel ?? false}
                isDark={isDark}
                onToggle={handleToggleReel}
                isLoading={togglingReelId === r.id}
                t={t}
              />
            </div>
          ))}
          <label
            className={`w-20 h-20 rounded-full border-2 border-transparent flex items-center justify-center cursor-pointer hover:border-slate-800 hover:bg-slate-900/50 transition-all ${
              isDark ? "bg-[#0b1120]" : "bg-gray-100"
            }`}
          >
            <Plus size={24} className="text-blue-500" />
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>

        <div className="flex justify-between mt-12 pt-8 border-t border-[#1e293b]">
          <button
            onClick={() => router.back()}
            className={`px-10 py-3 rounded-xl border transition-colors ${
              isDark
                ? "border-[#1e293b] hover:bg-[#1e293b]"
                : "border-gray-300 hover:bg-gray-100"
            }`}
          >
            {t("Previous")}
          </button>
          <button
            onClick={handleSubmitProfile}
            className="bg-yellow-400 text-black px-12 py-3 rounded-xl font-bold hover:bg-yellow-500 shadow-lg"
          >
            {t("Submit Profile")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({
  icon,
  active,
  isDark,
}: {
  icon: React.ReactNode;
  active?: boolean;
  isDark: boolean;
}) {
  return (
    <div
      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
        active
          ? "bg-yellow-400 text-black scale-110 shadow-lg"
          : isDark
          ? "bg-[#0b1120] text-gray-500 border border-[#1e293b]"
          : "bg-gray-200 text-gray-500 border border-gray-300"
      }`}
    >
      {icon}
    </div>
  );
}

function Line({ isDark }: { isDark: boolean }) {
  return (
    <div
      className={`w-16 h-[2px] ${isDark ? "bg-[#1e293b]" : "bg-gray-300"}`}
    />
  );
}

function PhotoCard({
  img,
  onDelete,
  isDark,
}: {
  img: string;
  onDelete: () => void;
  isDark: boolean;
}) {
  return (
    <div
      className={`w-32 h-32 rounded-2xl overflow-hidden relative shadow-xl group ${
        isDark
          ? "border border-[#1e293b] bg-[#0b1120]"
          : "border border-gray-200 bg-gray-100"
      }`}
    >
      <Image
        src={getFullUrl(img)}
        alt="Player"
        fill
        className="object-cover transition-transform group-hover:scale-110"
        sizes="128px"
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <X size={16} />
      </button>
    </div>
  );
}
