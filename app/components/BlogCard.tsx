"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GET_BLOG_BY_ID } from "@/app/graphql/query/blog.queries";
import { Eye, Calendar } from "lucide-react";
import useTranslate from "../hooks/useTranslate";
import { useTheme } from "../context/ThemeContext";
import { fetchGraphQL } from "../lib/fetchGraphQL";

interface PostProps {
  id: string;
}

interface Blog {
  id: string;
  title: string;
  created_at: string;
  cover_image_url: string;
  views_count: number;
}

export default function BlogCard({ id }: PostProps) {
  const router = useRouter();
  const { lang } = useTranslate();
  const { theme } = useTheme();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchBlog = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchGraphQL<{ blog: Blog }>(GET_BLOG_BY_ID, { id });

      if (result.data?.blog) {
        setBlog(result.data.blog);
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const getImageUrl = (url: string) => {
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
          month: "short",
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

  if (loading) {
    return (
      <div
        className={`relative rounded-xl border shadow-lg overflow-hidden aspect-[3/4] min-h-[300px]
        ${
          theme === "dark"
            ? "bg-[#0a0c14] border-white/5"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div
      onClick={() => router.push(`/blog/${id}`)}
      className={`relative group cursor-pointer overflow-hidden rounded-xl border shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl min-h-[350px]
      ${
        theme === "dark"
          ? "bg-[#0a0c14] border-white/5"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {!imageError && blog.cover_image_url ? (
          <Image
            src={getImageUrl(blog.cover_image_url)}
            alt={blog.title || "Blog image"}
            fill
            className="object-cover group-hover:scale-105 transition-all duration-700"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${
              theme === "dark" ? "bg-[#1a1c24]" : "bg-gray-200"
            }`}
          >
            <svg
              className={`w-16 h-16 ${
                theme === "dark" ? "text-gray-600" : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3
          className={`text-white text-base md:text-lg lg:text-xl font-bold mb-2 line-clamp-3 leading-relaxed ${
            theme === "dark" ? "drop-shadow-lg" : "drop-shadow-md"
          }`}
        >
          {blog.title}
        </h3>

        <div className="flex justify-between items-center text-xs text-gray-300">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(blog.created_at)}
          </span>

          <span className="flex items-center gap-1">
            <Eye size={12} />
            {formatViews(blog.views_count || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
