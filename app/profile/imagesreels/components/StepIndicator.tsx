"use client";

import { User, Trophy, DollarSign, Image as ImageIcon } from "lucide-react";

interface Props {
  currentStep: number;
  isDark: boolean;
  t: (key: string) => string;
}

const steps = [
  { icon: User, label: "Personal Info" },
  { icon: Trophy, label: "Football Info" },
  { icon: DollarSign, label: "Pricing" },
  { icon: ImageIcon, label: "Media" },
];

export function StepIndicator({ currentStep, isDark }: Props) {
  return (
    <div className="flex justify-center items-center gap-6 mb-14">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-6">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
              index + 1 === currentStep
                ? "bg-yellow-400 text-black"
                : isDark
                ? "bg-[#0b1120] border border-[#1e293b] text-gray-400"
                : "bg-white border border-gray-300 text-gray-500"
            }`}
          >
            <step.icon />
          </div>
          {index < steps.length - 1 && (
            <div className={`w-16 h-[2px] ${isDark ? "bg-[#1e293b]" : "bg-gray-300"}`} />
          )}
        </div>
      ))}
    </div>
  );
}