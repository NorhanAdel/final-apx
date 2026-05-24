"use client";

import { ShoppingCart } from "lucide-react";

interface Props {
  canUploadPhoto: boolean;
  canUploadVideo: boolean;
  canCreateAd: boolean;
  onBuyPhoto: () => void;
  onBuyVideo: () => void;
  onBuyAd: () => void;
  isDark: boolean;
  t: (key: string) => string;
  isPurchasing?: boolean;
}

export function BuyExtraButtons({
  canUploadPhoto,
  canUploadVideo,
  canCreateAd,
  onBuyPhoto,
  onBuyVideo,
  onBuyAd,
  t,
  isPurchasing = false,
}: Props) {
  return (
    <div className="flex flex-wrap gap-4 mb-14">
      {!canUploadPhoto && (
        <button
          onClick={onBuyPhoto}
          disabled={isPurchasing}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:scale-105 transition disabled:opacity-50 flex items-center gap-2"
        >
          <ShoppingCart size={18} />+ {t("Buy Extra Photo")}
        </button>
      )}

      {!canUploadVideo && (
        <button
          onClick={onBuyVideo}
          disabled={isPurchasing}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold hover:scale-105 transition disabled:opacity-50 flex items-center gap-2"
        >
          <ShoppingCart size={18} />+ {t("Buy Extra Video")}
        </button>
      )}

      {!canCreateAd && (
        <button
          onClick={onBuyAd}
          disabled={isPurchasing}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold hover:scale-105 transition disabled:opacity-50 flex items-center gap-2"
        >
          <ShoppingCart size={18} />+ {t("Buy Ad Slot")}
        </button>
      )}
    </div>
  );
}
