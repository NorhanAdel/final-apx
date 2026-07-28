export interface FetchGraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
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

  console.log("🌐 Sending request with language:", language);
  console.log("🔑 Token exists:", !!token);

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
      return await response.json();
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