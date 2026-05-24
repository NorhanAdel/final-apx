"use client";

import Image from "next/image";
import { Plus, X } from "lucide-react";
import { ChangeEvent } from "react";

interface PlayerPhoto {
  id: string;
  image_url: string;
}

interface Props {
  photos: PlayerPhoto[];
  canUpload: boolean;
  isUploading: boolean;
  isDark: boolean;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onDelete: (id: string) => void;
  getFullUrl: (url: string) => string;
  t: (key: string) => string;
}

export function PhotoSection({
  photos,
  canUpload,
  isUploading,
  onUpload,
  onDelete,
  getFullUrl,
  t,
}: Props) {
  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t("Photos")}</h2>

        <label
          className={`cursor-pointer ${
            !canUpload || isUploading
              ? "opacity-50 pointer-events-none"
              : "hover:scale-105 transition"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onUpload}
            disabled={isUploading}
          />
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
            <Plus />
          </div>
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {photos.map((p) => (
          <div
            key={p.id}
            className="relative h-44 rounded-2xl overflow-hidden group"
          >
            <Image
              src={getFullUrl(p.image_url)}
              alt=""
              fill
              className="object-cover group-hover:scale-110 transition"
            />
            <button
              onClick={() => onDelete(p.id)}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}