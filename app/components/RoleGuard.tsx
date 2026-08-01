"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { toast } from "sonner";
import useTranslate from "../hooks/useTranslate";

interface RoleRouteRule {
  prefix: string;
  allowedRoles: string[];
  roleKey: string;
}

const ROLE_RULES: RoleRouteRule[] = [
  {
    prefix: "/clubprofile",
    allowedRoles: ["CLUB", "ADMIN"],
    roleKey: "club",
  },
  {
    prefix: "/scout",
    allowedRoles: ["SCOUT", "ADMIN"],
    roleKey: "scout",
  },
  {
    prefix: "/agent",
    allowedRoles: ["AGENT", "ADMIN"],
    roleKey: "agent",
  },
  {
    prefix: "/coach",
    allowedRoles: ["COACH", "ADMIN"],
    roleKey: "coach",
  },
  {
    prefix: "/manager",
    allowedRoles: ["MANAGER", "ADMIN"],
    roleKey: "manager",
  },
  {
    prefix: "/user",
    allowedRoles: ["USER", "ADMIN"],
    roleKey: "user",
  },
  {
    prefix: "/profile/player",
    allowedRoles: ["PLAYER", "ADMIN"],
    roleKey: "player",
  },
];

const GENERAL_PROTECTED_ROUTES = ["/profile", "/checkout", "/purchase"];

export default function RoleGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { t } = useTranslate();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setAuthorized(false);
      return;
    }

    let effectiveUser = user;
    if (!effectiveUser && typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (token && storedUser) {
        try {
          effectiveUser = JSON.parse(storedUser);
        } catch {}
      }
    }

    const matchedRule = ROLE_RULES.find(
      (rule) =>
        pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`),
    );

    if (matchedRule) {
      if (!effectiveUser) {
        toast.error(t("please_login_first_to_access"));
        setAuthorized(false);
        router.push("/auth/login");
        return;
      }

      const userRole = (effectiveUser.role || "").toUpperCase();
      if (!matchedRule.allowedRoles.includes(userRole)) {
        const roleName = t(matchedRule.roleKey);
        toast.error(`${t("access_denied_description")} (${roleName})`);
        setAuthorized(false);
        router.push("/");
        return;
      }
    } else {
      const isGeneralProtected = GENERAL_PROTECTED_ROUTES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
      );

      if (isGeneralProtected && !effectiveUser) {
        toast.error(t("please_login_first"));
        setAuthorized(false);
        router.push("/auth/login");
        return;
      }
    }

    setAuthorized(true);
  }, [pathname, user, isLoading, router, t]);

  if (isLoading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-yellow-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
          <span className="text-xs font-semibold tracking-wider">
            {t("checking_permissions")}
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
