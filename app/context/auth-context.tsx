"use client";

import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import { LOGOUT_MUTATION } from "../graphql/mutation/auth.mutations";

export type UserRole =
  | "PLAYER"
  | "CLUB"
  | "ADMIN"
  | "SCOUT"
  | "AGENT"
  | "USER"
  | "COACH"
  | "MANAGER";

interface User {
  id: string;
  email: string;
  username: string;
    has_active_subscription?: boolean;
  role: UserRole;
  playerProfile?: {
    id: string;
    full_name: string;
  };
  clubProfile?: {
    id: string;
    club_name: string;
  };
  scoutProfile?: {
    id: string;
    full_name: string;
  };
  agentProfile?: {
    id: string;
    full_name: string;
    agency_name?: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  getUserRole: () => UserRole | null;
  getProfileId: () => string | null;
  getProfileName: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadUser = useCallback(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser && isMounted.current) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        try {
          document.cookie = `token=${token}; Path=/; Max-Age=2592000; SameSite=Lax`;
        } catch {}
      } else if (isMounted.current) {
        setUser(null);
      }
    } catch (e) {
      console.error("Failed to parse user", e);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (isMounted.current) setUser(null);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadUser();

    const handleUserUpdate = () => {
      loadUser();
    };

    window.addEventListener("storage", handleUserUpdate);
    window.addEventListener("user-updated", handleUserUpdate);

    return () => {
      window.removeEventListener("storage", handleUserUpdate);
      window.removeEventListener("user-updated", handleUserUpdate);
    };
  }, [loadUser]);

  const updateSetUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
      window.dispatchEvent(new Event("user-updated"));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("user-updated"));
    }
  };

  const logout = async () => {
    try {
      await fetchGraphQL(LOGOUT_MUTATION);
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("remember_token");
    localStorage.removeItem("user");
    try {
      document.cookie =
        "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    } catch {}
    setUser(null);
  };

  const getUserRole = () => {
    return user?.role || null;
  };

  const getProfileId = () => {
    if (!user) return null;

    switch (user.role) {
      case "PLAYER":
        return user.playerProfile?.id || null;
      case "CLUB":
        return user.clubProfile?.id || null;
      case "SCOUT":
        return user.scoutProfile?.id || null;
      case "AGENT":
        return user.agentProfile?.id || null;
      case "ADMIN":
        return user.id;
      default:
        return null;
    }
  };

  const getProfileName = () => {
    if (!user) return null;

    switch (user.role) {
      case "PLAYER":
        return user.playerProfile?.full_name || user.username;
      case "CLUB":
        return user.clubProfile?.club_name || user.username;
      case "SCOUT":
        return user.scoutProfile?.full_name || user.username;
      case "AGENT":
        return user.agentProfile?.full_name || user.username;
      case "ADMIN":
        return "Admin";
      default:
        return user.username;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        setUser: updateSetUser,
        logout,
        isAuthenticated: !!user,
        getUserRole,
        getProfileId,
        getProfileName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
