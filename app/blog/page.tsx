"use client";

import { useEffect, useState } from "react";
import BlogCard from "../components/BlogCard";
import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";

interface Blog {
  id: string;
  title: string;
  created_at: string;
  cover_image_url: string;
}

const GET_ALL_BLOGS = `
  query GetAllBlogs($skip: Int, $take: Int) {
    blogs(skip: $skip, take: $take) {
      id
      title
      created_at
      cover_image_url
    }
  }
`;

export default function BlogPage() {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filtered, setFiltered] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Newest");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const result = await fetchGraphQL<{ blogs: Blog[] }>(GET_ALL_BLOGS, {
        skip: 0,
        take: 50,
      });

      if (result.data?.blogs) {
        setBlogs(result.data.blogs);
        setFiltered(result.data.blogs);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let data = [...blogs];

    if (search) {
      data = data.filter((b) =>
        b.title.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (sort === "Newest") {
      data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    } else if (sort === "Oldest") {
      data.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    }

    setFiltered(data);
  }, [search, sort, blogs]);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark" ? "bg-[#05070a]" : "bg-white"
        }`}
      >
        <div className="w-10 h-10 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen px-4 sm:px-6 md:px-12 pb-30
        ${
          theme === "dark" ? "bg-[#05070a] text-white" : "bg-white text-black"
        }`}
    >
      <div className="max-w-7xl mx-auto pt-32">
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <input
            type="text"
            placeholder={t("search_blogs") || "Search blogs..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`flex-1 rounded-lg py-3 px-4 text-sm font-semibold
              ${
                theme === "dark"
                  ? "bg-[#0a0c14] border border-gray-800 text-white placeholder-gray-400"
                  : "bg-gray-100 border border-gray-300 text-black placeholder-gray-500"
              }`}
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className={`rounded-lg py-2 px-6 text-sm font-semibold
              ${
                theme === "dark"
                  ? "bg-[#0a0c14] border border-gray-800 text-white"
                  : "bg-gray-100 border border-gray-300 text-black"
              }`}
          >
            <option value="Newest">{t("newest") || "Newest"}</option>
            <option value="Oldest">{t("oldest") || "Oldest"}</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center">{t("no_blogs") || "No blogs found"}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((blog) => (
              <BlogCard key={blog.id} id={blog.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
