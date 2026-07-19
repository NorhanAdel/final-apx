"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Building2,
} from "lucide-react";
import { useEffect, useState } from "react";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import { GET_ALL_SPORTS } from "../graphql/query/sports.queries";

interface Sport {
  id: string;
  name: string;
}

export default function Footer({ lang }: { lang: string }) {
  const { t } = useTranslate(lang);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);

  const isRTL = lang === "ar";

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const result = await fetchGraphQL<{ sports: Sport[] }>(GET_ALL_SPORTS);
        if (result.data?.sports) {
          setSports(result.data.sports);
        }
      } catch (error) {
        console.error("Failed to fetch sports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSports();
  }, []);

  return (
    <footer
      dir={isRTL ? "rtl" : "ltr"}
      className="relative bg-[#09091A] text-white pt-20 pb-10 overflow-hidden"
    >
      <motion.div
        className="absolute w-[600px] h-[600px] bg-[#F54900]/10 rounded-full blur-3xl -top-40 right-[-200px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Logo & Description */}
          <div>
            <Image src="/logo.png" width={150} height={150} alt="logo" />
            <p className="text-gray-200 text-sm mt-3 leading-relaxed">
              {t("footer_desc")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6 text-lg">{t("quick_links")}</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="cursor-pointer hover:text-[#F0B100] transition">
                {t("home")}
              </li>
              <li className="cursor-pointer hover:text-[#F0B100] transition">
                {t("sports")}
              </li>
              <li className="cursor-pointer hover:text-[#F0B100] transition">
                {t("about")}
              </li>
              <li className="cursor-pointer hover:text-[#F0B100] transition">
                {t("contact")}
              </li>
            </ul>
          </div>

          {/* Sports - Dynamic */}
          <div>
            <h4 className="font-semibold mb-6 text-lg">{t("sports_title")}</h4>
            {loading ? (
              <div className="text-gray-400 text-sm">{t("Loading...")}</div>
            ) : (
              <ul className="space-y-3 text-sm text-gray-300">
                {sports.slice(0, 5).map((sport) => (
                  <li
                    key={sport.id}
                    className="cursor-pointer hover:text-[#F0B100] transition"
                  >
                    {sport.name}
                  </li>
                ))}
                {sports.length > 5 && (
                  <li className="text-gray-500 text-xs">
                    +{sports.length - 5} {t("more")}
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-6 text-lg">{t("contact_info")}</h4>

            <div className="space-y-4 text-sm text-gray-300">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#F0B100] flex-shrink-0" />
                <span className="break-all">+966502785394</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[#F0B100] flex-shrink-0" />
                <span className="break-all">Info@crsuper7.com</span>
              </div>

              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-[#F0B100] flex-shrink-0" />
                <span>{t("address")}</span>
              </div>

              {/* Commercial Register */}
              <div className="pt-3 mt-2 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <Building2
                    size={16}
                    className="text-[#F0B100] flex-shrink-0"
                  />
                  <div>
                    <p className="text-xs text-gray-400">
                      {t("commercial_register")}
                    </p>
                    <p className="text-sm font-medium text-white">7051219058</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-6 mb-10">
          {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.2 }}
              className="p-3 bg-white/5 rounded-full border border-white/10 cursor-pointer hover:bg-[#F0B100] hover:text-black transition"
            >
              <Icon size={18} />
            </motion.div>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-6 text-center text-gray-500 text-sm">
          {t("footer_copy")}
        </div>
      </div>
    </footer>
  );
}