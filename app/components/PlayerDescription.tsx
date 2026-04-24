import React from "react";

interface Player {
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
  if (!player) return null;

  return (
    <p className="text-gray-400 mt-4 pb-20 text-left leading-7">
      {player.first_name} {player.last_name} is a professional footballer from{" "}
      {player.nationality || "unknown"} country. Currently based in{" "}
      {player.city || "unknown"} and verified as level{" "}
      {player.trust_level ?? "N/A"}. This player has been viewed{" "}
      {player.views_count ?? 0} times on the platform.
    </p>
  );
}
