"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Pencil,
  Hourglass,
  ChevronDown,
  ChevronUp,
  Trophy,
} from "lucide-react";

import { toast } from "sonner";
import { useParams } from "next/navigation";
import { fetchGraphQL } from "../../lib/fetchGraphQL";

export default function CristianoChampionship() {
  const params = useParams();
  const id = params.id as string;

  const [openPrizes, setOpenPrizes] = useState(true);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [champion, setChampion] = useState<any>(null);

  // =========================
  // GET CHAMPION DETAILS
  // =========================
  const CHAMPION_QUERY = `
    query {
      champion(id: "${id}") {
        id
        title
        description
        photo_url
        winners_count
        status
        start_date
        expiry_date
        results_activated_at
        answers_count
        created_at
        updated_at

        prizes {
          id
          rank
          title
          description
        }

        winners {
          id
          rank
          user_id
          created_at

          answer {
            id
            user_id
            content
            created_at
          }

          prize {
            id
            rank
            title
            description
          }
        }

        my_answer {
          id
          user_id
          content
          created_at
        }
      }
    }
  `;

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    if (!id) return;

    const fetchChampion = async () => {
      try {
        setLoading(true);

        const res = await fetchGraphQL(CHAMPION_QUERY);

        if (res.errors?.length) {
          toast.error(res.errors[0].message);
          return;
        }

        setChampion(res?.data?.champion);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load championship");
      } finally {
        setLoading(false);
      }
    };

    fetchChampion();
  }, [id]);

  // =========================
  // SUBMIT ANSWER
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!answer.trim()) {
      toast.error("Please enter your answer");
      return;
    }

    if (answer.trim().length < 2) {
      toast.warning("Answer is too short");
      return;
    }

    try {
      setSubmitting(true);

      const mutation = `
        mutation {
          submitChampionAnswer(
            championId: "${id}",
            content: "${answer}"
          ) {
            id
            content
            created_at
            user_id
          }
        }
      `;

      const res = await fetchGraphQL(mutation);

      console.log(res);

      // Backend Errors
      if (res.errors?.length) {
        toast.error(res.errors[0].message);
        return;
      }

      toast.success("Answer submitted successfully");

      setChampion((prev: any) => ({
        ...prev,
        my_answer: res?.data?.submitChampionAnswer,
      }));

      setAnswer("");
    } catch (error) {
      console.log(error);

      toast.error("Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center text-white text-xl font-bold">
        Loading...
      </div>
    );
  }

  // =========================
  // NOT FOUND
  // =========================
  if (!champion) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center text-white text-xl font-bold">
        Championship Not Found
      </div>
    );
  }

  const hasWinners = champion?.winners?.length > 0;

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center px-6 py-30 font-sans"
      style={{
        backgroundImage: "url('/bgch.png')",
        backgroundColor: "#050510",
      }}
    >
      {/* Title */}
      <h1 className="text-[#d4af37] text-2xl md:text-3xl font-black italic uppercase mb-16 mt-8 tracking-wider text-center">
        {champion.title}
      </h1>

      {/* Question Card */}
      <div className="relative w-full max-w-2xl bg-[#0a0a20]/90 border border-yellow-600/40 rounded-2xl p-8 pt-16 shadow-2xl backdrop-blur-sm">
        {/* Championship Image */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#0a0a20] border-4 border-double border-yellow-600 rounded-full overflow-hidden">
          <Image
            src={champion.photo_url || "/Chapm.png"}
            alt={champion.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Question */}
        <p className="text-white text-lg md:text-xl font-bold italic text-center mb-8 leading-relaxed">
          {champion.description}
        </p>

        {/* User Answer */}
        {champion.my_answer ? (
          <div className="bg-[#151535] border border-green-600/40 rounded-xl p-5 text-center mb-6">
            <p className="text-green-400 font-black text-sm uppercase mb-2">
              Your Answer
            </p>

            <p className="text-white text-lg font-bold">
              {champion.my_answer.content}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Input */}
            <input
              type="text"
              placeholder="Write your answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full bg-[#151535] border border-blue-900/30 rounded-lg py-4 px-6 text-white text-sm italic placeholder:text-gray-500 focus:outline-none focus:border-yellow-600 transition-all mb-6"
            />

            {/* Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-900 to-blue-800 border border-yellow-600/50 rounded-lg py-3 flex items-center justify-center gap-3 text-white font-black italic uppercase tracking-widest hover:from-blue-800 hover:to-blue-700 transition-all disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Answer"}

              <Pencil size={18} className="text-yellow-500" />
            </button>
          </form>
        )}

        {/* End Date */}
        <div className="mt-8 flex justify-end items-center gap-2 text-yellow-500 font-bold italic text-sm">
          <Hourglass size={16} className="animate-pulse" />

          <span className="text-white/70 mr-1 uppercase text-xs tracking-tighter">
            End Date
          </span>

          <span>
            {new Date(champion.expiry_date).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Prizes */}
      <div className="w-full max-w-5xl mt-10">
        {/* Header */}
        <button
          onClick={() => setOpenPrizes(!openPrizes)}
          className="w-full flex justify-between items-center bg-[#0a0a20]/80 border border-yellow-600/40 rounded-xl p-4 hover:bg-[#151535] transition-all"
        >
          <h2 className="text-[#d4af37] text-2xl font-black italic uppercase">
            Prizes
          </h2>

          {openPrizes ? (
            <ChevronUp size={22} className="text-yellow-600" />
          ) : (
            <ChevronDown size={22} className="text-yellow-600" />
          )}
        </button>

        {/* Content */}
        <div
          className={`overflow-hidden transition-all duration-500 ${
            openPrizes
              ? "max-h-[3000px] opacity-100 mt-2"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-[#0a0a20]/75 border border-yellow-600/40 rounded-xl p-6 backdrop-blur-sm">
            {/* Prizes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {champion.prizes.map((prize: any) => (
                <div
                  key={prize.id}
                  className="bg-[#101030]/70 border border-yellow-600/30 rounded-2xl p-6 hover:border-yellow-500 transition-all"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-28 h-28 rounded-full border-2 border-yellow-500 flex items-center justify-center bg-[#101030]/70">
                      <Trophy size={50} className="text-yellow-400" />
                    </div>

                    <h3 className="mt-4 text-yellow-400 text-3xl font-black italic">
                      #{prize.rank}
                    </h3>

                    <p className="text-white font-black mt-2 text-lg">
                      {prize.title}
                    </p>

                    <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                      {prize.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Winners */}
            <div className="mt-12">
              <h3 className="text-yellow-400 text-xl font-black italic mb-5 uppercase">
                Winners
              </h3>

              {hasWinners ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {champion.winners.map((winner: any) => (
                    <div
                      key={winner.id}
                      className="flex items-center gap-4 bg-[#101a45]/90 border border-yellow-500 rounded-xl px-4 py-4"
                    >
                      {/* Rank */}
                      <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-black font-black text-lg">
                        {winner.rank}
                      </div>

                      {/* Info */}
                      <div className="flex flex-col">
                        <span className="text-white font-black">
                          {winner.prize?.title}
                        </span>

                        <span className="text-yellow-400 text-sm">
                          User ID: {winner.user_id}
                        </span>

                        <span className="text-gray-400 text-xs mt-1">
                          {winner.answer?.content}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="bg-[#151535]/90 border border-yellow-600 rounded-lg py-4 text-center text-white italic font-bold"
                    >
                      Will be announced soon
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}