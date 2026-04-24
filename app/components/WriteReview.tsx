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
  notes: string;
  scalability: boolean;
  mental_stability: boolean;
  soccer_intelligence: boolean;
  physical_fitness: boolean;
  technical_skill: boolean;
  tactical_vision: boolean;
  republican_influence: boolean;
}

interface RatingFormData {
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
  const [formData, setFormData] = useState<RatingFormData>({
    scalability: false,
    mental_stability: false,
    soccer_intelligence: false,
    physical_fitness: false,
    technical_skill: false,
    tactical_vision: false,
    republican_influence: false,
    notes: "",
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
          setFormData({
            scalability: rating.scalability || false,
            mental_stability: rating.mental_stability || false,
            soccer_intelligence: rating.soccer_intelligence || false,
            physical_fitness: rating.physical_fitness || false,
            technical_skill: rating.technical_skill || false,
            tactical_vision: rating.tactical_vision || false,
            republican_influence: rating.republican_influence || false,
            notes: rating.notes || "",
          });
        }
      } catch (error) {
        console.error("Error fetching existing rating:", error);
      }
    };
    fetchExistingRating();
  }, [playerId]);

  const calculateStarsFromSkills = (): number => {
    const skills = Object.keys(SKILL_LABELS) as (keyof typeof SKILL_LABELS)[];
    return skills.filter((skill) => formData[skill]).length;
  };

  const handleSkillChange = (skill: keyof RatingFormData, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [skill]: checked }));
  };

  const handleSelectAll = () => {
    setFormData((prev) => ({
      ...prev,
      scalability: true,
      mental_stability: true,
      soccer_intelligence: true,
      physical_fitness: true,
      technical_skill: true,
      tactical_vision: true,
      republican_influence: true,
    }));
  };

  const handleClearAll = () => {
    setFormData((prev) => ({
      ...prev,
      scalability: false,
      mental_stability: false,
      soccer_intelligence: false,
      physical_fitness: false,
      technical_skill: false,
      tactical_vision: false,
      republican_influence: false,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const stars = calculateStarsFromSkills();

    try {
      if (existingRating?.id) {
        const result = await fetchGraphQL(UPDATE_RATING, {
          id: existingRating.id,
          input: {
            stars,
            notes: formData.notes,
            scalability: formData.scalability,
            mental_stability: formData.mental_stability,
            soccer_intelligence: formData.soccer_intelligence,
            physical_fitness: formData.physical_fitness,
            technical_skill: formData.technical_skill,
            tactical_vision: formData.tactical_vision,
            republican_influence: formData.republican_influence,
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
            scalability: formData.scalability,
            mental_stability: formData.mental_stability,
            soccer_intelligence: formData.soccer_intelligence,
            physical_fitness: formData.physical_fitness,
            technical_skill: formData.technical_skill,
            tactical_vision: formData.tactical_vision,
            republican_influence: formData.republican_influence,
            notes: formData.notes,
            stars,
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

  const displayStars = calculateStarsFromSkills();
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

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Auto-calculated Stars Preview */}
                <div
                  className={`text-center py-4 rounded-xl ${inputBg} border ${borderColor}`}
                >
                  <p className={`text-sm ${textSecondary} mb-2`}>
                    {t("Rating Preview")}:
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((star) => (
                      <Star
                        key={star}
                        size={28}
                        className={`${
                          star <= displayStars
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-600 text-gray-600"
                        } transition`}
                      />
                    ))}
                  </div>
                  <p className={`text-2xl font-bold text-yellow-400 mt-2`}>
                    {displayStars} / 7
                  </p>
                </div>

                {/* Skills Checkboxes */}
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
                          checked={
                            formData[key as keyof RatingFormData] as boolean
                          }
                          onChange={(e) =>
                            handleSkillChange(
                              key as keyof RatingFormData,
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

                {/* Notes */}
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
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
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
                    disabled={loading}
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
