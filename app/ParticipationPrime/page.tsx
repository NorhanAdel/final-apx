"use client";

import React, { useState } from "react";
import { ChevronLeft, Star } from "lucide-react";

export default function ParticipationPrime() {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleUpgrade = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen py-30 bg-[#020617] text-white flex flex-col items-center justify-center relative overflow-hidden px-4">
 
      <div className="w-full max-w-3xl flex items-center my-16">
        

        <h1 className="flex-1 text-center text-yellow-400 text-3xl md:text-4xl font-extrabold italic tracking-wider">
          Participation Prime
        </h1>
      </div>

      
      <div className="relative w-full max-w-md">

        <div className="bg-[#050B18] border-y-2  border-[#FFD700]  rounded-xl p-8 relative shadow-xl">

          
          <div className="absolute top-6 left-0 flex items-center">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-300 text-black px-6 py-2 text-xl font-bold italic flex items-center gap-2 rounded-r-md">
              <Star size={18} fill="black" />
              Prime
            </div>

            
            <div className="w-0 h-0 border-t-[18px] border-t-transparent border-l-[14px] border-l-yellow-700 border-b-[18px] border-b-transparent -ml-1"></div>
          </div>

           <div className="mt-20 space-y-6">

            
            <div className="flex items-center gap-3">
              <div className="bg-white w-5 h-5 flex items-center justify-center rounded-sm text-black text-xs">
                📝
              </div>

              <span className="text-lg md:text-xl font-bold italic">
                Send Requests
              </span>
            </div>

       
            <div className="flex justify-end items-center gap-2">
              <span className="text-yellow-400 text-3xl font-extrabold italic">
                120
              </span>

              <div className="flex flex-col -space-y-1">
                <div className="w-4 h-[2px] bg-yellow-400 rotate-45"></div>
                <div className="w-4 h-[2px] bg-yellow-400 -rotate-45"></div>
              </div>
            </div>

            
            <div className="h-[1px] bg-blue-900/40"></div>

            
            <button
              onClick={handleUpgrade}
              className="w-full py-3 rounded-lg border-x-3  border-[#FFD700] text-lg font-bold italic bg-[#0A1A44] hover:bg-yellow-400 hover:text-black transition-all duration-300"
            >
              Upgrade
            </button>
          </div>
        </div>

      
        <div className="absolute -z-10 w-[120%] h-[120%] bg-blue-900/10 blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
      </div>

       
      <p className="mt-10 text-gray-500 text-xs italic tracking-widest">
        Exclusive features for pro clubs
      </p>
    </div>
  );
}