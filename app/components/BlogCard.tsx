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
    className="cursor-pointer group"
  >
    <div className="relative w-full h-[450px] rounded-3xl overflow-hidden shadow-2xl">

      <Image
        src={getImage(blog.cover_image_url)}
        alt={blog.title}
        fill
        className="object-cover transition duration-500 group-hover:scale-105"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition" />

      {/* Content */}
      <div className="absolute bottom-5 left-0 right-0 text-center text-white px-4">

        <p className="text-sm opacity-70 mb-2">
          {new Date(blog.created_at).toLocaleDateString()}
        </p>

        {/* Views */}
        <div className="flex items-center justify-center gap-2 text-sm opacity-80 mb-2">
          👁️ {blog.views_count} views
        </div>

        <h3 className="text-xl md:text-2xl font-semibold line-clamp-2">
          {blog.title}
        </h3>

      </div>
    </div>
  </div>
);
}
