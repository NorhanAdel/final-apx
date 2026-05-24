"use client";

import { Plus, X, ChevronDown } from "lucide-react";
import { ChangeEvent } from "react";

interface Sport {
  id: string;
  name: string;
}

interface PlayerVideo {
  id: string;
  video_url: string;
  title: string;
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
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onDelete: (id: string) => void;
  onSetMainVideo: (url: string) => void;
  getFullUrl: (url: string) => string;
  t: (key: string) => string;
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
  getFullUrl,
  t,
}: Props) {
  return (
    <>
      {/* Sport Selection */}
      <div className="mb-6 relative w-64">
        <select
          value={selectedSportId}
          onChange={(e) => onSportChange(e.target.value)}
          className={`w-full rounded-xl px-4 py-3 appearance-none outline-none ${
            isDark
              ? "bg-[#0b1736] border border-[#1e2d5a]"
              : "bg-white border border-gray-300"
          }`}
        >
          {sports.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-4 text-gray-400" />
      </div>

      {/* Main Video */}
      <div
        className={`w-full h-[450px] rounded-3xl overflow-hidden mb-8 border ${
          isDark ? "bg-black border-[#1e293b]" : "bg-white border-gray-300"
        }`}
      >
        {mainVideo ? (
          <video
            src={getFullUrl(mainVideo)}
            controls
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            {t("No video selected")}
          </div>
        )}
      </div>

      {/* Videos List */}
      <div className="flex flex-wrap gap-5 mb-10">
        {videos.map((v) => (
          <div key={v.id} className="relative group">
            <video
              src={getFullUrl(v.video_url)}
              onClick={() => onSetMainVideo(v.video_url)}
              className={`w-40 h-28 rounded-2xl object-cover cursor-pointer border-2 ${
                mainVideo === v.video_url ? "border-yellow-400" : "border-transparent"
              }`}
            />
            <button
              onClick={() => onDelete(v.id)}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              <X size={14} />
            </button>
            <p className="text-xs mt-2 text-center truncate w-40">{v.title}</p>
          </div>
        ))}

        {/* Add Video Button */}
        <label
          className={`w-28 h-28 rounded-2xl flex items-center justify-center cursor-pointer border-2 border-dashed ${
            !canUpload || isUploading
              ? "opacity-50 pointer-events-none"
              : "hover:scale-105 transition"
          } ${
            isDark ? "border-[#1e293b] bg-[#0b1120]" : "border-gray-300 bg-white"
          }`}
        >
          <Plus className="text-pink-500" />
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={onUpload}
            disabled={isUploading}
          />
        </label>
      </div>
    </>
  );
}