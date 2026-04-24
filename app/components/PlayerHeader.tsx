"use client";

import { Star, MapPin, User } from "lucide-react";
import useTranslate from "@/app/hooks/useTranslate";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  country?: string;
  age?: number;
  date_of_birth?: string;
  average_rating?: number;
}

interface PlayerHeaderProps {
  player: Player | null | undefined;
}

export default function PlayerHeader({ player }: PlayerHeaderProps) {
  const { t } = useTranslate();
  if (!player) return null;

  const calculateAge = (birthDate?: string): number => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const averageStars = player.average_rating || 0;
  const maxStars = 7;
  // Use age from API if available, otherwise calculate from date_of_birth
  const age = player.age || calculateAge(player.date_of_birth);

  return (
    <div className="text-left">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
        {player.first_name} {player.last_name}
      </h1>

      <div className="flex flex-wrap items-center gap-4 mt-4">
        <div className="flex text-yellow-400 gap-0.5">
          {[...Array(maxStars)].map((_, index) => (
            <Star
              key={index}
              size={18}
              fill={index < averageStars ? "currentColor" : "none"}
              stroke="currentColor"
              className={
                index < averageStars ? "text-yellow-400" : "text-gray-400"
              }
            />
          ))}
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          <MapPin size={16} className="text-yellow-400" />
          <span>{player.country || "Unknown"}</span>
        </div>

        {age > 0 && (
          <div className="flex items-center gap-2 text-gray-400">
            <User size={16} className="text-yellow-400" />
            <span>
              {age} {t("Y")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
