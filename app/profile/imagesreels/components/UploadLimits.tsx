"use client";

import { UploadLimitsType } from "@/app/types/upload.types";


interface Props {
  limits: UploadLimitsType | null;
  isDark: boolean;
  t: (key: string) => string;
}

export function UploadLimits({ limits, t }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {/* Photos Card */}
      <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white">
        <p className="text-sm opacity-80">{t("Photos")}</p>
        <h2 className="text-4xl font-black mt-2">{limits?.remaining_photos || 0}</h2>
        <p className="mt-2 text-sm opacity-70">
          {limits?.uploaded_photos} / {limits?.max_photos}
        </p>
      </div>

      {/* Videos Card */}
      <div className="rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-white">
        <p className="text-sm opacity-80">{t("Videos")}</p>
        <h2 className="text-4xl font-black mt-2">{limits?.remaining_videos || 0}</h2>
        <p className="mt-2 text-sm opacity-70">
          {limits?.uploaded_videos} / {limits?.max_videos}
        </p>
      </div>

      {/* Ads Card */}
      <div className="rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 p-6 text-white">
        <p className="text-sm opacity-80">{t("Ads")}</p>
        <h2 className="text-4xl font-black mt-2">{limits?.remaining_ads || 0}</h2>
        <p className="mt-2 text-sm opacity-70">
          {t("Available")}
        </p>
      </div>
    </div>
  );
}