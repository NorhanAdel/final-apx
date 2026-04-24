"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/ThemeContext";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import useTranslate from "../hooks/useTranslate";

interface PostProps {
  id: string;
}

interface Blog {
  id: string;
  title: string;
  created_at: string;
  cover_image_url: string;
}

export default function BlogCard({ id }: PostProps) {
  const router = useRouter();
  const { lang } = useTranslate();
  const { theme } = useTheme();

  const [blog, setBlog] = useState<Blog | null>(null);

  useEffect(() => {
    fetchBlog();
  }, [lang, id]);

  const fetchBlog = async () => {
    const query = `
      query GetBlog($id: ID!) {
        blog(id: $id) {
          id
          title
          created_at
          cover_image_url
        }
      }
    `;

    const result = await fetchGraphQL<{ blog: Blog }>(
      query,
      { id }
    );

    if (result.data?.blog) {
      setBlog(result.data.blog);
    }
  };

  if (!blog) return null;

  return (
    <div
      onClick={() => router.push(`/blog/${id}`)}
      className={`relative group cursor-pointer overflow-hidden rounded-sm border shadow-2xl
      ${theme === "dark" ? "bg-[#0a0c14] border-white/5" : "bg-white border-gray-200"}`}
    >
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={
            blog.cover_image_url?.startsWith("http")
              ? blog.cover_image_url
              : `${process.env.NEXT_PUBLIC_API_URL}${blog.cover_image_url}`
          }
          alt={blog.title}
          fill
          className="object-cover opacity-70 group-hover:opacity-100 transition-all duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-transparent opacity-90" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-white text-xl font-black mb-2">
          {blog.title}
        </h3>

        <p className="text-[#8e9196] text-[10px] text-right">
          {new Date(blog.created_at).toLocaleDateString(lang)}
        </p>
      </div>
    </div>
  );
}