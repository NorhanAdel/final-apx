"use client";

import { useEffect, useState } from "react";
import BlogCard from "../components/BlogCard";
import { useTheme } from "../context/ThemeContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

interface Blog {
  id: string;
  title: string;
  created_at: string;
  cover_image_url: string;
}

export default function BlogPage() {
  const { theme } = useTheme();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filtered, setFiltered] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Newest");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const query = `
        query {
          blogs {
            id
            title
            cover_image_url
            created_at
          }
        }
      `;

      const res = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const json = await res.json();

      const formatted = json.data.blogs.map((b: any) => ({
        ...b,
        cover_image_url: b.cover_image_url
          ? b.cover_image_url.startsWith("http")
            ? b.cover_image_url
            : `${API_URL}${b.cover_image_url}`
          : "/b3.jpg",
        created_at: new Date(b.created_at).toLocaleDateString(),
      }));

      setBlogs(formatted);
      setFiltered(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let data = [...blogs];

    if (search) {
      data = data.filter((b) =>
        b.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (sort) {
      case "Newest":
        data.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "Oldest":
        data.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
    }

    setFiltered(data);
  }, [search, sort, blogs]);

  return (
    <div
      className={`min-h-screen px-4 sm:px-6 md:px-12 pb-30
        ${theme === "dark" ? "bg-[#05070a] text-white" : "bg-white text-black"}`}
    >
      <div className="max-w-7xl mx-auto pt-32">

        <div className="flex flex-col md:flex-row gap-4 mb-10">

          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`flex-1 rounded-lg py-3 px-4 text-sm font-semibold
              ${theme === "dark"
                ? "bg-[#0a0c14] border border-gray-800 text-white placeholder-gray-400"
                : "bg-gray-100 border border-gray-300 text-black placeholder-gray-500"
              }`}
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className={`rounded-lg py-2 px-6 text-sm font-semibold
              ${theme === "dark"
                ? "bg-[#0a0c14] border border-gray-800 text-white"
                : "bg-gray-100 border border-gray-300 text-black"
              }`}
          >
            {["Newest", "Oldest"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

        </div>

        {loading ? (
          <p className="text-center">Loading blogs...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center">No blogs found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((blog) => (
              <BlogCard
                key={blog.id}
                id={blog.id}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}