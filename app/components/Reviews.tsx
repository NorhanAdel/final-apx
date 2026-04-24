"use client";

import { useRef, useEffect, useState } from "react";
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
  rater: {
    id: string;
    first_name?: string;
    last_name?: string;
  };
}

interface ReviewsProps {
  playerId?: string;
}

export default function Reviews({ playerId }: ReviewsProps) {
  const { t } = useTranslate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
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
      const newIndex = Math.round(scrollLeft / (itemWidth + 24));
      setActiveDot(newIndex);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (containerRef.current) {
      e.preventDefault();
      containerRef.current.scrollLeft += e.deltaY;
    }
  };

  const scroll = (dir: "left" | "right") => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      containerRef.current.scrollBy({
        left: dir === "left" ? -width / 1.5 : width / 1.5,
        behavior: "smooth",
      });
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return (
      `${firstName?.charAt(0) || ""}${
        lastName?.charAt(0) || ""
      }`.toUpperCase() || "U"
    );
  };

  const renderStars = (stars: number) => {
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 >= 0.5;
    const emptyStars = 7 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5 mt-1">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            size={12}
            fill="currentColor"
            className="text-yellow-400"
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star size={12} className="text-gray-500" />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: "50%" }}
            >
              <Star size={12} fill="currentColor" className="text-yellow-400" />
            </div>
          </div>
        )}

        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={12} className="text-gray-500" />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mt-10 md:mt-14">
        <div className="text-center text-gray-400">
          {t("Loading reviews...")}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="mt-10 md:mt-14">
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

  const textColor = isDark ? "text-white" : "text-gray-900";
  const dotActiveColor = "bg-yellow-400";
  const dotInactiveColor = isDark ? "bg-gray-600" : "bg-gray-400";

  return (
    <div className="mt-10 md:mt-14 relative">
      {/* left arrow */}
      <button
        onClick={() => scroll("left")}
        className="
          absolute left-1 sm:left-2 md:left-0
          top-1/2 -translate-y-1/2
          z-10
          bg-black/40 hover:bg-black/70
          p-1.5 sm:p-2 md:p-3
          rounded-full
          transition
        "
      >
        <ChevronLeft
          size={18}
          className="sm:size-[20px] md:size-[24px] text-white"
        />
      </button>

      {/* right arrow */}
      <button
        onClick={() => scroll("right")}
        className="
          absolute right-1 sm:right-2 md:right-0
          top-1/2 -translate-y-1/2
          z-10
          bg-black/40 hover:bg-black/70
          p-1.5 sm:p-2 md:p-3
          rounded-full
          transition
        "
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
        className="
          flex gap-4 sm:gap-6 md:gap-8
          overflow-x-auto
          no-scrollbar
          scroll-smooth
          px-6 sm:px-8 md:px-2
        "
      >
        {reviews.map((review) => (
          <div
            key={review.id}
            className="
              min-w-[220px] sm:min-w-[240px] md:min-w-[260px]
              bg-[#06163a]
              border border-[#102b5c]
              px-4 sm:px-6 md:px-8
              py-4 sm:py-5
              rounded-xl
              flex items-center gap-3 sm:gap-4
              shadow-[0_0_20px_rgba(0,60,255,0.15)]
              flex-shrink-0
            "
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-sm">
              {getInitials(review.rater?.first_name, review.rater?.last_name)}
            </div>

            <div>
              <h4 className={`font-semibold text-xs sm:text-sm ${textColor}`}>
                {review.rater?.first_name} {review.rater?.last_name}
              </h4>

              {renderStars(review.calculated_stars)}

              {review.notes && (
                <p
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  } mt-1 line-clamp-2`}
                >
                  {review.notes}
                </p>
              )}
            </div>
          </div>
        ))}
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
