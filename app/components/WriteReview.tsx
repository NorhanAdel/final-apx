"use client";

import { useState, useEffect } from "react";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import {
  CREATE_RATING,
  UPDATE_RATING,
} from "@/app/graphql/mutation/rating.mutations";
import { toast } from "sonner";
import useTranslate from "@/app/hooks/useTranslate";
import { useTheme } from "@/app/context/ThemeContext";
import { X, Star } from "lucide-react";
import { GET_MY_RATING_FOR_PLAYER } from "../graphql/query/rating.queries";

interface WriteReviewProps {
  playerId: string;
  onRatingSubmitted?: () => void;
}

interface ExistingRating {
  id: string;
  calculated_stars: number;
  scalability: boolean;
  mental_stability: boolean;
  soccer_intelligence: boolean;
  physical_fitness: boolean;
  technical_skill: boolean;
  tactical_vision: boolean;
  republican_influence: boolean;
  notes: string;
}

const SKILL_LABELS = {
  scalability: "Scalability",
  mental_stability: "Mental Stability",
  soccer_intelligence: "Soccer Intelligence",
  physical_fitness: "Physical Fitness",
  technical_skill: "Technical Skill",
  tactical_vision: "Tactical Vision",
  republican_influence: "Republican Influence",
};

type SkillKey = keyof typeof SKILL_LABELS;

export default function WriteReview({
  playerId,
  onRatingSubmitted,
}: WriteReviewProps) {
  const { t } = useTranslate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingRating, setExistingRating] = useState<ExistingRating | null>(
    null,
  );
  const [ratingMode, setRatingMode] = useState<"stars" | "skills">("stars");
  const [selectedStars, setSelectedStars] = useState<number>(0);
  const [hoveredStars, setHoveredStars] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [skills, setSkills] = useState<Record<SkillKey, boolean>>({
    scalability: false,
    mental_stability: false,
    soccer_intelligence: false,
    physical_fitness: false,
    technical_skill: false,
    tactical_vision: false,
    republican_influence: false,
  });

  useEffect(() => {
    const fetchExistingRating = async () => {
      if (!playerId) return;
      try {
        const result = await fetchGraphQL<{
          myRatingForPlayer: ExistingRating;
        }>(GET_MY_RATING_FOR_PLAYER, { playerId });
        if (result.data?.myRatingForPlayer) {
          const rating = result.data.myRatingForPlayer;
          setExistingRating(rating);
          setSelectedStars(rating.calculated_stars || 0);
          setNotes(rating.notes || "");
          setSkills({
            scalability: rating.scalability || false,
            mental_stability: rating.mental_stability || false,
            soccer_intelligence: rating.soccer_intelligence || false,
            physical_fitness: rating.physical_fitness || false,
            technical_skill: rating.technical_skill || false,
            tactical_vision: rating.tactical_vision || false,
            republican_influence: rating.republican_influence || false,
          });
        }
      } catch (error) {
        console.error("Error fetching existing rating:", error);
      }
    };
    fetchExistingRating();
  }, [playerId]);

  // دالة لحساب عدد النجوم من المهارات - تستقبل skills كمعامل
  const calculateStarsFromSkills = (
    skillsData: Record<SkillKey, boolean>,
  ): number => {
    return Object.values(skillsData).filter(Boolean).length;
  };

  const handleSkillChange = (skill: SkillKey, checked: boolean) => {
    const newSkills = { ...skills, [skill]: checked };
    setSkills(newSkills);
    // حساب النجوم من المهارات الجديدة مباشرة
    const starsCount = calculateStarsFromSkills(newSkills);
    setSelectedStars(starsCount);
  };

  const handleSelectAll = () => {
    const allTrue = Object.keys(skills).reduce((acc, key) => {
      acc[key as SkillKey] = true;
      return acc;
    }, {} as Record<SkillKey, boolean>);
    setSkills(allTrue);
    setSelectedStars(7);
  };

  const handleClearAll = () => {
    const allFalse = Object.keys(skills).reduce((acc, key) => {
      acc[key as SkillKey] = false;
      return acc;
    }, {} as Record<SkillKey, boolean>);
    setSkills(allFalse);
    setSelectedStars(0);
  };

  const handleStarClick = (stars: number) => {
    setSelectedStars(stars);
    if (ratingMode === "stars") {
      // عند استخدام وضع النجوم، يتم تعبئة المهارات تلقائياً حسب عدد النجوم
      const skillKeys = Object.keys(skills) as SkillKey[];
      const newSkills = { ...skills };
      for (let i = 0; i < skillKeys.length; i++) {
        newSkills[skillKeys[i]] = i < stars;
      }
      setSkills(newSkills);
    }
  };

  const handleModeChange = (mode: "stars" | "skills") => {
    setRatingMode(mode);
    if (mode === "stars" && selectedStars > 0) {
      // مزامنة المهارات مع النجوم المحددة
      const skillKeys = Object.keys(skills) as SkillKey[];
      const newSkills = { ...skills };
      for (let i = 0; i < skillKeys.length; i++) {
        newSkills[skillKeys[i]] = i < selectedStars;
      }
      setSkills(newSkills);
    } else if (mode === "skills") {
      // تحديث النجوم بناءً على المهارات الحالية
      setSelectedStars(calculateStarsFromSkills(skills));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStars === 0) {
      toast.error(t("Please select a rating"));
      return;
    }

    setLoading(true);

    try {
      if (existingRating?.id) {
        const result = await fetchGraphQL(UPDATE_RATING, {
          id: existingRating.id,
          input: {
            stars: selectedStars,
            notes: notes || null,
            scalability: skills.scalability,
            mental_stability: skills.mental_stability,
            soccer_intelligence: skills.soccer_intelligence,
            physical_fitness: skills.physical_fitness,
            technical_skill: skills.technical_skill,
            tactical_vision: skills.tactical_vision,
            republican_influence: skills.republican_influence,
          },
        });
        if (result.errors) {
          toast.error(result.errors[0].message);
        } else {
          toast.success(t("Rating updated successfully!"));
          setIsModalOpen(false);
          onRatingSubmitted?.();
        }
      } else {
        const result = await fetchGraphQL(CREATE_RATING, {
          input: {
            player_id: playerId,
            stars: selectedStars,
            notes: notes || null,
            scalability: skills.scalability,
            mental_stability: skills.mental_stability,
            soccer_intelligence: skills.soccer_intelligence,
            physical_fitness: skills.physical_fitness,
            technical_skill: skills.technical_skill,
            tactical_vision: skills.tactical_vision,
            republican_influence: skills.republican_influence,
          },
        });
        if (result.errors) {
          toast.error(result.errors[0].message);
        } else {
          toast.success(t("Rating submitted successfully!"));
          setIsModalOpen(false);
          onRatingSubmitted?.();
        }
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error(t("Failed to submit rating. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const modalBg = isDark ? "bg-[#0a1a3a]/95" : "bg-white/95";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-300" : "text-gray-600";
  const labelColor = isDark ? "text-gray-200" : "text-gray-800";
  const borderColor = isDark ? "border-white/10" : "border-gray-200";
  const inputBg = isDark ? "bg-white/10" : "bg-gray-50";
  const buttonBg = isDark ? "bg-[#0a2a66]" : "bg-[#0a2a66]";
  const cancelBtnBg = isDark
    ? "bg-gray-700 hover:bg-gray-600"
    : "bg-gray-200 hover:bg-gray-300";
  const cancelBtnText = isDark ? "text-white" : "text-gray-800";

  return (
    <>
      <div className="mt-12">
        <button
          onClick={() => setIsModalOpen(true)}
          className={`w-full py-4 rounded-xl ${buttonBg} text-white font-semibold border-l-4 border-r-4 border-yellow-400 hover:opacity-90 transition shadow-lg`}
        >
          ✍ {existingRating ? t("Edit Review") : t("Write Review")}
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            className={`relative ${modalBg} backdrop-blur-xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border ${borderColor} shadow-2xl`}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className={`absolute top-4 right-4 p-2 rounded-lg ${cancelBtnBg} ${cancelBtnText} transition`}
            >
              <X size={20} />
            </button>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-2 text-center">
                {existingRating ? t("Edit Rating") : t("Rate Player")}
              </h2>

              {/* Mode Toggle */}
              <div className="flex gap-2 mb-6 p-1 rounded-xl bg-gray-200/20">
                <button
                  type="button"
                  onClick={() => handleModeChange("stars")}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${
                    ratingMode === "stars"
                      ? "bg-yellow-400 text-black"
                      : isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  ⭐ {t("Rate by Stars")}
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange("skills")}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${
                    ratingMode === "skills"
                      ? "bg-yellow-400 text-black"
                      : isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  🎯 {t("Rate by Skills")}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating Preview */}
                <div className="text-center py-4 rounded-xl bg-yellow-400/10 border border-yellow-400/30">
                  <p className={`text-sm ${textSecondary} mb-2`}>
                    {t("Rating Preview")}:
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((star) => (
                      <Star
                        key={star}
                        size={28}
                        className={`${
                          star <= selectedStars
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-600 text-gray-600"
                        } transition`}
                      />
                    ))}
                  </div>
                  <p className={`text-2xl font-bold text-yellow-400 mt-2`}>
                    {selectedStars} / 7
                  </p>
                </div>

                {/* Stars Selection Mode */}
                {ratingMode === "stars" && (
                  <div className="text-center py-4 rounded-xl border border-yellow-400/30">
                    <p className={`text-sm ${textSecondary} mb-4`}>
                      {t("Click on stars to rate")}:
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5, 6, 7].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleStarClick(star)}
                          onMouseEnter={() => setHoveredStars(star)}
                          onMouseLeave={() => setHoveredStars(0)}
                          className="transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star
                            size={40}
                            className={`${
                              star <= (hoveredStars || selectedStars)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-600 text-gray-600"
                            } transition-all duration-150`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills Selection Mode */}
                {ratingMode === "skills" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`text-lg font-semibold text-yellow-400`}>
                        {t("Player Skills")}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className={`text-xs px-3 py-1 rounded-lg ${
                            isDark
                              ? "bg-white/10 hover:bg-white/20"
                              : "bg-gray-100 hover:bg-gray-200"
                          } ${textColor} transition`}
                        >
                          {t("Select All")}
                        </button>
                        <button
                          type="button"
                          onClick={handleClearAll}
                          className={`text-xs px-3 py-1 rounded-lg ${
                            isDark
                              ? "bg-white/10 hover:bg-white/20"
                              : "bg-gray-100 hover:bg-gray-200"
                          } ${textColor} transition`}
                        >
                          {t("Clear All")}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(SKILL_LABELS).map(([key, label]) => (
                        <label
                          key={key}
                          className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition border ${borderColor} ${inputBg} hover:bg-yellow-400/10`}
                        >
                          <input
                            type="checkbox"
                            checked={skills[key as SkillKey]}
                            onChange={(e) =>
                              handleSkillChange(
                                key as SkillKey,
                                e.target.checked,
                              )
                            }
                            className="w-5 h-5 text-yellow-400 rounded focus:ring-yellow-500"
                          />
                          <span className={`${textColor} font-medium`}>
                            {t(label)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes - Optional */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${labelColor}`}
                  >
                    {t("Notes")}{" "}
                    <span className={`text-xs ${textSecondary}`}>
                      ({t("Optional")})
                    </span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("Write your review here...")}
                    className={`w-full p-3 rounded-xl border ${borderColor} ${inputBg} ${textColor} placeholder:text-gray-500 focus:ring-2 focus:ring-yellow-400 outline-none transition resize-none`}
                    rows={4}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition ${cancelBtnBg} ${cancelBtnText}`}
                  >
                    {t("Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={loading || selectedStars === 0}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#0a2a66] text-white font-semibold border-l-4 border-r-4 border-yellow-400 hover:opacity-90 transition disabled:opacity-50 shadow-lg"
                  >
                    {loading
                      ? t("Submitting...")
                      : existingRating
                      ? t("Update Rating")
                      : t("Submit Rating")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
