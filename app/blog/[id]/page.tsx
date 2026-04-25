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
    if (!isLoggedIn || hasIncremented.current) {
      return;
    }

    try {
      const result = await fetchGraphQL<{
        incrementBlogViews: { id: string; views_count: number };
      }>(INCREMENT_BLOG_VIEWS, { id: blogId });

      if (result.data?.incrementBlogViews) {
        hasIncremented.current = true;
        setBlog((prev) =>
          prev
            ? {
                ...prev,
                views_count: result.data!.incrementBlogViews.views_count,
              }
            : prev,
        );
      }
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  }, [isLoggedIn, blogId]);

  useEffect(() => {
    const loadBlog = async () => {
      await fetchBlog();
      await incrementViews();
    };

    loadBlog();
  }, [fetchBlog, incrementViews]);

  const getImageUrl = (url: string | null) => {
    if (!url) return "/b3.jpg";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(
        lang === "ar"
          ? "ar-EG"
          : lang === "pt"
          ? "pt-PT"
          : lang === "zh"
          ? "zh-CN"
          : "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      );
    } catch {
      return dateString;
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + "M";
    }
    if (views >= 1000) {
      return (views / 1000).toFixed(1) + "K";
    }
    return views.toString();
  };

  if (!mounted) return null;

  if (loading)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark" ? "bg-[#020617]" : "bg-gray-50"
        }`}
      >
        <div className="w-12 h-12 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!blog)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark" ? "bg-[#020617]" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <p className="text-gray-500">{t("not_found") || "Blog not found"}</p>
          <BackButton defaultUrl="/blog" />
        </div>
      </div>
    );

  return (
    <section
      className={`min-h-screen px-6 py-28 ${
        theme === "dark" ? "bg-[#020617]" : "bg-gray-50"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <BackButton className="mb-6" />

        <div
          className={`grid md:grid-cols-2 rounded-xl overflow-hidden shadow-2xl border ${
            theme === "dark" ? "border-blue-900" : "border-gray-300"
          }`}
        >
          {/* Image Section */}
          <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gray-900">
            {!imageError && blog.cover_image_url ? (
              <div className="relative w-full h-full">
                <Image
                  src={getImageUrl(blog.cover_image_url)}
                  alt={blog.title}
                  fill
                  className="object-contain md:object-cover"
                  onError={() => setImageError(true)}
                  unoptimized
                  priority
                />
              </div>
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center ${
                  theme === "dark" ? "bg-[#1a1c24]" : "bg-gray-200"
                }`}
              >
                <span
                  className={
                    theme === "dark" ? "text-gray-500" : "text-gray-400"
                  }
                >
                  No image
                </span>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div
            className={`p-6 md:p-8 lg:p-10 overflow-y-auto max-h-[600px] ${
              theme === "dark"
                ? "bg-[#06122a] text-white"
                : "bg-white text-black"
            }`}
          >
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#F0B100] mb-4">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-gray-700/50">
              <span className="flex items-center gap-2 text-xs md:text-sm opacity-70">
                <Calendar size={14} />
                {formatDate(blog.created_at)}
              </span>
              <span className="flex items-center gap-2 text-xs md:text-sm opacity-70">
                <Eye size={14} />
                {formatViews(blog.views_count || 0)} {t("views") || "views"}
              </span>
            </div>

            <div className="space-y-3 text-sm md:text-base lg:text-lg leading-relaxed">
              {blog.content.split("\n").map((paragraph, i) => (
                <p key={i} className="mb-3">
                  {paragraph}
                </p>
              ))}
            </div>

            {!isLoggedIn && (
              <div className="mt-6 p-3 md:p-4 rounded-lg bg-yellow-400/10 border border-yellow-400/30">
                <p className="text-xs md:text-sm text-yellow-400 text-center">
                  {t("login_to_see_views") ||
                    "Login to contribute to view count"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
