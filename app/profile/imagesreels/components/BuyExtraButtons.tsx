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
  isDark,
  t,
  isPurchasing = false,
}: Props) {
  return (
    <div className="flex flex-wrap gap-4 mb-14">

      {!canUploadPhoto && (
        <button
          onClick={onBuyPhoto}
          disabled={isPurchasing}
          className={`
            px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition
            hover:scale-105 disabled:opacity-50
            ${
              isDark
                ? "bg-[#0b1220] text-white border border-white/10 hover:bg-[#111a2e]"
                : "bg-white text-black border border-gray-200 hover:bg-gray-100"
            }
          `}
        >
          <ShoppingCart size={18} />
          + {t("Buy Extra Photo")}
        </button>
      )}

      {!canUploadVideo && (
        <button
          onClick={onBuyVideo}
          disabled={isPurchasing}
          className={`
            px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition
            hover:scale-105 disabled:opacity-50
            ${
              isDark
                ? "bg-gradient-to-r from-[#F0B100] to-yellow-600 text-black"
                : "bg-gradient-to-r from-[#F0B100] to-yellow-500 text-black"
            }
          `}
        >
          <ShoppingCart size={18} />
          + {t("Buy Extra Video")}
        </button>
      )}

      {!canCreateAd && (
        <button
          onClick={onBuyAd}
          disabled={isPurchasing}
          className={`
            px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition
            hover:scale-105 disabled:opacity-50
            ${
              isDark
                ? "bg-[#0a1a33] border border-[#F0B100]/40 text-[#F0B100] hover:bg-[#0f2447]"
                : "bg-[#F0B100] text-black hover:bg-yellow-500"
            }
          `}
        >
          <ShoppingCart size={18} />
          + {t("Buy Ad")}
        </button>
      )}

    </div>
  );
}
