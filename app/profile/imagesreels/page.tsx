"use client";

import React, { useState, ChangeEvent, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, User, Trophy, Briefcase, ShieldCheck, Image as ImageIcon } from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import useTranslate from "../../hooks/useTranslate";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import { uploadGraphQL } from "../../lib/uploadGraphQL";

import {
  UPLOAD_PHOTO,
  UPLOAD_VIDEO,
  DELETE_PHOTO,
  DELETE_VIDEO,
  INCREMENT_UPLOAD_COUNT,
  TOGGLE_REEL_STATUS,
} from "@/app/graphql/mutation/player.mutations";

import { UploadLimits } from "./components/UploadLimits";
import { BuyExtraButtons } from "./components/BuyExtraButtons";
import { PhotoSection } from "./components/PhotoSection";
import { VideoSection } from "./components/VideoSection";

interface UploadLimitsType {
  max_photos: number;
  max_videos: number;
  max_ads: number;
  uploaded_photos: number;
  uploaded_videos: number;
  uploaded_ads: number;
  remaining_photos: number;
  remaining_videos: number;
  remaining_ads: number;
  can_upload_photo: boolean;
  can_upload_video: boolean;
  can_create_ad: boolean;
}

interface PlayerPhoto {
  id: string;
  image_url: string;
}

interface PlayerVideo {
  id: string;
  video_url: string;
  title: string;
  is_reel?: boolean;
  duration_seconds?: number;
  type?: string;
}

interface Sport {
  id: string;
  name: string;
}

function getFullUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function Step({
  icon,
  active,
  isDark,
  onClick,
}: {
  icon: React.ReactNode;
  active?: boolean;
  isDark: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110 ${
        active
          ? "bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)]"
          : isDark
          ? "bg-[#0f1c3d] text-gray-400 hover:bg-[#1a2a4d]"
          : "bg-gray-200 text-gray-500 hover:bg-gray-300"
      }`}
    >
      {icon}
    </button>
  );
}

function Line({ isDark }: { isDark: boolean }) {
  return (
    <div className={`w-16 h-[2px] ${isDark ? "bg-gray-500" : "bg-gray-300"}`} />
  );
}

export default function ImagesReels() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useTranslate();
  const isDark = theme === "dark";

  const [photos, setPhotos] = useState<PlayerPhoto[]>([]);
  const [videos, setVideos] = useState<PlayerVideo[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [playerProfileId, setPlayerProfileId] = useState<string | null>(null);
  const [selectedSportId, setSelectedSportId] = useState("");
  const [limits, setLimits] = useState<UploadLimitsType | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [mainVideo, setMainVideo] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result: any = await fetchGraphQL(`
        query {
          sports { id name }
          myPhotos { id image_url }
          myVideos { id video_url title type is_reel duration_seconds }
          myUploadLimits {
            max_photos max_videos max_ads
            uploaded_photos uploaded_videos uploaded_ads
            remaining_photos remaining_videos remaining_ads
            can_upload_photo can_upload_video can_create_ad
          }
        }
      `);

      setPhotos(result?.data?.myPhotos || []);
      setVideos(result?.data?.myVideos || []);
      setSports(result?.data?.sports || []);
      setLimits(result?.data?.myUploadLimits);

      if (result?.data?.sports?.length > 0) {
        setSelectedSportId(result.data.sports[0].id);
      }
      if (result?.data?.myVideos?.length > 0) {
        setMainVideo(result.data.myVideos[0].video_url);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const incrementCounter = async (type: "photo" | "video" | "ad") => {
    try {
      const result: any = await fetchGraphQL(INCREMENT_UPLOAD_COUNT, {
        type: type.toUpperCase(),
      });

      if (result?.errors) {
        console.error("Failed to increment counter:", result.errors);
        return false;
      }
      return result?.data?.incrementUploadCount?.success || false;
    } catch (err) {
      console.error("Error incrementing counter:", err);
      return false;
    }
  };

  const handleBuyPhoto = () => {
    router.push("/purchase/extra?type=PHOTO");
  };

  const handleBuyVideo = () => {
    router.push("/purchase/extra?type=VIDEO");
  };

  const handleBuyAd = () => {
    router.push("/ad/purchase");
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if ((limits?.remaining_photos || 0) <= 0) {
      toast.error(t("Photo limit reached. Please purchase extra photos."));
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const result: any = await uploadGraphQL(UPLOAD_PHOTO, {
        file,
        input: { is_main: false, caption: "" },
      });

      if (result.errors) {
        toast.error(result.errors[0].message);
        return;
      }

      await incrementCounter("photo");
      toast.success(t("Photo uploaded successfully!"));
      await fetchData();
    } catch (err) {
      console.error(err);
      toast.error(t("Upload failed. Please try again."));
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleVideoUpload = async (
    file: File,
    title: string,
    videoType: string,
    durationSeconds?: number
  ) => {
    if ((limits?.remaining_videos || 0) <= 0) {
      toast.error(t("Video limit reached. Please purchase extra videos."));
      return;
    }

    setIsUploading(true);
    try {
      const result: any = await uploadGraphQL(UPLOAD_VIDEO, {
        file,
        input: {
          title: title || "Highlight",
          type: videoType || "HIGHLIGHT",
          sport_id: selectedSportId,
          duration_seconds: durationSeconds,
          create_reel: false,
        },
      });

      if (result.errors) {
        toast.error(result.errors[0].message);
        return;
      }

      await incrementCounter("video");
      toast.success(t("Video uploaded successfully!"));
      await fetchData();
    } catch (err) {
      console.error(err);
      toast.error(t("Upload failed. Please try again."));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, type: "image" | "video") => {
    try {
      const mutation = type === "image" ? DELETE_PHOTO : DELETE_VIDEO;
      const variables = type === "image" ? { photoId: id } : { videoId: id };
      const result: any = await fetchGraphQL(mutation, variables);

      if (result.errors) {
        toast.error(result.errors[0].message);
        return;
      }

      toast.success(t("Deleted successfully"));
      if (type === "image") {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
      } else {
        setVideos((prev) => prev.filter((v) => v.id !== id));
      }
      await fetchData();
    } catch (err) {
      console.error(err);
      toast.error(t("Delete failed"));
    }
  };

  const handleToggleReel = async (videoId: string, eventType?: string) => {
    try {
      const result: any = await fetchGraphQL(TOGGLE_REEL_STATUS, {
        id: videoId,
        eventType,
      });
      if (result.errors) {
        toast.error(result.errors[0].message);
        return;
      }
      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoId ? { ...v, is_reel: !v.is_reel } : v,
        ),
      );
      toast.success(t("Reel status updated"));
    } catch (err) {
      console.error("Error toggling reel:", err);
      toast.error(t("Failed to update reel status"));
    }
  };

  const handleSubmitProfile = async () => {
    let finalPlayerId = playerProfileId;

    if (!finalPlayerId) {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          finalPlayerId = user.playerProfile?.id || null;
        }
      } catch (err) {
        console.error("Error getting user profile:", err);
      }
    }

    if (!finalPlayerId) {
      try {
        const result: any = await fetchGraphQL(`
          query GetMyPlayerId {
            myPlayerProfile { id }
          }
        `);
        if (result.data?.myPlayerProfile?.id) {
          finalPlayerId = result.data.myPlayerProfile.id;
          setPlayerProfileId(finalPlayerId);
          try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              const user = JSON.parse(storedUser);
              if (!user.playerProfile) user.playerProfile = {};
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
      toast.error(t("Player profile not found"));
      router.push("/");
      return;
    }

    if (photos.length === 0 && videos.length === 0) {
      toast.error(t("Please upload at least one photo or video"));
      return;
    }

    toast.success(t("Profile submitted successfully!"));
    setTimeout(() => {
      router.push(`/players/${finalPlayerId}`);
    }, 1500);
  };

  return (
    <div
      className={`min-h-screen py-30 px-6 ${
        isDark ? "bg-[#020617] text-white" : "bg-gray-50 text-black"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-center text-yellow-400 mb-10">
          {t("Images & Videos")}
        </h1>

        <div className="flex items-center justify-center gap-6 mb-12">
          <Step icon={<User size={22} />} isDark={isDark} onClick={() => router.push('/profile')} />
          <Line isDark={isDark} />
          <Step icon={<Trophy size={22} />} isDark={isDark} onClick={() => router.push('/profile/football')} />
          <Line isDark={isDark} />
          <Step icon={<Briefcase size={22} />} isDark={isDark} onClick={() => router.push('/profile/clubcareer')} />
          <Line isDark={isDark} />
          <Step icon={<ShieldCheck size={22} />} isDark={isDark} onClick={() => router.push('/profile/legal-status')} />
          <Line isDark={isDark} />
          <Step active icon={<ImageIcon size={22} />} isDark={isDark} onClick={() => router.push('/profile/imagesreels')} />
        </div>

        <UploadLimits limits={limits} isDark={isDark} t={t} />

        <BuyExtraButtons
          canUploadPhoto={(limits?.remaining_photos || 0) > 0}
          canUploadVideo={(limits?.remaining_videos || 0) > 0}
          canCreateAd={limits?.can_create_ad || false}
          onBuyPhoto={handleBuyPhoto}
          onBuyVideo={handleBuyVideo}
          onBuyAd={handleBuyAd}
          isDark={isDark}
          t={t}
          isPurchasing={isPurchasing}
        />

        <PhotoSection
          photos={photos}
          canUpload={(limits?.remaining_photos || 0) > 0}
          isUploading={isUploading}
          isDark={isDark}
          onUpload={handlePhotoUpload}
          onDelete={(id) => handleDelete(id, "image")}
          getFullUrl={getFullUrl}
          t={t}
        />

        <VideoSection
          videos={videos}
          sports={sports}
          selectedSportId={selectedSportId}
          mainVideo={mainVideo}
          canUpload={(limits?.remaining_videos || 0) > 0}
          isUploading={isUploading}
          isDark={isDark}
          onSportChange={setSelectedSportId}
          onUpload={handleVideoUpload}
          onDelete={(id) => handleDelete(id, "video")}
          onSetMainVideo={setMainVideo}
          onToggleReel={handleToggleReel}
          getFullUrl={getFullUrl}
          t={t}
        />

        <div className="flex justify-between mt-14">
          <button
            onClick={() => router.back()}
            className={`px-10 py-3 rounded-2xl ${
              isDark
                ? "bg-[#1e293b] hover:bg-[#2d3a5a]"
                : "bg-gray-200 hover:bg-gray-300"
            } transition`}
          >
            {t("Previous")}
          </button>
          <button
            onClick={handleSubmitProfile}
            disabled={isUploading}
            className="px-12 py-3 rounded-2xl bg-yellow-400 text-black font-bold hover:scale-105 transition disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              t("Submit")
            )}
          </button>
        </div>
      </div>

      {(isUploading || isPurchasing) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <Loader2 className="animate-spin text-yellow-400 w-14 h-14" />
        </div>
      )}
    </div>
  );
}