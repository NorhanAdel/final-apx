"use client";

import React, { useState, useEffect, useRef } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import {
  IS_FAVORITE,
  GET_FAVORITE_COUNT,
} from "../graphql/query/favorite.queries";
import { TOGGLE_FAVORITE } from "../graphql/mutation/favorite.mutations";
import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";

interface FavoriteButtonProps {
  playerId: string;
  onFavoriteChange?: (newStatus: boolean) => void;
}

export default function FavoriteButton({
  playerId,
  onFavoriteChange,
}: FavoriteButtonProps) {
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const isDark = theme === "dark";
  const isRTL = lang === "ar";

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const playerIdRef = useRef(playerId);

  useEffect(() => {
    playerIdRef.current = playerId;
  }, [playerId]);

  // Get current user ID from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
  }, []);

  // Fetch favorite status - defined inside useEffect to avoid dependency issues
  useEffect(() => {
    if (!currentUserId) return;

    const fetchFavoriteStatus = async () => {
      const currentPlayerId = playerIdRef.current;

      try {
        const [statusResult, countResult] = await Promise.all([
          fetchGraphQL<{ isFavorite: boolean }>(IS_FAVORITE, {
            playerId: currentPlayerId,
          }),
          fetchGraphQL<{ favoriteCount: number }>(GET_FAVORITE_COUNT, {
            playerId: currentPlayerId,
          }),
        ]);

        if (statusResult.data?.isFavorite !== undefined) {
          setIsFavorite(statusResult.data.isFavorite);
        }
        if (countResult.data?.favoriteCount !== undefined) {
          setFavoriteCount(countResult.data.favoriteCount);
        }
      } catch (error) {
        console.error("Error fetching favorite status:", error);
      }
    };

    fetchFavoriteStatus();
  }, [currentUserId, playerId]);

  const handleToggleFavorite = async () => {
    if (loading) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error(t("Please login to add favorites"));
      window.location.href = "/login";
      return;
    }

    if (!currentUserId) {
      toast.error(t("User not found"));
      return;
    }

    setLoading(true);
    const previousStatus = isFavorite;
    const previousCount = favoriteCount;
    const newStatus = !isFavorite;

    // Optimistic update
    setIsFavorite(newStatus);
    const newCount = newStatus
      ? previousCount + 1
      : Math.max(0, previousCount - 1);
    setFavoriteCount(newCount);

    try {
      const result = await fetchGraphQL<{ toggleFavorite: boolean }>(
        TOGGLE_FAVORITE,
        {
          input: { playerId },
        },
      );

      if (result.errors) {
        // Rollback on error
        setIsFavorite(previousStatus);
        setFavoriteCount(previousCount);
        toast.error(result.errors[0].message);
      } else if (result.data?.toggleFavorite !== undefined) {
        const finalStatus = result.data.toggleFavorite;

        // If the result doesn't match our optimistic update, correct it
        if (finalStatus !== newStatus) {
          setIsFavorite(finalStatus);
          // Fetch fresh count to ensure accuracy
          try {
            const countResult = await fetchGraphQL<{ favoriteCount: number }>(
              GET_FAVORITE_COUNT,
              { playerId },
            );
            if (countResult.data?.favoriteCount !== undefined) {
              setFavoriteCount(countResult.data.favoriteCount);
            }
          } catch (err) {
            console.error("Error fetching updated count:", err);
          }
        }

        toast.success(
          finalStatus ? t("Added to favorites") : t("Removed from favorites"),
        );

        if (onFavoriteChange) {
          onFavoriteChange(finalStatus);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setIsFavorite(previousStatus);
      setFavoriteCount(previousCount);
      toast.error(t("Failed to update favorite"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
        ${
          isFavorite
            ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
            : isDark
            ? "bg-[#0A1A44] text-gray-400 hover:text-red-500 hover:bg-red-500/10"
            : "bg-gray-100 text-gray-600 hover:text-red-500 hover:bg-red-50"
        }
        ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${isRTL ? "flex-row-reverse" : ""}
      `}
    >
      <Heart
        size={20}
        className={`transition-all duration-200 ${
          isFavorite ? "fill-red-500 text-red-500" : "text-current"
        }`}
        style={{
          fill: isFavorite ? "currentColor" : "none",
        }}
      />
      <span className="text-sm font-medium">
        {isFavorite ? t("Favorited") : t("Add to Favorites")}
      </span>
      {favoriteCount > 0 && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full ${
            isFavorite
              ? "bg-red-500/30 text-red-500"
              : isDark
              ? "bg-[#1E2A5A] text-gray-400"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {favoriteCount}
        </span>
      )}
    </button>
  );
}
