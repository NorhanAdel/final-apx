"use client";

import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

type CardProps = {
  title: string;
  icon: ReactNode;
  danger?: boolean;
};

export default function Card({ title, icon, danger }: CardProps) {
  return (
    <div
      className={`flex items-center justify-between 
      bg-[#06143a] 
      border-l border-r 
      ${danger ? "border-red-500" : "border-[#0f2c78]"} 
      rounded-md px-5 py-4`}
    >
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0c2a70] text-yellow-400">
          {icon}
        </div>

        <span className="text-sm text-gray-200">
          {title}
        </span>
      </div>

      <div className="w-7 h-7 flex items-center justify-center bg-[#0c2a70] rounded">
        <ChevronRight size={16} className="text-yellow-400" />
      </div>
    </div>
  );
}