"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { fetchGraphQL } from "../lib/fetchGraphQL";

const GET_PLAYER_PROFILE_EXISTS = `
  query GetPlayerProfileExists {
    myPlayerProfile {
      id
    }
  }
`;

const GET_CLUB_PROFILE_EXISTS = `
  query GetClubProfileExists {
    myClubProfile {
      id
      club_name
    }
  }
`;

const GET_SCOUT_PROFILE_EXISTS = `
  query GetScoutProfileExists {
    myScoutProfile {
      id
      first_name
      last_name
    }
  }
`;

const GET_AGENT_PROFILE_EXISTS = `
  query GetAgentProfileExists {
    myAgentProfile {
      id
      first_name
      last_name
    }
  }
`;

const GET_USER_PROFILE_EXISTS = `
  query GetUserProfileExists {
    myUserProfile {
      id
      first_name
      last_name
    }
  }
`;

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: authLoading } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkProfileAndRedirect = async () => {
      if (authLoading) return;

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const role = user.role as string;
      let hasProfile = false;

      try {
        switch (role) {
          case "PLAYER":
            try {
              const result = await fetchGraphQL<{
                myPlayerProfile: { id: string } | null;
              }>(GET_PLAYER_PROFILE_EXISTS, {});
              hasProfile = !!result.data?.myPlayerProfile?.id;
            } catch {
              hasProfile = false;
            }
            break;

          case "CLUB":
            try {
              const result = await fetchGraphQL<{
                myClubProfile: { id: string } | null;
              }>(GET_CLUB_PROFILE_EXISTS, {});
              hasProfile = !!result.data?.myClubProfile?.id;
            } catch {
              hasProfile = false;
            }
            break;

          case "SCOUT":
            try {
              const result = await fetchGraphQL<{
                myScoutProfile: { id: string } | null;
              }>(GET_SCOUT_PROFILE_EXISTS, {});
              hasProfile = !!result.data?.myScoutProfile?.id;
            } catch {
              hasProfile = false;
            }
            break;

          case "AGENT":
            try {
              const result = await fetchGraphQL<{
                myAgentProfile: { id: string } | null;
              }>(GET_AGENT_PROFILE_EXISTS, {});
              hasProfile = !!result.data?.myAgentProfile?.id;
            } catch {
              hasProfile = false;
            }
            break;

          case "USER":
            try {
              const result = await fetchGraphQL<{
                myUserProfile: { id: string } | null;
              }>(GET_USER_PROFILE_EXISTS, {});
              hasProfile = !!result.data?.myUserProfile?.id;
            } catch {
              hasProfile = false;
            }
            break;

          default:
            hasProfile = true;
            break;
        }
      } catch (error) {
        console.error("Error checking profile:", error);
        hasProfile = false;
      }

      const isOnProfilePage =
        pathname.includes("/profile") ||
        pathname.includes("/clubprofile/profile") ||
        pathname.includes("/scout/profile") ||
        pathname.includes("/agent/profile") ||
        pathname.includes("/user/profile");

      if (!hasProfile && !isOnProfilePage) {
        switch (role) {
          case "PLAYER":
            router.push("/profile");
            break;
          case "CLUB":
            router.push("/clubprofile/profile");
            break;
          case "SCOUT":
            router.push("/scout/profile");
            break;
          case "AGENT":
            router.push("/agent/profile");
            break;
          case "USER":
            router.push("/user/profile");
            break;
          default:
            router.push("/");
        }
      } else if (hasProfile && isOnProfilePage) {
        router.push("/");
      }

      setCheckingProfile(false);
    };

    checkProfileAndRedirect();
  }, [user, authLoading, pathname, router]);

  if (authLoading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}