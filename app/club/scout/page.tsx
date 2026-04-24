"use client";

import { PlayerCard } from '@/app/components/PlayerCard';
import { Search, ChevronDown } from 'lucide-react';
import Link from "next/link";
import { useTheme } from "../../context/ThemeContext";

const players = [
  { id: 1, name: 'Ronaldo', image: '/b2.jpg', rating: 5, position: 'Forward', country: 'Saudi Arabia', age: 41 },
  { id: 2, name: 'Luis Díaz', image: '/b3.jpg', rating: 4, position: 'Forward', country: 'Saudi Arabia', age: 24 },
  { id: 3, name: 'Milos Kerkez', image: '/b3.jpg', rating: 4, position: 'Forward', country: 'Saudi Arabia', age: 24 },
  { id: 4, name: 'Ronaldo', image: '/b2.jpg', rating: 5, position: 'Forward', country: 'Saudi Arabia', age: 41 },
  { id: 5, name: 'Luis Díaz', image: '/b3.jpg', rating: 4, position: 'Forward', country: 'Saudi Arabia', age: 24 },
  { id: 6, name: 'Milos Kerkez', image: '/b3.jpg', rating: 4, position: 'Forward', country: 'Saudi Arabia', age: 24 },
];

export default function ScoutPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen pb-15 p-8 transition
      ${isDark ? "bg-[#01040a] text-white" : "bg-gray-100 text-black"}`}>

      {/* Top Section */}
      <div className="max-w-7xl mx-auto mb-10 pt-38 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-3xl">
          <Search 
            className={`absolute left-4 top-1/2 -translate-y-1/2
              ${isDark ? "text-[#eab308]/60" : "text-gray-400"}`} 
            size={18} 
          />

          <input 
            type="text" 
            placeholder="Search"
            className={`w-full rounded-lg py-3 pl-12 pr-4 text-sm italic font-bold focus:outline-none transition
              ${isDark 
                ? "bg-[#030816] border border-[#eab308]/20 text-[#eab308] focus:border-[#eab308]/50" 
                : "bg-white border border-gray-300 text-black focus:border-yellow-500"}`}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className={`text-xs font-bold italic mr-2
            ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Sort
          </span>

          {['Highest Rated', 'Newest', 'Most Popular'].map((filter) => (
            <button 
              key={filter} 
              className={`flex items-center justify-between gap-4 px-4 py-2.5 rounded-lg text-[11px] font-bold transition min-w-[120px]
                ${isDark 
                  ? "bg-[#030816] border border-white/10 hover:bg-white/5 text-white" 
                  : "bg-white border border-gray-300 hover:bg-gray-100 text-black"}`}
            >
              {filter}
              <ChevronDown 
                size={14} 
                className={`${isDark ? "text-gray-500" : "text-gray-400"}`} 
              />
            </button>
          ))}
        </div>
      </div>     

      {/* Title */}
      <h1 className={`text-center text-3xl font-bold mb-20
        ${isDark ? "text-yellow-400" : "text-yellow-600"}`}>
        My Scout
      </h1>

      {/* Players */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((player) => (
          <Link key={player.id} href={`/players/${player.id}`}>
            <div className="cursor-pointer">
              <PlayerCard {...player} /> 
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}