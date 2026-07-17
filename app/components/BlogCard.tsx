"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, Calendar } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";

interface Blog {
  id: string;
  title: string;
  created_at: string;
  cover_image_url: string;
  views_count: number;
}

export default function BlogCard({ blog }: { blog: Blog }) {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useTranslate();

  const getImage = (url?: string) => {
    if (!url) return "/b3.jpg";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  return (
    <div
      onClick={() => router.push(`/blog/${blog.id}`)}
      className="
        group cursor-pointer
        relative
        h-[420px]
        rounded-3xl overflow-hidden
        transition-all duration-500
        hover:-translate-y-2 hover:shadow-2xl
      "
    >
      {/* IMAGE */}
      <Image
        src={getImage(blog.cover_image_url)}
        alt={blog.title}
        fill
        className="
          object-cover
          scale-105
          transition duration-700
          group-hover:scale-110
        "
      />

      {/* GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* TOP BADGE (DATE + VIEWS) */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">

        {/* DATE */}
        <div
          className="
            flex items-center gap-2
            px-3 py-1
            rounded-full
            bg-black/40
            backdrop-blur-md
            border border-white/10
          "
        >
          <Calendar size={14} className="text-yellow-400" />
          <span className="text-xs text-white">
            {new Date(blog.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* VIEWS */}
        <div
          className="
            flex items-center gap-2
            px-3 py-1
            rounded-full
            bg-black/40
            backdrop-blur-md
            border border-white/10
          "
        >
          <Eye size={14} className="text-yellow-400" />
          <span className="text-xs text-white">
            {blog.views_count}
          </span>
        </div>

      </div>

      {/* TITLE AREA */}
      <div className="absolute bottom-0 p-6 w-full">

        <h3 className="
          text-white
          text-xl md:text-2xl
          font-extrabold
          leading-snug
          line-clamp-2
        ">
          {blog.title}
        </h3>

        {/* CTA */}
        <div
          className="
            mt-4
            flex items-center justify-between
          "
        >
          <span className="text-white/60 text-sm">
            {t("Read article")}
          </span>

          <span
            className="
              text-yellow-400 text-sm font-bold
              opacity-0 group-hover:opacity-100
              transition
            "
          >
            {t("Open →")}
          </span>
        </div>

      </div>

      {/* HOVER LIGHT EFFECT */}
      <div
        className="
          absolute inset-0
          opacity-0 group-hover:opacity-100
          transition
          bg-gradient-to-t from-yellow-500/10 to-transparent
        "
      />
    </div>
  );
}