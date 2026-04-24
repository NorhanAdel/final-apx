"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import Image from "next/image";
import { useTheme } from "../../../context/ThemeContext";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

/* ================= TRANSLATION ================= */

const T: any = {
  en: {
    share: "Share AD",
    click: "Click To Add Photo Of AD",
    title: "Title",
    description: "Description",
    titlePh: "Title Of AD",
    descPh: "Description of player",
    loading: "Loading...",
    success: "Ad Shared Successfully ✅",
    error: "Error happened",
  },
  ar: {
    share: "مشاركة إعلان",
    click: "اضغط لإضافة صورة الإعلان",
    title: "العنوان",
    description: "الوصف",
    titlePh: "عنوان الإعلان",
    descPh: "وصف اللاعب",
    loading: "جاري التحميل...",
    success: "تم نشر الإعلان بنجاح ✅",
    error: "حدث خطأ",
  },
  pt: {
    share: "Compartilhar anúncio",
    click: "Clique para adicionar foto",
    title: "Título",
    description: "Descrição",
    titlePh: "Título do anúncio",
    descPh: "Descrição do jogador",
    loading: "Carregando...",
    success: "Anúncio enviado com sucesso ✅",
    error: "Erro aconteceu",
  },
  zh: {
    share: "分享广告",
    click: "点击添加广告图片",
    title: "标题",
    description: "描述",
    titlePh: "广告标题",
    descPh: "球员描述",
    loading: "加载中...",
    success: "广告发布成功 ✅",
    error: "发生错误",
  },
};

const CREATE_AD = `
mutation CreateAd($image: Upload, $input: CreateAdInput!) {
  createAd(image: $image, input: $input) {
    id
    title
    description
    image_url
    video_url
    target_role
    expires_at
    status
  }
}
`;

export default function ShareAdPage() {
  const { theme } = useTheme();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const lang =
    typeof window !== "undefined"
      ? localStorage.getItem("lang") || "en"
      : "en";

  const t = T[lang];

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    fileRef.current?.click();
  };

  const handleImage = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e: any) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append(
        "operations",
        JSON.stringify({
          query: CREATE_AD,
          variables: {
            input: {
              title: form.title,
              description: form.description,
              target_role: "CLUB",
              expires_at: new Date(
                new Date().setFullYear(new Date().getFullYear() + 1)
              ).toISOString(),
            },
            image: null,
          },
        })
      );

      formData.append(
        "map",
        JSON.stringify({
          "0": ["variables.image"],
        })
      );

      if (image) {
        formData.append("0", image);
      }

      const res = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          "apollo-require-preflight": "true",
        },
        body: formData,
      });

      const json = await res.json();

      if (json.errors) {
        toast.error(json.errors[0].message || t.error);
        setLoading(false);
        return;
      }

      toast.success(t.success);
    } catch (err) {
      console.log(err);
      toast.error(t.error);
    }

    setLoading(false);
  };

  return (
    <div
      className={`min-h-screen flex py-38 items-center justify-center px-4 sm:px-6 transition
      ${theme === "dark" ? "bg-[#020617] text-white" : "bg-[#f9fafb] text-black"}`}
    >
      <div className="w-full max-w-3xl py-12">

        {/* TITLE */}
        <h1
          className={`text-center text-2xl sm:text-3xl font-bold mb-8
          ${theme === "dark" ? "text-yellow-400" : "text-[#F0B100]"}`}
        >
          {t.share}
        </h1>

        {/* IMAGE UPLOAD */}
        <div
          onClick={handleClick}
          className={`border rounded-xl h-[280px] sm:h-[310px] flex items-center justify-center cursor-pointer relative overflow-hidden transition
          ${theme === "dark" ? "border-yellow-400" : "border-gray-300 bg-white shadow"}`}
        >
          {preview ? (
            <Image src={preview} alt="preview" fill className="object-cover" />
          ) : (
            <div
              className={`flex flex-col items-center
              ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
            >
              <ImagePlus size={40} />
              <p className="mt-4 text-sm text-center px-2">
                {t.click}
              </p>
            </div>
          )}

          <input
            type="file"
            ref={fileRef}
            onChange={handleImage}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* FORM */}
        <div className="flex flex-col gap-4 mt-6">

          <div>
            <label
              className={`mb-2 block font-semibold text-sm sm:text-base
              ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
            >
              {t.title}
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              type="text"
              placeholder={t.titlePh}
              className={`w-full rounded-lg px-4 py-3 outline-none border transition
              ${
                theme === "dark"
                  ? "bg-[#0a0f2c] border-[#1e2a5a] text-white"
                  : "bg-white border-gray-300 text-black shadow-sm"
              }`}
            />
          </div>

          <div>
            <label
              className={`mb-2 block font-semibold text-sm sm:text-base
              ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
            >
              {t.description}
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder={t.descPh}
              className={`w-full rounded-lg px-4 py-3 outline-none border resize-none transition
              ${
                theme === "dark"
                  ? "bg-[#0a0f2c] border-[#1e2a5a] text-white"
                  : "bg-white border-gray-300 text-black shadow-sm"
              }`}
            />
          </div>

        </div>

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`mt-8 w-full h-[50px] sm:h-[55px] flex items-center justify-center font-semibold text-base sm:text-lg transition
          ${
            theme === "dark"
              ? "bg-[#081f4d] border-x border-yellow-400 text-white"
              : "bg-[#F0B100] text-black"
          }`}
        >
          {loading ? t.loading : t.share}
        </button>

      </div>
    </div>
  );
}