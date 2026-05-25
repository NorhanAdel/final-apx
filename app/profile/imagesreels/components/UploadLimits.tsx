"use client";

import { UploadLimitsType } from "@/app/types/upload.types";

interface Props {
  limits: UploadLimitsType | null;
  isDark: boolean;
  t: (key: string) => string;
}

export function UploadLimits({ limits, isDark, t }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      
      {/* Photos Card */}
      <div
        className={`
          rounded-3xl p-6 border transition-all duration-300
          ${
            isDark
              ? "bg-[#0f172a] border-white/10 text-white"
              : "bg-white border-gray-200 text-black shadow-sm"
          }
        `}
      >
        <p
          className={`text-sm ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {t("Photos")}
        </p>

        <h2 className="text-4xl font-black mt-2 text-[#F0B100]">
          {limits?.remaining_photos || 0}
        </h2>

        <p
          className={`mt-2 text-sm ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {limits?.uploaded_photos} / {limits?.max_photos}
        </p>
      </div>

      {/* Videos Card */}
      <div
        className={`
          rounded-3xl p-6 border transition-all duration-300
          ${
            isDark
              ? "bg-[#111827] border-white/10 text-white"
              : "bg-white border-gray-200 text-black shadow-sm"
          }
        `}
      >
        <p
          className={`text-sm ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {t("Videos")}
        </p>

        <h2 className="text-4xl font-black mt-2 text-[#F0B100]">
          {limits?.remaining_videos || 0}
        </h2>

        <p
          className={`mt-2 text-sm ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {limits?.uploaded_videos} / {limits?.max_videos}
        </p>
      </div>

    </div>
  );
}
