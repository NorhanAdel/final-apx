"use client";

import { useEffect, useState } from "react";

export type UserRole = "PLAYER" | "CLUB" | "ADMIN" | "SCOUT" | "AGENT";

interface User {
  id: string;
  email: string;
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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use setTimeout to avoid synchronous state updates
    const timer = setTimeout(() => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/auth/login";
  };

  return { user, loading, logout };
}