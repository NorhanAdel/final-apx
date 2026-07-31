"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import useTranslate from "@/app/hooks/useTranslate";
import { useTheme } from "@/app/context/ThemeContext";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import { GET_PLAYER_RATINGS } from "@/app/graphql/query/rating.queries";

interface Rating {
  id: string;
  calculated_stars: number;
  notes: string | null;
  created_at: string;
  raterFirstName?: string;
  raterLastName?: string;
  raterProfileImageUrl?: string;
  rater?: {
    id: string;
    username: string;
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
  };
}

interface ReviewsProps {
  playerId?: string;
}

function getFullImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function Reviews({ playerId }: ReviewsProps) {
  const { t, lang } = useTranslate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isRTL = lang === "ar";
  const containerRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!playerId) return;
      setLoading(true);
      try {
        const result = await fetchGraphQL<{ playerRatings: Rating[] }>(
          GET_PLAYER_RATINGS,
          { playerId },
        );
        console.log("📊 Ratings response:", JSON.stringify(result, null, 2));
        if (result.data?.playerRatings) {
          setReviews(result.data.playerRatings);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [playerId]);

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollLeft = containerRef.current.scrollLeft;
      const itemWidth = containerRef.current.children[0]?.clientWidth || 260;
      const newIndex = Math.round(Math.abs(scrollLeft) / (itemWidth + 24));
      setActiveDot(newIndex);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (containerRef.current) {
      e.preventDefault();
      containerRef.current.scrollLeft += e.deltaY;
    }
  };

  const scroll = (dir: "prev" | "next") => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      const amount = dir === "next" ? width / 1.5 : -width / 1.5;
      containerRef.current.scrollBy({
        left: amount,
        behavior: "smooth",
      });
    }
  };

  const getRaterName = (review: Rating) => {
    const firstName =
      review.raterFirstName?.trim() || review.rater?.first_name?.trim() || "";
    const lastName =
      review.raterLastName?.trim() || review.rater?.last_name?.trim() || "";

    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;

    if (review.rater?.username) return review.rater.username;

    return t("Unknown");
  };

  const getRaterImage = (review: Rating) => {
    const url = review.raterProfileImageUrl || review.rater?.profile_image_url;
    return getFullImageUrl(url);
  };

  const getInitials = (name: string) => {
    if (!name || name === t("Unknown")) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const renderStars = (stars: number) => {
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 >= 0.5;
    const emptyStars = 7 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5 mt-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            size={12}
            fill="currentColor"
            className="text-yellow-400"
          />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star size={12} className="text-gray-300 dark:text-gray-600" />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: "50%" }}
            >
              <Star size={12} fill="currentColor" className="text-yellow-400" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star
            key={`empty-${i}`}
            size={12}
            className="text-gray-300 dark:text-gray-600"
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mt-10 md:mt-14" dir={isRTL ? "rtl" : "ltr"}>
        <div
          className={`text-center ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {t("Loading reviews...")}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="mt-10 md:mt-14" dir={isRTL ? "rtl" : "ltr"}>
        <div
          className={`text-center ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {t("No reviews yet. Be the first to review!")}
        </div>
      </div>
    );
  }

  const textColor = isDark ? "text-white" : "text-gray-800";
  const secondaryTextColor = isDark ? "text-gray-400" : "text-gray-500";
  const dotActiveColor = "bg-yellow-400";
  const dotInactiveColor = isDark ? "bg-gray-600" : "bg-gray-300";
  const cardBg = isDark ? "bg-[#06163a]" : "bg-white";
  const cardBorder = isDark ? "border-[#102b5c]" : "border-gray-200";
  const cardShadow = isDark
    ? "shadow-[0_0_20px_rgba(0,60,255,0.15)]"
    : "shadow-[0_4px_20px_rgba(0,0,0,0.08)]";

  return (
    <div
      className="mt-10 md:mt-14 relative w-full"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <button
        onClick={() => scroll("prev")}
        className={`
          absolute ${
            isRTL
              ? "right-1 sm:right-2 md:right-0"
              : "left-1 sm:left-2 md:left-0"
          }
          top-1/2 -translate-y-1/2
          z-10
          bg-black/40 hover:bg-black/70
          p-1.5 sm:p-2 md:p-3
          rounded-full
          transition
        `}
      >
        <ChevronLeft
          size={18}
          className="sm:size-[20px] md:size-[24px] text-white"
        />
      </button>

      <button
        onClick={() => scroll("next")}
        className={`
          absolute ${
            isRTL
              ? "left-1 sm:left-2 md:left-0"
              : "right-1 sm:right-2 md:right-0"
          }
          top-1/2 -translate-y-1/2
          z-10
          bg-black/40 hover:bg-black/70
          p-1.5 sm:p-2 md:p-3
          rounded-full
          transition
        `}
      >
        <ChevronRight
          size={18}
          className="sm:size-[20px] md:size-[24px] text-white"
        />
      </button>

      <div
        ref={containerRef}
        onWheel={handleWheel}
        onScroll={handleScroll}
        className="flex gap-4 sm:gap-6 md:gap-8 overflow-x-auto no-scrollbar scroll-smooth px-6 sm:px-8 md:px-2"
      >
        {reviews.map((review) => {
          const raterName = getRaterName(review);
          const raterImage = getRaterImage(review);
          const initials = getInitials(raterName);

          return (
            <div
              key={review.id}
              className={`min-w-[220px] sm:min-w-[240px] md:min-w-[260px] ${cardBg} border ${cardBorder} px-4 sm:px-6 md:px-8 py-4 sm:py-5 rounded-xl flex items-center gap-3 sm:gap-4 ${cardShadow} flex-shrink-0`}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0 border border-yellow-500/30 bg-yellow-400/10 flex items-center justify-center">
                {raterImage ? (
                  <Image
                    src={raterImage}
                    alt={raterName}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-black font-bold text-sm">
                    {initials}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold text-xs sm:text-sm ${textColor}`}>
                  {raterName}
                </h4>
                {renderStars(review.calculated_stars)}
                {review.notes && (
                  <p className={`text-xs ${secondaryTextColor} mt-1 line-clamp-2`}>
                    {review.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {reviews.length > 1 && (
        <div className="flex justify-center gap-2 mt-4 md:mt-6">
          {reviews.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition ${
                activeDot === i ? dotActiveColor : dotInactiveColor
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}