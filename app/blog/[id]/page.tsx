"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import useTranslate from "../../hooks/useTranslate";

type Blog = {
  id: string;
  title: string;
  content: string;
  cover_image_url: string | null;
  created_at: string;
};

export default function BlogDetails({ lang }: { lang: string }) {
  const { theme } = useTheme();
  const { t } = useTranslate(lang);

  const params = useParams();
  const blogId = params.id;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchBlog();
  }, [lang, blogId]);

  const fetchBlog = async () => {
    if (!blogId) return;

    setLoading(true);

    const query = `
      query GetBlog($id: ID!) {
        blog(id: $id) {
          id
          title
          content
          cover_image_url
          created_at
        }
      }
    `;

    const result = await fetchGraphQL<{ blog: Blog }>(
      query,
      { id: blogId }
    );

    if (result.data?.blog) {
      setBlog(result.data.blog);
    } else {
      setBlog(null);
    }

    setLoading(false);
  };

 
  if (!mounted) return null;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t("loading") || "Loading..."}
      </div>
    );

  if (!blog)
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t("not_found") || "Blog not found"}
      </div>
    );

  return (
    <section
      className={`min-h-screen flex items-center justify-center px-6 py-28 ${
        theme === "dark" ? "bg-[#020617]" : "bg-gray-50"
      }`}
    >
      <div
        className={`max-w-6xl w-full grid md:grid-cols-2 rounded-xl overflow-hidden shadow-2xl border ${
          theme === "dark" ? "border-blue-900" : "border-gray-300"
        }`}
      >
        <div className="relative h-[100%]">
          <Image
            src={
              blog.cover_image_url
                ? blog.cover_image_url.startsWith("http")
                  ? blog.cover_image_url
                  : `${process.env.NEXT_PUBLIC_API_URL}${blog.cover_image_url}`
                : "/b3.jpg"
            }
            alt={blog.title}
            fill
            className="object-cover"
          />
        </div>

        <div
          className={`p-10 ${
            theme === "dark"
              ? "bg-[#06122a] text-white"
              : "bg-white text-black"
          }`}
        >
          <h1 className="text-4xl font-bold text-[#F0B100] mb-6">
            {blog.title}
          </h1>

          <p className="text-sm opacity-70 mb-4">
            {new Date(blog.created_at).toLocaleDateString(lang)}
          </p>

          <div className="space-y-4 text-[18px] leading-relaxed">
            {blog.content.split("\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}