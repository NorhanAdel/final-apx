"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  LogIn,
  LogOut,
  Dumbbell,
  Waves,
  Trophy,
  Volleyball,
  CircleDot,
  User as UserIcon,
  Shield,
  Building2,
  UserCircle,
  Briefcase,
  Eye,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";
import { useAuth } from "../context/auth-context";
import { GET_ALL_SPORTS } from "../graphql/query/sports.queries";
import { GET_ACTIVE_LANGUAGES } from "../graphql/query/languages.queries";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import type {
  User,
  Language,
  Sport,
  NavbarProps,
} from "../interfaces/navbar.interface";
import { translate, translateRole } from "../locales";

const navLinks = [
  { key: "Home", href: "/" },
  { key: "Reels", href: "/reels" },
  { key: "Players", href: "/players" },
  { key: "Scales", href: "/scales" },
  { key: "Blog", href: "/blog" },
  { key: "Events", href: "/events" },
  { key: "Championships", href: "/championship" },
];

const DEFAULT_LANGUAGES: Language[] = [
  { id: "1", code: "en", name: "English" },
  { id: "2", code: "ar", name: "Arabic" },
  { id: "3", code: "pt", name: "Portuguese" },
  { id: "4", code: "zh", name: "Chinese" },
];

const sportIcons: Record<string, React.ElementType> = {
  Football: Trophy,
  Swimming: Waves,
  Athletics: Dumbbell,
  Volleyball: Volleyball,
  Tennis: CircleDot,
  Gymnastics: Dumbbell,
};

export default function Navbar({ lang, setLang }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading: loading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const sportsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [sportsOpen, setSportsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSportsOpen, setMobileSportsOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [sportsLoading, setSportsLoading] = useState(true);
  const [languages, setLanguages] = useState<Language[]>(DEFAULT_LANGUAGES);
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [localUser, setLocalUser] = useState<User | null>(null);

  const { theme, toggleTheme } = useTheme();
  const { changeLang, lang: currentLang } = useTranslate();

  const activeLang = lang || currentLang || "en";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (langRef.current && !langRef.current.contains(target)) {
        setLangOpen(false);
      }

      if (sportsRef.current && !sportsRef.current.contains(target)) {
        setSportsOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };

    if (langOpen || sportsOpen || profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [langOpen, sportsOpen, profileOpen]);

  useEffect(() => {
    const handleClickOutsideMobile = (event: MouseEvent) => {
      const target = event.target as Node;
      const mobileSheet = document.getElementById("mobile-sheet");

      if (mobileSheet && !mobileSheet.contains(target)) {
        const menuButton = document.getElementById("mobile-menu-button");
        if (menuButton && menuButton.contains(target)) {
          return;
        }
        setOpen(false);
        setMobileSportsOpen(false);
        setMobileLangOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutsideMobile);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMobile);
    };
  }, [open]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchSports = async () => {
      setSportsLoading(true);
      try {
        const result = await fetchGraphQL<{ sports: Sport[] }>(GET_ALL_SPORTS);
        if (result.data?.sports) {
          const sorted = [...result.data.sports].sort((a, b) => {
            if (a.name.toLowerCase() === "football") return -1;
            if (b.name.toLowerCase() === "football") return 1;
            return 0;
          });

          setSports(sorted);
        }
      } catch (error) {
        console.error("Failed to fetch sports:", error);
      } finally {
        setSportsLoading(false);
      }
    };

    fetchSports();
  }, [currentLang]);

  useEffect(() => {
    const fetchLanguages = async () => {
      setLanguagesLoading(true);
      try {
        const result = await fetchGraphQL<{ activeLanguages: Language[] }>(
          GET_ACTIVE_LANGUAGES,
        );
        if (
          result.data?.activeLanguages &&
          result.data.activeLanguages.length > 0
        ) {
          setLanguages(result.data.activeLanguages);
        } else {
          setLanguages(DEFAULT_LANGUAGES);
        }
      } catch (error) {
        console.error("Failed to fetch languages, using defaults:", error);
        setLanguages(DEFAULT_LANGUAGES);
      } finally {
        setLanguagesLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  useEffect(() => {
    const checkUserInStorage = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as User;
          setLocalUser(parsedUser);
        } catch {
          setLocalUser(null);
        }
      } else {
        setLocalUser(null);
      }
    };

    checkUserInStorage();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        checkUserInStorage();
      }
    };

    const handleCustomEvent = () => {
      checkUserInStorage();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("user-updated", handleCustomEvent);
    const interval = setInterval(checkUserInStorage, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("user-updated", handleCustomEvent);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getSportIcon = (sportName: string): React.ElementType => {
    return sportIcons[sportName] || Trophy;
  };

  const currentSport = sports.find((sport: Sport) =>
    pathname.startsWith(`/${sport.name.toLowerCase()}`),
  );

  const activeUser = localUser || user;

  const getCheckoutRoute = (): string => {
    if (!activeUser) return "/auth/login";

    switch (activeUser.role) {
      case "PLAYER":
        return "/profile/participationprime";
      case "CLUB":
        return "/clubprofile/participationprime";
      case "SCOUT":
        return "/scout/profile/participationprime";
      case "AGENT":
        return "/agent/participationprime";
      default:
        return "/";
    }
  };

  const getProfileLink = (): string => {
    if (!activeUser) return "/auth/login";

    switch (activeUser.role) {
      case "PLAYER":
        return "/profile/player";
      case "CLUB":
        return "/clubprofile";
      case "SCOUT":
        return "/scout";
      case "AGENT":
        return "/agent";
      case "USER":
        return "/user";
      default:
        return "/profile";
    }
  };

  const getProfileName = (): string => {
    if (!activeUser) return "";
    switch (activeUser.role) {
      case "PLAYER":
        return (
          activeUser.playerProfile?.full_name ||
          activeUser.username ||
          translate("PLAYER", activeLang)
        );
      case "CLUB":
        return (
          activeUser.clubProfile?.club_name ||
          activeUser.username ||
          translate("CLUB", activeLang)
        );
      case "SCOUT":
        return (
          activeUser.scoutProfile?.full_name ||
          activeUser.username ||
          translate("SCOUT", activeLang)
        );
      case "AGENT":
        return (
          activeUser.agentProfile?.full_name ||
          activeUser.username ||
          translate("AGENT", activeLang)
        );
      case "USER":
        return activeUser.username || translate("USER", activeLang);
      case "ADMIN":
        return activeUser.username || translate("ADMIN", activeLang);
      default:
        return activeUser.username || "Profile";
    }
  };

  const getProfileIcon = (): React.ReactNode => {
    if (!activeUser) return <UserCircle size={20} />;

    switch (activeUser.role) {
      case "PLAYER":
        return <UserIcon size={20} />;
      case "CLUB":
        return <Building2 size={20} />;
      case "SCOUT":
        return <Eye size={20} />;
      case "AGENT":
        return <Briefcase size={20} />;
      case "USER":
        return <UserCircle size={20} />;
      case "ADMIN":
        return <Shield size={20} />;
      default:
        return <UserCircle size={20} />;
    }
  };

  const handleLanguageChange = (code: string): void => {
    changeLang(code);
    setLang(code);
    setLangOpen(false);
    setMobileLangOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 50);
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLocalUser(null);
    router.push("/");
    setProfileOpen(false);
  };

  const renderAuthButton = (): React.ReactNode => {
    if (loading) {
      return <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />;
    }

    if (activeUser) {
      const userName = getProfileName();

      return (
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-[#001a4d] border border-[#F0B100] rounded-lg text-[#F0B100] hover:bg-[#002060] transition-colors"
          >
            {getProfileIcon()}
            <span className="hidden sm:inline max-w-[100px] truncate">
              {userName}
            </span>
            <ChevronDown size={14} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-3 w-56 bg-[#14141c] border border-white/10 rounded-xl z-50 overflow-hidden"
              >
                <div className="px-4 py-2 border-b border-white/10 bg-white/5">
                  <span className="text-xs text-yellow-400">
                    {translateRole(activeUser.role, activeLang)}
                  </span>
                </div>

                <Link
                  href={getProfileLink()}
                  onClick={(e) => {
                    const requiresSub = [
                      "PLAYER",
                      "CLUB",
                      "SCOUT",
                      "AGENT",
                    ].includes(activeUser?.role || "");
                    if (requiresSub && !activeUser?.has_active_subscription) {
                      e.preventDefault();
                      router.push(getCheckoutRoute());
                      return;
                    }

                    setProfileOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#F0B100] hover:text-black transition-colors"
                >
                  {getProfileIcon()}
                  <span>{translate("My Profile", activeLang)}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 border-t border-white/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <LogOut size={18} />
                  <span>{translate("Logout", activeLang)}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link href="/auth/login">
        <button className="px-5 py-2 bg-[#001a4d] border border-[#F0B100] text-[#F0B100] rounded-lg flex items-center gap-2 hover:bg-[#002060] transition-colors">
          <LogIn size={16} /> {translate("Login", activeLang)}
        </button>
      </Link>
    );
  };

  return (
    <nav
      className={`fixed w-full z-50 backdrop-blur-md border-b transition-all duration-300
      ${
        scrolled
          ? theme === "dark"
            ? "bg-[#020617]/95 border-white/10"
            : "bg-white/95 border-black/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
        <Link href="/">
          <Image src="/logo.png" width={90} height={70} alt="logo" />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors font-semibold ${
                theme === "dark"
                  ? "text-yellow-400 hover:text-yellow-300"
                  : "text-gray-800 hover:text-yellow-600"
              }`}
            >
              {translate(link.key, activeLang)}
            </Link>
          ))}

          <div ref={sportsRef} className="relative">
            <button
              onClick={() => setSportsOpen(!sportsOpen)}
              className={`flex items-center gap-1 transition-colors font-medium ${
                theme === "dark"
                  ? "text-white hover:text-yellow-400"
                  : "text-gray-800 hover:text-yellow-600"
              }`}
            >
              {currentSport?.name || translate("Sports", activeLang)}
              <ChevronDown size={16} />
            </button>

            <AnimatePresence>
              {sportsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute left-0 mt-3 w-52 border rounded-xl z-50 overflow-hidden ${
                    theme === "dark"
                      ? "bg-[#14141c] border-white/10 text-white"
                      : "bg-white border-gray-200 text-gray-800 shadow-lg"
                  }`}
                >
                  {sportsLoading ? (
                    <div className="px-4 py-2 text-center">Loading...</div>
                  ) : (
                    sports.map((sport: Sport) => {
                      const Icon = getSportIcon(sport.name);

                      return (
                        <Link
                          key={sport.id}
                          href={`/sports/${sport.id}`}
                          className={`flex items-center gap-2 px-4 py-2 transition-colors ${
                            theme === "dark"
                              ? "hover:bg-[#F0B100] hover:text-black"
                              : "hover:bg-yellow-100 hover:text-black"
                          }`}
                          onClick={() => setSportsOpen(false)}
                        >
                          <Icon size={18} />
                          {sport.name}
                        </Link>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {renderAuthButton()}

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              theme === "dark" ? "hover:bg-white/10" : "hover:bg-gray-200"
            }`}
          >
            {mounted ? (
              theme === "dark" ? (
                <Moon size={18} />
              ) : (
                <Sun size={18} />
              )
            ) : (
              <div className="w-5 h-5" />
            )}
          </button>

          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className={`flex items-center gap-1 transition-colors ${
                theme === "dark"
                  ? "text-white hover:text-yellow-400"
                  : "text-yellow-600"
              }`}
            >
              <Globe size={14} />
              {translate(activeLang.toUpperCase(), activeLang)}
              <ChevronDown size={12} />
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute right-0 mt-3 w-40 border rounded-xl z-50 overflow-hidden ${
                    theme === "dark"
                      ? "bg-[#14141c] border-white/10 text-white"
                      : "bg-white border-gray-200 text-gray-800 shadow-lg"
                  }`}
                >
                  {languagesLoading ? (
                    <div className="px-4 py-2 text-center">Loading...</div>
                  ) : (
                    languages.map((language: Language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={`block w-full text-left px-4 py-2 transition-colors ${
                          theme === "dark"
                            ? "hover:bg-[#F0B100] hover:text-black"
                            : "hover:bg-yellow-100 hover:text-black"
                        }`}
                      >
                        {translate(language.name, activeLang)}
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="md:hidden flex items-center gap-3">
          <button onClick={toggleTheme} className=" text-yellow-600">
            {mounted ? (
              theme === "dark" ? (
                <Moon size={20} />
              ) : (
                <Sun size={20} />
              )
            ) : (
              <div className="w-5 h-5" />
            )}
          </button>

          {!activeUser ? (
            <Link href="/auth/login" className=" text-yellow-600">
              <LogIn size={22} />
            </Link>
          ) : (
            <button onClick={handleLogout} className=" text-yellow-600">
              <LogOut size={22} />
            </button>
          )}

          <button
            id="mobile-menu-button"
            onClick={() => setOpen(!open)}
            className=" text-yellow-600"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-sheet"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`md:hidden overflow-hidden border-t ${
              theme === "dark"
                ? "bg-[#020617] text-yellow-600 border-white/10"
                : "bg-white text-yellow-600 border-black/10"
            }`}
          >
            <div className="flex flex-col py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="px-6 py-3 text-yellow-600 hover:bg-white/5"
                >
                  {translate(link.key, activeLang)}
                </Link>
              ))}

              <button
                onClick={() => setMobileSportsOpen(!mobileSportsOpen)}
                className="flex justify-between items-center w-full px-6 py-3 hover:bg-white/5"
              >
                <span>{translate("Sports", activeLang)}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    mobileSportsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileSportsOpen && (
                <div className="max-h-60 overflow-y-auto pl-6">
                  {sports.map((sport: Sport) => {
                    const Icon = getSportIcon(sport.name);
                    return (
                      <Link
                        key={sport.id}
                        href={`/sports/${sport.id}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-6 py-2 hover:bg-white/5"
                      >
                        <Icon size={16} />
                        {sport.name}
                      </Link>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => setMobileLangOpen(!mobileLangOpen)}
                className="flex justify-between items-center w-full px-6 py-3 hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  <Globe size={14} />
                  {translate("Language", activeLang)}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    mobileLangOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileLangOpen && (
                <div className="pl-6">
                  {languages.map((language: Language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className="block w-full text-left px-6 py-2 hover:bg-white/5"
                    >
                      {translate(language.name, activeLang)}
                    </button>
                  ))}
                </div>
              )}

              {activeUser && (
                <div className="mt-4 pt-4 border-t border-white/10 px-6">
                  <div className="flex items-center gap-3 mb-3">
                    {getProfileIcon()}
                    <span className="font-semibold">{getProfileName()}</span>
                  </div>
                  <div className="text-xs text-yellow-400 mb-2">
                    {translateRole(activeUser.role, activeLang)}
                  </div>
                  <Link
                    href={getProfileLink()}
                    onClick={() => setOpen(false)}
                    className="block w-full text-center px-4 py-2 bg-[#001a4d] border border-[#F0B100] rounded-lg text-[#F0B100] hover:bg-[#002060] transition-colors"
                  >
                    {translate("View Profile", activeLang)}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}