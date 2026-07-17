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

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: queryString,
      variables,
    }),
  });

  return response.json();
};