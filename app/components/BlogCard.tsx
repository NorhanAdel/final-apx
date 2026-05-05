"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, Calendar } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

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

  const getImage = (url?: string) => {
    if (!url) return "/b3.jpg";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  return (
    <div
      onClick={() => router.push(`/blog/${blog.id}`)}
      className={`cursor-pointer rounded-xl overflow-hidden border transition hover:scale-[1.02]
      ${
        theme === "dark"
          ? "bg-[#0a0c14] border-white/5"
          : "bg-white border-gray-200"
      }`}
    >
      {/* IMAGE */}
      <div className="h-[220px] relative">
        <Image
          src={getImage(blog.cover_image_url)}
          alt={blog.title}
          fill
          className="object-cover"
        />
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <h3 className="font-bold mb-2 line-clamp-2">
          {blog.title}
        </h3>

        <div className="flex justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(blog.created_at).toLocaleDateString()}
          </span>

          <span className="flex items-center gap-1">
            <Eye size={12} />
            {blog.views_count}
          </span>
        </div>
      </div>
    </div>
  );
}
