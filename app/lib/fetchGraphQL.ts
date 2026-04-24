export interface FetchGraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
}

export const fetchGraphQL = async <T = unknown>(
  query: unknown,
  variables?: Record<string, unknown>,
): Promise<FetchGraphQLResponse<T>> => {
  const language =
    typeof window !== "undefined" ? localStorage.getItem("lang") || "en" : "en";
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  console.log("🌐 Sending request with language:", language);
  console.log("🔑 Token exists:", !!token);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept-Language": language,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Ensure query is a string. If the caller passed a DocumentNode (from `gql`),
  // try to read the original source from `loc.source.body` which graphql-tag preserves.
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
    // Fallback: try to JSON.stringify (will likely fail on server)
    // but this avoids sending an AST object directly which GraphQL servers reject.
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
