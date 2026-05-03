"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Calendar, Eye } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import useTranslate from "../../hooks/useTranslate";
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

export default function BlogDetails({ lang }: { lang: string }) {
  const { theme } = useTheme();
  const { t } = useTranslate(lang);

  const params = useParams();
  const blogId = params.id as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const hasIncremented = useRef(false);

  const isDark = theme === "dark";

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const fetchBlog = useCallback(async () => {
    if (!blogId) return;

    setLoading(true);

    const result = await fetchGraphQL<{ blog: Blog }>(GET_BLOG_BY_ID, {
      id: blogId,
    });

    if (result.data?.blog) {
      setBlog(result.data.blog);
    } else {
      setBlog(null);
    }

    setLoading(false);
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

  if (!mounted) return null;

  if (loading || !blog) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-black" : "bg-gray-100"
        }`}
      >
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen px-4 pt-24 pb-16 ${
        isDark
          ? "bg-[#0a0f2c] text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <BackButton className="mb-6" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-10"
        >
          {/* IMAGE */}
          <div className="relative h-[480px] rounded-3xl overflow-hidden border shadow-2xl group">
            {!imageError && blog.cover_image_url ? (
              <>
                <Image
                  src={getImageUrl(blog.cover_image_url)}
                  alt={blog.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-110"
                  onError={() => setImageError(true)}
                  priority
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-xl font-bold text-white">
                    {blog.title}
                  </h2>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#111] text-gray-400">
                No Image
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="flex flex-col gap-6">

            <h1
              className={`text-4xl font-bold ${
                isDark ? "text-yellow-400" : "text-yellow-600"
              }`}
            >
              {blog.title}
            </h1>

            <div
              className={`flex gap-4 p-4 rounded-xl border text-sm ${
                isDark
                  ? "bg-white/5 border-white/10 text-gray-300"
                  : "bg-white border-gray-300 text-gray-700"
              }`}
            >
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {formatDate(blog.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={14} /> {formatViews(blog.views_count)}
              </span>
            </div>

            {/* CONTENT SCROLL */}
            <div
              className={`rounded-2xl p-5 border ${
                isDark
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-gray-300"
              }`}
            >
              <div className="max-h-[300px] overflow-y-auto pr-2 custom-scroll">
                <p
                  className={`text-xl leading-relaxed whitespace-pre-line ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {blog.content}
                </p>
              </div>
            </div>

            {!isLoggedIn && (
              <div className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 p-3 rounded-xl">
                {t("login_to_see_views") ||
                  "Login to contribute to view count"}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #f0b100;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}