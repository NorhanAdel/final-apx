import { motion } from "framer-motion";
import {
  Star,
  Shield,
  Users,
  Brain,
  Zap,
  Heart,
  Eye,
  TrendingUp,
  Activity,
  Target,
  Crown,
} from "lucide-react";
import useTranslate from "@/app/hooks/useTranslate";

interface BreakdownItem {
  name: string;
  value: number;
  icon: any;
  color: string;
}

interface Super7BreakdownProps {
  items: BreakdownItem[];
  isDark: boolean;
}

export default function Super7Breakdown({ items, isDark }: Super7BreakdownProps) {
  const { t } = useTranslate();

  return (
    <div className="w-full max-w-3xl mt-4 pt-4 border-t border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <Crown size={16} className="text-yellow-500" />
        <h3
          className={`text-xs font-bold uppercase tracking-wider ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {t("Super7 Score Breakdown")}
        </h3>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            className={`flex items-center justify-between gap-4 px-4 py-2 rounded-2xl border transition-all duration-300 ${
              isDark
                ? "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.05]"
                : "bg-gray-50 border-gray-100 hover:border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 min-w-[160px] sm:min-w-[180px]">
              <div
                className="p-1.5 rounded-lg flex-shrink-0"
                style={{
                  backgroundColor: `${item.color}15`,
                  color: item.color,
                }}
              >
                <item.icon size={15} />
              </div>
              <span
                className={`text-xs sm:text-sm font-bold truncate ${
                  isDark ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {item.name}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div
                className={`flex-1 h-2 rounded-full overflow-hidden p-0.5 ${
                  isDark ? "bg-black/50" : "bg-gray-200"
                }`}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{
                    duration: 1,
                    delay: 0.2 + index * 0.05,
                    ease: "easeOut",
                  }}
                  className="h-full rounded-full relative"
                  style={{
                    background: `linear-gradient(90deg, ${item.color}, ${item.color}aa)`,
                    boxShadow: `0 0 6px ${item.color}44`,
                  }}
                />
              </div>
              <span
                className="text-xs font-black px-2 py-0.5 rounded-md min-w-[42px] text-center flex-shrink-0"
                style={{
                  backgroundColor: `${item.color}20`,
                  color: item.color,
                }}
              >
                {Math.round(item.value)}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}