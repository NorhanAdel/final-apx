"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import { GET_AVAILABLE_AD_DURATIONS, GET_AVAILABLE_AD_DURATIONS_FOR_ORG } from "@/app/graphql/query/ad.queries";
import { useAuth } from "@/app/context/auth-context";

interface AdDuration {
  id: string;
  days: number;
  price: number;
}

interface Props {
  onSelect: (duration: AdDuration) => void;
  selectedId?: string;
  className?: string;
}

interface GraphQLResponse {
  data: {
    availableAdDurationsForPlayer?: AdDuration[];
    availableAdDurationsForOrg?: AdDuration[];
  };
  errors?: Array<{ message: string }>;
}

export function AdDurationSelector({
  onSelect,
  selectedId,
  className = "",
}: Props) {
  const { user, isLoading: authLoading } = useAuth();
  const [durations, setDurations] = useState<AdDuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDurations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const isOrg = ["CLUB", "SCOUT", "AGENT"].includes(user?.role || "");
      const query = isOrg ? GET_AVAILABLE_AD_DURATIONS_FOR_ORG : GET_AVAILABLE_AD_DURATIONS;

      const result = (await fetchGraphQL(
        query,
      )) as GraphQLResponse;

      const adDurations = isOrg
        ? result?.data?.availableAdDurationsForOrg || []
        : result?.data?.availableAdDurationsForPlayer || [];
        
      setDurations(adDurations);

      if (adDurations.length > 0 && !selectedId) {
        onSelect(adDurations[0]);
      }
    } catch (err) {
      console.error("Error fetching ad durations:", err);
      setError("Failed to load ad durations");
    } finally {
      setLoading(false);
    }
  }, [selectedId, onSelect, user?.role]);

  useEffect(() => {
    if (!authLoading) {
      fetchDurations();
    }
  }, [fetchDurations, authLoading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        <button
          onClick={fetchDurations}
          className="mt-2 px-4 py-2 bg-yellow-400 text-black rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (durations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No ad durations available</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${className}`}
    >
      {durations.map((duration) => (
        <button
          key={duration.id}
          onClick={() => onSelect(duration)}
          className={`
            p-4 rounded-xl border-2 transition-all duration-200
            ${
              selectedId === duration.id
                ? "border-yellow-400 bg-yellow-400/10 shadow-lg scale-105"
                : "border-gray-300 dark:border-gray-600 hover:border-yellow-400 hover:scale-105"
            }
          `}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {duration.days}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">days</div>
            <div className="text-xl font-bold mt-2">${duration.price}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
