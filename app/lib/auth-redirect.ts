import { fetchGraphQL } from "./fetchGraphQL";

type RedirectUser = {
  role: string;
  has_active_subscription?: boolean;
};

const PROFILE_QUERIES: Record<string, string> = {
  PLAYER: `
    query GetPlayerProfileExists {
      myPlayerProfile { id }
    }
  `,
  CLUB: `
    query GetClubProfileExists {
      myClubProfile { id }
    }
  `,
  SCOUT: `
    query GetScoutProfileExists {
      myScoutProfile { id }
    }
  `,
  AGENT: `
    query GetAgentProfileExists {
      myAgentProfile { id }
    }
  `,
};

const PROFILE_PATHS: Record<string, string> = {
  PLAYER: "/profile",
  CLUB: "/clubprofile/profile",
  SCOUT: "/scout/profile",
  AGENT: "/agent/profile",
};

const PACKAGE_PATHS: Record<string, string> = {
  PLAYER: "/profile/participationprime",
  CLUB: "/clubprofile/participationprime",
  SCOUT: "/scout/profile/participationprime",
  AGENT: "/agent/participationprime",
};

export async function getPostAuthRedirect(user: RedirectUser): Promise<string> {
  const role = user.role.toUpperCase();

  if (!user.has_active_subscription && PACKAGE_PATHS[role]) {
    return PACKAGE_PATHS[role];
  }

  if (PROFILE_PATHS[role]) {
    try {
      const result = await fetchGraphQL<{ [key: string]: { id: string } | null }>(
        PROFILE_QUERIES[role],
      );
      const profile = Object.values(result.data || {})[0];

      return profile?.id ? "/" : PROFILE_PATHS[role];
    } catch (error) {
      console.error("Error checking profile before redirect:", error);
      return PROFILE_PATHS[role];
    }
  }

  return role === "ADMIN" ? "/admin" : "/";
}