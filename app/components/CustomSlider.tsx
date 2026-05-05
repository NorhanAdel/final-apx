"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import useTranslate from "../hooks/useTranslate";

type Blog = {
  id: string;
  title: string;
  cover_image_url: string | null;
  created_at: string;
};

export default function BlogSlider({ lang }: { lang: string }) {
  const [cards, setCards] = useState<Blog[]>([]);
  const [index, setIndex] = useState(0);

  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useTranslate(lang);  

  useEffect(() => {
    fetchBlogs();
  }, [lang]);

  const fetchBlogs = async () => {
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

    const result = await fetchGraphQL<{ blogs: Blog[] }>(query);

    if (result.data?.blogs) {
      setCards(result.data.blogs);
      setIndex(0);
    }
  };

  const next = () => setIndex((prev) => (prev + 1) % cards.length);
  const prev = () => setIndex((prev) => (prev - 1 + cards.length) % cards.length);

  const getPosition = (i: number) => {
    const diff = i - index;
    if (diff === 0) return "center";
    if (diff === 1 || diff === -(cards.length - 1)) return "right";
    if (diff === -1 || diff === cards.length - 1) return "left";
    return "hidden";
  };

  return (
    <section className={`py-20 ${theme === "dark" ? "bg-[#0c0c0c]" : "bg-[#f9fafb]"}`}>

      {/* TITLE */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-5xl font-bold text-[#F0B100]">
          {t("blogs")}   
        </h2>
      </div>

      {/* SLIDER */}
      <div className="relative h-[420px] flex items-center justify-center overflow-hidden">
        {cards.map((card, i) => {
          const position = getPosition(i);

          return (
            <motion.div
              key={card.id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, info) => {
                if (info.offset.x < -100) next();
                if (info.offset.x > 100) prev();
              }}
              animate={{
                x: position === "center" ? 0 : position === "left" ? -260 : position === "right" ? 260 : 0,
                scale: position === "center" ? 1 : position === "hidden" ? 0.7 : 0.85,
                opacity: position === "center" ? 1 : position === "hidden" ? 0 : 0.5,
                zIndex: position === "center" ? 10 : 1,
              }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              className="absolute cursor-grab active:cursor-grabbing"
              onClick={() => router.push(`/blog/${card.id}`)}
            >
              <div className="w-[280px] h-[400px] md:w-[320px] md:h-[420px] rounded-2xl overflow-hidden shadow-2xl relative group">

                <img
                  src={
                    card.cover_image_url
                      ? card.cover_image_url.startsWith("http")
                        ? card.cover_image_url
                        : `${process.env.NEXT_PUBLIC_API_URL}${card.cover_image_url}`
                      : "/b3.jpg"
                  }
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition" />

                <div className="absolute bottom-5 w-full text-center text-white px-3">
                  <p className="text-sm opacity-70 mb-1">
                    {new Date(card.created_at).toLocaleDateString(lang)}
                  </p>

                  <h3 className="text-lg font-semibold">
                    {card.title}
                  </h3>
                </div>

              </div>
            </motion.div>
          );
        })}

<button
  onClick={prev}
  className="
    absolute left-2 md:left-5 
    top-1/2 -translate-y-1/2 
    z-20 
    px-3 py-2 md:px-4 md:py-3
    rounded-2xl rounded-md
    bg-black/30 backdrop-blur-md
    text-white
    border border-white/10
    hover:bg-black/50 hover:scale-105
    transition
  "
>
  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
</button>

<button
  onClick={next}
  className="
    absolute right-2 md:right-5 
    top-1/2 -translate-y-1/2 
    z-20 
    px-3 py-2 md:px-4 md:py-3
    rounded-2xl rounded-md
    bg-black/30 backdrop-blur-md
    text-white
    border border-white/10
    hover:bg-black/50 hover:scale-105
    transition
  "
>
  <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
</button>
      </div>
    </section>
  );
}
