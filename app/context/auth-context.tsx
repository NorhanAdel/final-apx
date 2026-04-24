"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";

export type UserRole = "PLAYER" | "CLUB" | "ADMIN" | "SCOUT" | "AGENT";

interface User {
  id: string;
  email: string;
  username: string;
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

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser && isMounted.current) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (e) {
        console.error("Failed to parse user", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    loadUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
        setUser,
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