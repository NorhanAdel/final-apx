"use client";

import {
  Plus,
  X,
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  MoreVertical,
  Repeat,
  Upload,
  Film,
  Type,
} from "lucide-react";
import { ChangeEvent, useRef, useState, useEffect, useCallback } from "react";

interface Sport {
  id: string;
  name: string;
}

interface PlayerVideo {
  id: string;
  video_url: string;
  title: string;
  is_reel?: boolean;
  duration_seconds?: number;
  type?: string;
}

interface Props {
  videos: PlayerVideo[];
  sports: Sport[];
  selectedSportId: string;
  mainVideo: string | null;
  canUpload: boolean;
  isUploading: boolean;
  isDark: boolean;
  onSportChange: (id: string) => void;
  onUpload: (file: File, title: string) => void;
  onDelete: (id: string) => void;
  onSetMainVideo: (url: string) => void;
  onToggleReel: (videoId: string) => void;
  getFullUrl: (url: string) => string;
  t: (key: string) => string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoSection({
  videos,
  sports,
  selectedSportId,
  mainVideo,
  canUpload,
  isUploading,
  isDark,
  onSportChange,
  onUpload,
  onDelete,
  onSetMainVideo,
  onToggleReel,
  getFullUrl,
  t,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isLooping, setIsLooping] = useState(false);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadSubmit = () => {
    if (!selectedFile) return;
    onUpload(selectedFile, uploadTitle);
    setShowUploadModal(false);
    setUploadTitle("");
    setSelectedFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setUploadTitle("");
    setSelectedFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const activeVideo = videos.find((v) => v.video_url === mainVideo);

  // Reset state when video source changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setShowOverlay(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, [mainVideo]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      setShowOverlay(false);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowOverlay(true);
    }
  };

  const handleVideoClick = () => {
    togglePlay();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = ratio * duration;
  };

  const skipPrev = () => {
    const idx = videos.findIndex((v) => v.video_url === mainVideo);
    if (idx > 0) {
      onSetMainVideo(videos[idx - 1].video_url);
    }
  };

  const skipNext = () => {
    const idx = videos.findIndex((v) => v.video_url === mainVideo);
    if (idx < videos.length - 1) {
      onSetMainVideo(videos[idx + 1].video_url);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const toggleLoop = () => {
    if (videoRef.current) {
      videoRef.current.loop = !videoRef.current.loop;
      setIsLooping(!isLooping);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Sport Selection */}
      <div className="mb-6 relative w-64">
        <select
          value={selectedSportId}
          onChange={(e) => onSportChange(e.target.value)}
          className={`w-full rounded-xl px-4 py-3 appearance-none outline-none text-sm font-medium ${
            isDark
              ? "bg-[#0b1736] border border-[#1e2d5a] text-white"
              : "bg-white border border-gray-300 text-black"
          }`}
        >
          {sports.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-4 text-gray-400 pointer-events-none"
        />
      </div>

      {/* Main Video Player */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden mb-8 border ${
          isDark
            ? "bg-[#0a0a0a] border-[#1e293b]/50"
            : "bg-black border-gray-300"
        }`}
        style={{ aspectRatio: "16/9", maxHeight: "500px" }}
      >
        {mainVideo ? (
          <>
            <video
              ref={videoRef}
              src={getFullUrl(mainVideo)}
              className="w-full h-full object-contain cursor-pointer"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => {
                setIsPlaying(false);
                setShowOverlay(true);
              }}
              onClick={handleVideoClick}
              playsInline
            />

            {/* Play overlay */}
            {showOverlay && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20"
                onClick={handleVideoClick}
              >
                <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.3)] hover:scale-110 transition-transform duration-200">
                  <Play size={28} className="text-black ml-1" fill="black" />
                </div>
              </div>
            )}

            {/* Title overlay at bottom */}
            {activeVideo && showOverlay && (
              <div className="absolute bottom-14 left-0 right-0 px-5 pb-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pointer-events-none">
                <h3 className="text-white font-bold text-base truncate">
                  {activeVideo.title || t("Untitled Video")}
                </h3>
              </div>
            )}

            {/* Timestamp badge */}
            {showOverlay && (
              <div className="absolute bottom-16 right-5 pointer-events-none">
                <span className="text-yellow-400 text-xs font-mono font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            )}

            {/* Progress bar */}
            <div
              ref={progressRef}
              className="absolute bottom-10 left-0 right-0 h-1 cursor-pointer group"
              onClick={handleProgressClick}
            >
              <div
                className={`h-full ${
                  isDark ? "bg-gray-700/60" : "bg-gray-600/40"
                }`}
              />
              <div
                className="absolute top-0 left-0 h-full bg-yellow-400 transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
              {/* Scrubber dot */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-yellow-400 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${progressPercent}%`, marginLeft: "-6px" }}
              />
            </div>

            {/* Custom controls bar */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-10 flex items-center justify-between px-4 ${
                isDark ? "bg-[#0a0e1a]/90" : "bg-gray-900/90"
              }`}
            >
              {/* Left controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-yellow-400 transition-colors"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                  onClick={skipPrev}
                  className="text-white hover:text-yellow-400 transition-colors"
                >
                  <SkipBack size={14} />
                </button>
                <button
                  onClick={skipNext}
                  className="text-white hover:text-yellow-400 transition-colors"
                >
                  <SkipForward size={14} />
                </button>

                <span className="text-gray-400 text-[11px] font-mono ml-1">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-yellow-400 transition-colors"
                >
                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <button
                  onClick={toggleLoop}
                  className={`transition-colors ${
                    isLooping ? "text-yellow-400" : "text-white hover:text-yellow-400"
                  }`}
                >
                  <Repeat size={14} />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-yellow-400 transition-colors"
                >
                  <Maximize size={14} />
                </button>
                <button className="text-white hover:text-yellow-400 transition-colors">
                  <MoreVertical size={14} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full min-h-[300px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Play size={48} className="mx-auto mb-3 text-gray-600" />
              <p className="text-sm">{t("No video selected")}</p>
            </div>
          </div>
        )}
      </div>

      {/* Video Thumbnails Strip */}
      <div className="flex gap-5 mb-10 overflow-x-auto pb-4 scrollbar-thin">
        {videos.map((v) => {
          const isActive = mainVideo === v.video_url;
          return (
            <div key={v.id} className="shrink-0 flex flex-col items-center">
              {/* Thumbnail */}
              <div
                className={`relative group rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-transparent shadow-[0_0_15px_rgba(250,204,21,0.15)]"
                    : "hover:ring-1 hover:ring-gray-500"
                } ${isDark ? "ring-offset-[#020617]" : "ring-offset-gray-50"}`}
                onClick={() => onSetMainVideo(v.video_url)}
                style={{ width: "140px", height: "100px" }}
              >
                <video
                  src={getFullUrl(v.video_url)}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />

                {/* Play overlay on thumbnail */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? "bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.4)]"
                        : "bg-white/20 backdrop-blur-sm group-hover:bg-white/30"
                    }`}
                  >
                    <Play
                      size={16}
                      className={`ml-0.5 ${
                        isActive ? "text-black" : "text-white"
                      }`}
                      fill={isActive ? "black" : "white"}
                    />
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(v.id);
                  }}
                  className="absolute top-1.5 right-1.5 bg-red-500/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110"
                >
                  <X size={10} />
                </button>

                {/* Duration badge */}
                {v.duration_seconds && v.duration_seconds > 0 && (
                  <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                    {formatTime(v.duration_seconds)}
                  </div>
                )}
              </div>

              {/* Share as Reels Toggle */}
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-[10px] font-medium ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {t("Share as Reels")}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleReel(v.id);
                  }}
                  className={`relative w-9 h-5 rounded-full transition-all duration-300 ${
                    v.is_reel
                      ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                      : isDark
                      ? "bg-gray-600"
                      : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${
                      v.is_reel ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}

        {/* Add Video Button */}
        <div className="shrink-0 flex flex-col items-center">
          <button
            type="button"
            onClick={() => {
              if (canUpload && !isUploading) setShowUploadModal(true);
            }}
            className={`flex items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300 ${
              !canUpload || isUploading
                ? "opacity-40 cursor-not-allowed"
                : "cursor-pointer hover:scale-105 hover:border-yellow-400/50"
            } ${
              isDark
                ? "border-[#1e293b] bg-[#0b1120]/50 hover:bg-[#0b1120]"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            }`}
            style={{ width: "140px", height: "100px" }}
            disabled={!canUpload || isUploading}
          >
            <div className="text-center">
              <Plus
                className={`mx-auto mb-1 ${
                  isDark ? "text-yellow-400/60" : "text-yellow-500/60"
                }`}
                size={24}
              />
              <span
                className={`text-[10px] font-medium ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {t("Add Video")}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className={`relative w-full max-w-md mx-4 rounded-2xl border p-6 shadow-2xl ${
              isDark
                ? "bg-[#0b1736] border-[#1e2d5a]"
                : "bg-white border-gray-200"
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "dropdownFadeIn 0.25s ease-out" }}
          >
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className={`absolute top-4 right-4 p-1 rounded-full transition-colors ${
                isDark
                  ? "text-gray-400 hover:bg-white/10"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <X size={18} />
            </button>

            {/* Modal title */}
            <h3
              className={`text-lg font-bold mb-5 flex items-center gap-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              <Film size={20} className="text-yellow-400" />
              {t("Upload Video")}
            </h3>

            {/* Title input */}
            <div className="mb-4">
              <label
                className={`block mb-2 text-sm font-medium ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {t("Video Title")}
              </label>
              <div
                className={`flex items-center rounded-xl px-4 py-3 border transition-all duration-300 ${
                  isDark
                    ? "bg-[#060d24] border-[#1e2d5a] focus-within:border-yellow-400/70 focus-within:shadow-[0_0_15px_rgba(250,204,21,0.08)]"
                    : "bg-gray-50 border-gray-200 focus-within:border-yellow-400"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-lg mr-3 ${
                    isDark
                      ? "bg-yellow-400/10 text-yellow-400/70"
                      : "bg-yellow-50 text-yellow-500/70"
                  }`}
                >
                  <Type size={16} />
                </div>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder={t("Enter video title...")}
                  className={`bg-transparent outline-none w-full text-sm font-medium ${
                    isDark
                      ? "text-white placeholder-gray-500/70"
                      : "text-gray-900 placeholder-gray-400"
                  }`}
                  autoFocus
                />
              </div>
            </div>

            {/* File picker */}
            <div className="mb-5">
              <label
                className={`block mb-2 text-sm font-medium ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {t("Video File")}
              </label>

              {selectedFile ? (
                <div
                  className={`relative rounded-xl overflow-hidden border ${
                    isDark ? "border-[#1e2d5a]" : "border-gray-200"
                  }`}
                >
                  <video
                    src={filePreview || undefined}
                    className="w-full h-40 object-cover"
                    muted
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                    <p className="text-white text-xs truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-gray-300 text-[10px]">
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      if (filePreview) URL.revokeObjectURL(filePreview);
                      setFilePreview(null);
                      if (fileInputRef.current)
                        fileInputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 bg-red-500/90 text-white p-1 rounded-full hover:bg-red-600 transition"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
                    isDark
                      ? "border-[#1e2d5a] bg-[#060d24]/50 hover:border-yellow-400/30 hover:bg-[#060d24]"
                      : "border-gray-300 bg-gray-50 hover:border-yellow-400/50 hover:bg-gray-100"
                  }`}
                >
                  <Upload
                    size={24}
                    className={`mb-2 ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {t("Click to select video")}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isDark
                    ? "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t("Cancel")}
              </button>
              <button
                onClick={handleUploadSubmit}
                disabled={!selectedFile || !uploadTitle.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-yellow-400 text-black hover:bg-yellow-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Upload size={14} />
                {t("Upload")}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}