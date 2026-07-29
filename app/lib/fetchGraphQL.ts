export interface FetchGraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
}

const REFRESH_MUTATION = `
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      token
      refreshToken
    }
  }
`;

let refreshPromise: Promise<{ token: string; refreshToken: string } | null> | null = null;

async function tryRefreshAccessToken(
  apiUrl: string,
  headers: Record<string, string>,
): Promise<{ token: string; refreshToken: string } | null> {
  if (typeof window === "undefined") return null;
  const storedRefreshToken = localStorage.getItem("refreshToken");
  if (!storedRefreshToken) return null;

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${apiUrl}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": headers["Accept-Language"] || "en",
          "apollo-require-preflight": "true",
        },
        body: JSON.stringify({
          query: REFRESH_MUTATION,
          variables: { input: { refreshToken: storedRefreshToken } },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data?.refreshToken?.token) {
          const newToken = json.data.refreshToken.token;
          const newRefreshToken = json.data.refreshToken.refreshToken;
          localStorage.setItem("token", newToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }
          return { token: newToken, refreshToken: newRefreshToken };
        }
      }
    } catch (e) {
      console.error("Silent token refresh failed:", e);
    } finally {
      refreshPromise = null;
    }
    return null;
  })();

  return refreshPromise;
}

function isAuthError(resJson: any): boolean {
  if (!resJson?.errors || !Array.isArray(resJson.errors)) return false;
  return resJson.errors.some((err: any) => {
    const msg = (err.message || "").toLowerCase();
    const code = (err.extensions?.code || "").toString().toLowerCase();
    return (
      msg.includes("unauthorized") ||
      msg.includes("jwt expired") ||
      msg.includes("invalid token") ||
      msg.includes("unauthenticated") ||
      code.includes("unauthenticated") ||
      code.includes("unauthorized")
    );
  });
}

export const fetchGraphQL = async <T = unknown>(
  query: unknown,
  variables?: Record<string, unknown>,
): Promise<FetchGraphQLResponse<T>> => {
  const rawLanguage =
    typeof window !== "undefined" ? localStorage.getItem("lang") || "en" : "en";
  const language = rawLanguage.replace(/[^\x00-\x7F]/g, "") || "en";

  const rawToken =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const token = rawToken ? rawToken.replace(/[^\x00-\x7F]/g, "") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept-Language": language,
    "apollo-require-preflight": "true",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let queryString: string;
  if (typeof query === "string") {
    queryString = query;
  } else if (
    query &&
    typeof query === "object" &&
    (query as any).loc?.source?.body
  ) {
    queryString = (query as any).loc.source.body;
  } else {
    try {
      queryString = JSON.stringify(query as Record<string, unknown>);
    } catch {
      queryString = String(query);
    }
  }

  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";
  const apiUrl = rawApiUrl.replace(/\/+$/, "");

  try {
    const response = await fetch(`${apiUrl}/graphql`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: queryString,
        variables,
      }),
    });

    if (response.ok) {
      let json = await response.json();

      if (isAuthError(json) && !queryString.includes("mutation RefreshToken")) {
        const refreshed = await tryRefreshAccessToken(apiUrl, headers);
        if (refreshed?.token) {
          headers["Authorization"] = `Bearer ${refreshed.token}`;
          const retryRes = await fetch(`${apiUrl}/graphql`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              query: queryString,
              variables,
            }),
          });
          if (retryRes.ok) {
            return await retryRes.json();
          }
        }
      }

      return json;
    }

    if (response.status === 401 && !queryString.includes("mutation RefreshToken")) {
      const refreshed = await tryRefreshAccessToken(apiUrl, headers);
      if (refreshed?.token) {
        headers["Authorization"] = `Bearer ${refreshed.token}`;
        const retryRes = await fetch(`${apiUrl}/graphql`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            query: queryString,
            variables,
          }),
        });
        if (retryRes.ok) {
          return await retryRes.json();
        }
      }
    }

    return {
      errors: [
        {
          message: `Server HTTP ${response.status}: ${response.statusText}`,
        },
      ],
    };
  } catch (error: any) {
    // Smart Fallback: If remote API URL failed (e.g. ISP block/offline), try local backend
    if (!apiUrl.includes("localhost") && !apiUrl.includes("127.0.0.1")) {
      try {
        const localResponse = await fetch("http://localhost:3001/graphql", {
          method: "POST",
          headers,
          body: JSON.stringify({
            query: queryString,
            variables,
          }),
        });
        if (localResponse.ok) {
          return await localResponse.json();
        }
      } catch {
        // Ignored fallback error
      }
    }

    return {
      errors: [
        {
          message:
            error?.message ||
            "Failed to connect to backend server. Please check API URL or server availability.",
        },
      ],
    };
  }
};