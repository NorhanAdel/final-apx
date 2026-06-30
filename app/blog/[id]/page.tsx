"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Calendar, Eye } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import useTranslate from "../../hooks/useTranslate";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import { GET_BLOG_BY_ID } from "@/app/graphql/query/blog.queries";
import { INCREMENT_BLOG_VIEWS } from "@/app/graphql/mutation/blog.mutations";
import BackButton from "@/app/components/BackButton";
import { motion } from "framer-motion";

type Blog = {
  id: string;
  title: string;
  content: string;
  cover_image_url: string | null;
  created_at: string;
  views_count: number;
};

export default function BlogDetailsLikeEvent({ lang }: { lang: string }) {
  const { theme } = useTheme();
  const { t } = useTranslate(lang);

  const params = useParams();
  const blogId = params?.id as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const hasIncremented = useRef(false);

  const isDark = theme === "dark";

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const fetchBlog = useCallback(async () => {
    if (!blogId) return;
    setLoading(true);

    try {
      const result = await fetchGraphQL<{ blog: Blog }>(GET_BLOG_BY_ID, {
        id: blogId,
      });

      const fetchedBlog = result.data?.blog;

      if (fetchedBlog) {
        setBlog(fetchedBlog);
      } else {
        setBlog(null);
      }
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  const incrementViews = useCallback(async () => {
    if (!isLoggedIn || hasIncremented.current) return;

    try {
      const result = await fetchGraphQL<{
        incrementBlogViews: { views_count: number };
      }>(INCREMENT_BLOG_VIEWS, { id: blogId });

      if (result.data?.incrementBlogViews) {
        hasIncremented.current = true;
        setBlog((prev) =>
          prev
            ? {
                ...prev,
                views_count: result.data!.incrementBlogViews.views_count,
              }
            : prev
        );
      }
    } catch {}
  }, [isLoggedIn, blogId]);

  useEffect(() => {
    const load = async () => {
      await fetchBlog();
      await incrementViews();
    };
    load();
  }, [fetchBlog, incrementViews]);

  const getImageUrl = (url: string | null) => {
    if (!url) return "/b3.jpg";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(
      lang === "ar" ? "ar-EG" : "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    );

  const formatViews = (views: number) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + "M";
    if (views >= 1000) return (views / 1000).toFixed(1) + "K";
    return views.toString();
  };

  const bg = isDark ? "bg-[#030308]" : "bg-gray-50";
  const text = isDark ? "text-white" : "text-gray-900";
  const cardBg = isDark ? "bg-[#0c0d1e]" : "bg-white";
  const border = isDark ? "border-white/[0.06]" : "border-[#CE1126]/10";
  const innerSection = isDark ? "bg-[#11122b]" : "bg-gray-100";

  if (loading || !blog) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <div className="w-10 h-10 border-4 border-[#CE1126] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden px-4 sm:px-6 md:px-12 lg:px-20 xl:px-28 py-32 transition-colors duration-300 ${bg} ${text}`}>
      
      {!imageError && blog.cover_image_url && (
        <div className="absolute top-0 left-0 right-0 h-[400px] pointer-events-none opacity-15 dark:opacity-20 blur-3xl select-none">
          <Image
            src={getImageUrl(blog.cover_image_url)}
            alt=""
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="mb-8">
          <BackButton />
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-3xl overflow-hidden border ${border} ${cardBg} shadow-2xl items-stretch`}>
          
          <div className="lg:col-span-5 relative h-[350px] lg:h-auto min-h-[400px] bg-neutral-900">
            {!imageError && blog.cover_image_url ? (
              <Image
                src={getImageUrl(blog.cover_image_url)}
                alt={blog.title}
                fill
                priority
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-black uppercase tracking-widest">
                No Preview Available
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/80 via-black/10 to-transparent" />
          </div>

          <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-between">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 flex-1 flex flex-col"
            >
              <div className="space-y-4">
                <div className="relative">
                  <h1 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tight leading-tight">
                    {blog.title}
                  </h1>
                  <div className="w-16 h-[4px] bg-[#CE1126] mt-3 rounded-full" />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${border} ${innerSection} text-xs font-bold`}>
                  <Calendar size={14} className="text-[#CE1126]" />
                  <span className="text-gray-400 font-mono">{formatDate(blog.created_at)}</span>
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${border} ${innerSection} text-xs font-bold`}>
                  <Eye size={14} className="text-[#CE1126]" />
                  <span className="text-gray-400 font-mono">{formatViews(blog.views_count)}</span>
                </div>
              </div>

              <div className={`flex-1 flex flex-col p-5 rounded-2xl border ${border} ${innerSection} min-h-[250px]`}>
                <div className="max-h-[280px] lg:max-h-[340px] overflow-y-auto pr-2 custom-modern-scroll flex-1">
                  <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    {blog.content}
                  </p>
                </div>
              </div>

              {!isLoggedIn && (
                <div className="text-[11px] font-bold text-[#CE1126] bg-[#CE1126]/5 border border-[#CE1126]/10 p-3 rounded-xl tracking-wide">
                  {t("login_to_see_views") || "Login to contribute to view count"}
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        .custom-modern-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-modern-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-modern-scroll::-webkit-scrollbar-thumb {
          background: #CE1126;
          border-radius: 10px;
        }
        .custom-modern-scroll::-webkit-scrollbar-thumb:hover {
          background: #A00D1D;
        }
      `}</style>
    </div>
  );
}
