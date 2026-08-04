import React, { useEffect } from "react";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import { INCREMENT_PLAYER_VIEWS } from "@/app/graphql/mutation/player.mutations";
import useTranslate from "@/app/hooks/useTranslate";

interface Player {
  id?: string;
  first_name: string;
  last_name: string;
  nationality?: string | null;
  city?: string | null;
  trust_level?: number | string | null;
  views_count?: number | null;
}

interface PlayerDescriptionProps {
  player: Player | null | undefined;
}

export default function PlayerDescription({ player }: PlayerDescriptionProps) {
  const { t, lang } = useTranslate();
  const isRTL = lang === "ar";

  useEffect(() => {
    const incrementViews = async () => {
      if (!player?.id) return;
      try {
        await fetchGraphQL(INCREMENT_PLAYER_VIEWS, {
          playerId: player.id,
        });
      } catch (error) {
        console.error("Failed to increment views:", error);
      }
    };

    incrementViews();
  }, [player?.id]);

  if (!player) return null;

  const viewsText = player.views_count ?? 0;

  return (
    <p
      className={`text-gray-400 mt-4 pb-20 text-left leading-7 ${
        isRTL ? "text-right" : "text-left"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {isRTL ? (
        <>
          {player.first_name} {player.last_name} لاعب كرة قدم محترف من{" "}
          {player.nationality || t("unknown")}. يقيم حالياً في{" "}
          {player.city || t("unknown")} ومُصنف في المستوى{" "}
          {player.trust_level ?? "N/A"}. تم مشاهدة هذا اللاعب {viewsText} مرة
          على المنصة.
        </>
      ) : (
        <>
          {player.first_name} {player.last_name} is a professional footballer
          from {player.nationality || t("unknown")} country. Currently based in{" "}
          {player.city || t("unknown")} and verified as level{" "}
          {player.trust_level ?? "N/A"}. This player has been viewed {viewsText}{" "}
          times on the platform.
        </>
      )}
    </p>
  );
}
