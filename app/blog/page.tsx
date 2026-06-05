"use client";

import { useEffect, useState, useCallback } from "react";
import BlogCard from "../components/BlogCard";
import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import { Search, Filter, ChevronDown } from "lucide-react";

/* ================= TYPES ================= */
interface Blog {
  id: string;
  title: string;
  created_at: string;
  cover_image_url: string;
  views_count: number;
  category?: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

/* ================= QUERIES ================= */
const GET_ALL_BLOGS = `
  query GetAllBlogs($skip: Int, $take: Int) {
    blogs(skip: $skip, take: $take) {
      id
      title
      created_at
      cover_image_url
      views_count
      category {
        id
        name
      }
    }
  }
`;

const GET_CATEGORIES = `
  query {
    blogCategories {
      id
      name
    }
  }
`;

/* ================= COMPONENT ================= */
export default function BlogPage() {
  const { theme } = useTheme();
  const { t } = useTranslate();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"Newest" | "Oldest">("Newest");
  const [category, setCategory] = useState("All");

  const [loading, setLoading] = useState(true);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  /* ================= FETCH ================= */
  const fetchBlogs = useCallback(async () => {
    const result = await fetchGraphQL<{ blogs: Blog[] }>(
      GET_ALL_BLOGS,
      { skip: 0, take: 100 }
    );
    setBlogs(result.data?.blogs || []);
  }, []);

  const fetchCategories = useCallback(async () => {
    const result = await fetchGraphQL<{ blogCategories: Category[] }>(
      GET_CATEGORIES
    );
    setCategories(result.data?.blogCategories || []);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchBlogs(), fetchCategories()]).finally(() =>
      setLoading(false)
    );
  }, [fetchBlogs, fetchCategories]);

  /* ================= FILTER ================= */
  const filteredBlogs = blogs
    .filter((b) => {
      const matchSearch =
        b.title.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        category === "All" || b.category?.id === category;

      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sort === "Newest") {
        return (
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );
      }
      return (
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
      );
    });

  const hasFilters =
    search !== "" || sort !== "Newest" || category !== "All";

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div
      className={`min-h-screen px-4 sm:px-6 md:px-12 lg:px-60 py-40 transition${
        theme === "dark"
          ? "bg-[#020b1c] text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      {/* SEARCH */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`flex-1 flex items-center rounded-md px-3 py-2 border ${
            theme === "dark"
              ? "bg-[#020b1c] border-blue-900"
              : "bg-white border-gray-300"
          }`}
        >
          <Search size={18} className="text-gray-400" />
          <input
            placeholder={t("searchBlogs") || "Search blogs..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none w-full text-sm ml-2"
          />
        </div>

        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 bg-[#F0B100] text-black px-4 py-2 rounded-md"
        >
          <Filter size={18} />
          {t("filter")}
        </button>
      </div>

      {/* FILTER PANEL */}
      {isFilterOpen && (
        <div
          className={`p-6 rounded-lg border mb-8 ${
            theme === "dark"
              ? "bg-[#071632] border-blue-900"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* CATEGORY DROPDOWN */}
            <div>
              <label className="text-sm mb-2 block">
                {t("category") || "Category"}
              </label>

              <div className="relative">
                <button
                  onClick={() =>
                    setIsCategoryOpen(!isCategoryOpen)
                  }
                  className={`w-full flex justify-between px-4 py-2 border rounded-md ${
                    theme === "dark"
                      ? "bg-[#0a0f2c] border-blue-900 text-white"
                      : "bg-white border-gray-300 text-black"
                  }`}
                >
                  {category === "All"
                    ? t("all") || "All"
                    : categories.find((c) => c.id === category)?.name}

                  <ChevronDown size={16} />
                </button>

                {isCategoryOpen && (
                  <div
                    className={`absolute mt-2 w-full rounded-md border z-20 ${
                      theme === "dark"
                        ? "bg-[#0a0f2c] border-blue-900"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <button
                      onClick={() => {
                        setCategory("All");
                        setIsCategoryOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {t("all") || "All"}
                    </button>

                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setCategory(cat.id);
                          setIsCategoryOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100  hover:text-black"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SORT DROPDOWN */}
            <div>
              <label className="text-sm mb-2 block">
                {t("sortBy")}
              </label>

              <div className="relative">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className={`w-full flex justify-between px-4 py-2 border rounded-md ${
                    theme === "dark"
                      ? "bg-[#0a0f2c] border-blue-900 text-white"
                      : "bg-white border-gray-300 text-black"
                  }`}
                >
                  {sort}
                  <ChevronDown size={16} />
                </button>

                {isSortOpen && (
                  <div
                    className={`absolute mt-2 w-full rounded-md border z-20 ${
                      theme === "dark"
                        ? "bg-[#0a0f2c] border-blue-900"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    {["Newest", "Oldest"].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          setSort(item as "Newest" | "Oldest");
                          setIsSortOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-black"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CLEAR */}
          {hasFilters && (
            <button
              onClick={() => {
                setSearch("");
                setSort("Newest");
                setCategory("All");
              }}
              className="mt-4 text-red-500"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* BLOGS */}
      {filteredBlogs.length === 0 ? (
        <p className="text-center text-gray-400">No blogs found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 mt-10 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
}
