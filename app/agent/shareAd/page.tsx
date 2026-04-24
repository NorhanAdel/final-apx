"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  ImagePlus,
  Video,
  X,
  Edit,
  Trash2,
  AlertTriangle,
  Play,
} from "lucide-react";
import Image from "next/image";
import {
  CREATE_AD_WITH_IMAGE,
  CREATE_AD_WITH_VIDEO,
  UPDATE_AD,
  DELETE_AD,
} from "@/app/graphql/mutation/ad.mutations";
import { GET_MY_ADS } from "@/app/graphql/query/ad.queries";
import { toast } from "sonner";
import useTranslate from "@/app/hooks/useTranslate";
import { useTheme } from "@/app/context/ThemeContext";
import { uploadGraphQL } from "@/app/lib/uploadGraphQL";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";

interface Ad {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  video_url?: string;
  target_role?: string;
  status: string;
  views_count: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

function getFullUrl(url: string | undefined): string {
  if (!url) return "";
  if (url.startsWith("blob:") || url.startsWith("http")) return url;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDark,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDark: boolean;
  t: (key: string) => string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-xl p-6 shadow-xl ${
          isDark ? "bg-[#0a0f2c] border border-[#1e2a5a]" : "bg-white"
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <h3
            className={`text-xl font-semibold ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            {t("Delete Ad")}
          </h3>
        </div>

        <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          {t(
            "Are you sure you want to delete this ad? This action cannot be undone.",
          )}
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md transition ${
              isDark
                ? "bg-[#1e2a5a] text-white hover:bg-[#2a3a7a]"
                : "bg-gray-200 text-black hover:bg-gray-300"
            }`}
          >
            {t("Cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md transition bg-red-500 text-white hover:bg-red-600"
          >
            {t("Delete")}
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoPreviewModal({
  isOpen,
  onClose,
  videoUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string | null;
  isDark: boolean;
}) {
  if (!isOpen || !videoUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full mx-4 rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition-all duration-200"
        >
          <X size={20} />
        </button>
        <video
          src={getFullUrl(videoUrl)}
          controls
          autoPlay
          className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
          controlsList="nodownload"
        >
          <source src={getFullUrl(videoUrl)} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}

export default function ShareAdPage() {
  const { theme } = useTheme();
  const { t } = useTranslate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  const imageFileRef = useRef<HTMLInputElement | null>(null);
  const videoFileRef = useRef<HTMLInputElement | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [myAds, setMyAds] = useState<Ad[]>([]);
  const [showMyAds, setShowMyAds] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<string | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  const fetchMyAds = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchGraphQL<{ myAds: Ad[] }>(GET_MY_ADS);
      if (result.data?.myAds) {
        setMyAds(result.data.myAds);
      }
    } catch (error) {
      console.error("Error fetching my ads:", error);
      toast.error(t("Failed to load your ads"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchMyAds();
  }, [fetchMyAds]);

  const handleImageClick = () => {
    imageFileRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clear video if exists
      if (videoFile || videoPreview) {
        setVideoFile(null);
        setVideoPreview(null);
        if (videoFileRef.current) videoFileRef.current.value = "";
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setMediaType("image");
    }
  };

  const handleVideoClick = () => {
    videoFileRef.current?.click();
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clear image if exists
      if (imageFile || imagePreview) {
        setImageFile(null);
        setImagePreview(null);
        if (imageFileRef.current) imageFileRef.current.value = "";
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setMediaType("video");
    }
  };

  const clearFiles = () => {
    setImageFile(null);
    setImagePreview(null);
    setVideoFile(null);
    setVideoPreview(null);
    if (imageFileRef.current) imageFileRef.current.value = "";
    if (videoFileRef.current) videoFileRef.current.value = "";
  };

const handleCreateAd = async () => {
  if (!title.trim()) {
    toast.error(t("Please enter a title"));
    return;
  }

  if (!imageFile && !videoFile) {
    toast.error(t("Please add an image or video"));
    return;
  }

  setLoading(true);

  try {
    const input = {
      title: title.trim(),
      description: description.trim() || undefined,
      target_role: targetRole || undefined,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
    };

    let result;

    if (imageFile) {
      result = await uploadGraphQL<{ createAd: Ad }>(CREATE_AD_WITH_IMAGE, {
        image: imageFile,
        input,
      });
    } else if (videoFile) {
      result = await uploadGraphQL<{ createAd: Ad }>(CREATE_AD_WITH_VIDEO, {
        video: videoFile,
        input,
      });
    } else {
      toast.error(t("Please add an image or video"));
      setLoading(false);
      return;
    }

    if (result.data?.createAd) {
      toast.success(t("Ad created successfully! Waiting for admin approval"));
      setTitle("");
      setDescription("");
      setTargetRole("");
      setExpiresAt("");
      clearFiles();
      await fetchMyAds();
    } else if (result.errors) {
      toast.error(result.errors[0].message);
    }
  } catch (error) {
    console.error("Error creating ad:", error);
    toast.error(t("Failed to create ad"));
  } finally {
    setLoading(false);
  }
};

const handleUpdateAd = async () => {
  if (!editingAd || !title.trim()) {
    toast.error(t("Please enter a title"));
    return;
  }

  setLoading(true);

  try {
    const input: Record<string, unknown> = {
      title: title.trim(),
    };
    if (description.trim()) input.description = description.trim();
    if (targetRole) input.target_role = targetRole;
    if (expiresAt) input.expires_at = new Date(expiresAt).toISOString();

    const result = await fetchGraphQL<{ updateAd: Ad }>(UPDATE_AD, {
      adId: editingAd.id,
      input,
    });

    if (result.data?.updateAd) {
      toast.success(t("Ad updated successfully! Resubmitted for approval"));
      setEditingAd(null);
      setTitle("");
      setDescription("");
      setTargetRole("");
      setExpiresAt("");
      await fetchMyAds();
    } else if (result.errors) {
      toast.error(result.errors[0].message);
    }
  } catch (error) {
    console.error("Error updating ad:", error);
    toast.error(t("Failed to update ad"));
  } finally {
    setLoading(false);
  }
};

  const handleDeleteClick = (adId: string) => {
    setAdToDelete(adId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!adToDelete) return;

    setDeleteModalOpen(false);
    setLoading(true);

    try {
      const result = await fetchGraphQL<{ deleteAd: boolean }>(DELETE_AD, {
        adId: adToDelete,
      });

      if (result.data?.deleteAd) {
        toast.success(t("Ad deleted successfully"));
        await fetchMyAds();
      } else if (result.errors) {
        toast.error(result.errors[0].message);
      }
    } catch (error) {
      console.error("Error deleting ad:", error);
      toast.error(t("Failed to delete ad"));
    } finally {
      setLoading(false);
      setAdToDelete(null);
    }
  };

  const handleEditAd = (ad: Ad) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setDescription(ad.description || "");
    setTargetRole(ad.target_role || "");
    setExpiresAt(ad.expires_at?.split("T")[0] || "");
    setShowMyAds(false);
    // Clear any files when editing
    clearFiles();
  };

  const cancelEdit = () => {
    setEditingAd(null);
    setTitle("");
    setDescription("");
    setTargetRole("");
    setExpiresAt("");
    clearFiles();
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("pending")) return "text-yellow-500";
    if (lowerStatus.includes("active")) return "text-green-500";
    if (lowerStatus.includes("rejected")) return "text-red-500";
    if (lowerStatus.includes("expired")) return "text-gray-500";
    return "text-gray-400";
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex py-20 items-center justify-center px-4 sm:px-6 transition
      ${isDark ? "bg-[#020617] text-white" : "bg-[#f9fafb] text-black"}`}
    >
      <div className="w-full max-w-3xl py-12">
        <h1
          className={`text-center text-2xl sm:text-3xl font-bold mb-8
          ${isDark ? "text-yellow-400" : "text-[#F0B100]"}`}
        >
          {editingAd ? t("Edit Ad") : t("Share AD")}
        </h1>

        <div className="flex gap-4 mb-6 justify-center">
          <button
            onClick={() => {
              setShowMyAds(false);
              cancelEdit();
            }}
            className={`px-4 py-2 rounded-md transition ${
              !showMyAds && !editingAd
                ? isDark
                  ? "bg-yellow-400 text-black"
                  : "bg-[#F0B100] text-black"
                : isDark
                ? "bg-[#0a0f2c] text-gray-400 hover:text-white"
                : "bg-gray-200 text-gray-600 hover:text-black"
            }`}
          >
            {t("Create New")}
          </button>
          <button
            onClick={() => {
              setShowMyAds(true);
              setEditingAd(null);
              fetchMyAds();
            }}
            className={`px-4 py-2 rounded-md transition ${
              showMyAds && !editingAd
                ? isDark
                  ? "bg-yellow-400 text-black"
                  : "bg-[#F0B100] text-black"
                : isDark
                ? "bg-[#0a0f2c] text-gray-400 hover:text-white"
                : "bg-gray-200 text-gray-600 hover:text-black"
            }`}
          >
            {t("My Ads")}
          </button>
        </div>

        {!showMyAds && (
          <div className="flex flex-col gap-6">
            {/* Media Type Toggle */}
            <div className="flex gap-4 mb-2">
              <button
                type="button"
                onClick={() => setMediaType("image")}
                className={`flex-1 py-2 rounded-md transition ${
                  mediaType === "image"
                    ? isDark
                      ? "bg-yellow-400 text-black"
                      : "bg-[#F0B100] text-black"
                    : isDark
                    ? "bg-[#0a0f2c] text-gray-400 hover:text-white"
                    : "bg-gray-200 text-gray-600 hover:text-black"
                }`}
              >
                <ImagePlus size={18} className="inline mr-2" />
                {t("Image")}
              </button>
              <button
                type="button"
                onClick={() => setMediaType("video")}
                className={`flex-1 py-2 rounded-md transition ${
                  mediaType === "video"
                    ? isDark
                      ? "bg-yellow-400 text-black"
                      : "bg-[#F0B100] text-black"
                    : isDark
                    ? "bg-[#0a0f2c] text-gray-400 hover:text-white"
                    : "bg-gray-200 text-gray-600 hover:text-black"
                }`}
              >
                <Video size={18} className="inline mr-2" />
                {t("Video")}
              </button>
            </div>

            {/* Image Upload */}
            {mediaType === "image" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("Image")} *
                </label>
                <div
                  onClick={handleImageClick}
                  className={`border rounded-xl h-[200px] flex items-center justify-center cursor-pointer relative overflow-hidden transition
                  ${
                    isDark
                      ? "border-yellow-400"
                      : "border-gray-300 bg-white shadow"
                  }`}
                >
                  {imagePreview ? (
                    <>
                      <Image
                        src={imagePreview}
                        alt="preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageFile(null);
                          setImagePreview(null);
                          if (imageFileRef.current)
                            imageFileRef.current.value = "";
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-gray-500">
                      <ImagePlus size={40} />
                      <p className="mt-2 text-sm">
                        {t("Click to upload image")}
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={imageFileRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* Video Upload */}
            {mediaType === "video" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("Video")} *
                </label>
                <div
                  onClick={handleVideoClick}
                  className={`border rounded-xl h-[200px] flex items-center justify-center cursor-pointer relative overflow-hidden transition
                  ${
                    isDark
                      ? "border-yellow-400"
                      : "border-gray-300 bg-white shadow"
                  }`}
                >
                  {videoPreview ? (
                    <>
                      <video
                        src={videoPreview}
                        className="w-full h-full object-cover"
                        controls
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setVideoFile(null);
                          setVideoPreview(null);
                          if (videoFileRef.current)
                            videoFileRef.current.value = "";
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-gray-500">
                      <Video size={40} />
                      <p className="mt-2 text-sm">
                        {t("Click to upload video")}
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={videoFileRef}
                    onChange={handleVideoChange}
                    accept="video/*"
                    className="hidden"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                {t("Title")} *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("Enter ad title")}
                className={`w-full rounded-lg px-4 py-3 outline-none border transition
                ${
                  isDark
                    ? "bg-[#0a0f2c] border-[#1e2a5a] text-white focus:border-yellow-400"
                    : "bg-white border-gray-300 text-black shadow-sm focus:border-[#F0B100]"
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t("Description")}
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("Describe your ad")}
                className={`w-full rounded-lg px-4 py-3 outline-none border resize-none transition
                ${
                  isDark
                    ? "bg-[#0a0f2c] border-[#1e2a5a] text-white focus:border-yellow-400"
                    : "bg-white border-gray-300 text-black shadow-sm focus:border-[#F0B100]"
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t("Target Audience")}
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className={`w-full rounded-lg px-4 py-3 outline-none border transition
                ${
                  isDark
                    ? "bg-[#0a0f2c] border-[#1e2a5a] text-white focus:border-yellow-400"
                    : "bg-white border-gray-300 text-black shadow-sm focus:border-[#F0B100]"
                }`}
              >
                <option value="">{t("All")}</option>
                <option value="PLAYER">{t("Player")}</option>
                <option value="SCOUT">{t("Scout")}</option>
                <option value="AGENT">{t("Agent")}</option>
                <option value="CLUB">{t("Club")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t("Expiry Date")}
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className={`w-full rounded-lg px-4 py-3 outline-none border transition
                ${
                  isDark
                    ? "bg-[#0a0f2c] border-[#1e2a5a] text-white focus:border-yellow-400"
                    : "bg-white border-gray-300 text-black shadow-sm focus:border-[#F0B100]"
                }`}
              />
            </div>

            <div className="flex gap-4">
              {editingAd && (
                <button
                  onClick={cancelEdit}
                  className="flex-1 h-[50px] flex items-center justify-center gap-2 font-semibold rounded-md transition bg-gray-500 text-white hover:bg-gray-600"
                >
                  {t("Cancel")}
                </button>
              )}
              <button
                onClick={editingAd ? handleUpdateAd : handleCreateAd}
                disabled={loading}
                className={`flex-1 h-[50px] flex items-center justify-center gap-2 font-semibold rounded-md transition
                ${
                  isDark
                    ? "bg-[#081f4d] border border-yellow-400 text-white hover:bg-[#0b2b6b]"
                    : "bg-[#F0B100] text-black hover:bg-yellow-500"
                }`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <span>{editingAd ? t("Update Ad") : t("Share AD")}</span>
                )}
              </button>
            </div>
          </div>
        )}

        {showMyAds && (
          <div className="flex flex-col gap-4">
            {loading && (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent" />
              </div>
            )}

            {!loading && myAds.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                {t("No ads found")}
              </div>
            )}

            {myAds.map((ad) => (
              <div
                key={ad.id}
                className={`p-4 rounded-lg transition
                ${
                  isDark
                    ? "bg-[#0a0f2c] border border-[#1e2a5a]"
                    : "bg-white border border-gray-200 shadow"
                }`}
              >
                <div className="flex gap-4">
                  <div
                    className="w-24 h-24 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer relative group"
                    onClick={() => {
                      if (ad.video_url) {
                        setSelectedVideoUrl(ad.video_url);
                        setVideoModalOpen(true);
                      }
                    }}
                  >
                    {ad.image_url ? (
                      <Image
                        src={getFullUrl(ad.image_url)}
                        alt={ad.title}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : ad.video_url ? (
                      <>
                        <video
                          src={getFullUrl(ad.video_url)}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={24} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                        <ImagePlus size={24} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{ad.title}</h3>
                    {ad.description && (
                      <p
                        className={`text-sm mt-1 ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {ad.description.substring(0, 100)}...
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs">
                      <span
                        className={`${getStatusColor(ad.status)} font-medium`}
                      >
                        {ad.status}
                      </span>
                      {ad.target_role && (
                        <span
                          className={isDark ? "text-gray-400" : "text-gray-500"}
                        >
                          🎯 {ad.target_role}
                        </span>
                      )}
                      <span
                        className={isDark ? "text-gray-400" : "text-gray-500"}
                      >
                        👁️ {ad.views_count} {t("views")}
                      </span>
                      <span
                        className={isDark ? "text-gray-400" : "text-gray-500"}
                      >
                        📅 {new Date(ad.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {ad.status !== "ACTIVE" && ad.status !== "Active" && (
                      <button
                        onClick={() => handleEditAd(ad)}
                        className={`p-2 rounded-md transition
                        ${
                          isDark
                            ? "hover:bg-yellow-400/20"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <Edit size={18} className="text-yellow-500" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteClick(ad.id)}
                      className={`p-2 rounded-md transition
                      ${isDark ? "hover:bg-red-500/20" : "hover:bg-gray-100"}`}
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setAdToDelete(null);
        }}
        onConfirm={confirmDelete}
        isDark={isDark}
        t={t}
      />

      <VideoPreviewModal
        isOpen={videoModalOpen}
        onClose={() => {
          setVideoModalOpen(false);
          setSelectedVideoUrl(null);
        }}
        videoUrl={selectedVideoUrl}
        isDark={isDark}
      />
    </div>
  );
}
