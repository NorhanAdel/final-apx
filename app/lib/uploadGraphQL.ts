// app/lib/uploadGraphQL.ts
import { FetchGraphQLResponse } from "./fetchGraphQL";

export const uploadGraphQL = async <T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<FetchGraphQLResponse<T>> => {
  const language =
    typeof window !== "undefined" ? localStorage.getItem("lang") || "en" : "en";
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const formData = new FormData();

  const files: { path: string; file: File }[] = [];

  const findFiles = (
    obj: Record<string, unknown>,
    target: Record<string, unknown>,
    path: string,
  ) => {
    if (!obj || typeof obj !== "object") return;

    for (const key in obj) {
      const value = obj[key];
      const currentPath = path ? `${path}.${key}` : key;

      if (value instanceof File) {
        console.log(`Found file at ${currentPath}:`, value.name);
        files.push({ path: `variables.${currentPath}`, file: value });
        target[key] = null;
      } else if (Array.isArray(value)) {
        const newArray: unknown[] = [];
        for (let i = 0; i < value.length; i++) {
          if (value[i] instanceof File) {
            const arrayPath = `${currentPath}.${i}`;
            console.log(`Found file at ${arrayPath}:`, value[i].name);
            files.push({ path: `variables.${arrayPath}`, file: value[i] });
            newArray.push(null);
          } else {
            newArray.push(value[i]);
          }
        }
        target[key] = newArray;
      } else if (
        value &&
        typeof value === "object" &&
        !(value instanceof Date)
      ) {
        const newObj: Record<string, unknown> = {};
        target[key] = newObj;
        findFiles(value as Record<string, unknown>, newObj, currentPath);
      } else {
        target[key] = value;
      }
    }
  };

  // Deep copy without destroying File objects
  const variablesCopy: Record<string, unknown> = {};
  findFiles(variables || {}, variablesCopy, "");

  console.log("=== UPLOAD GRAPHQL DEBUG ===");
  console.log("Files found:", files.length);
  files.forEach((f) => console.log("  - path:", f.path, "file:", f.file.name));

  const operations = {
    // If query is a DocumentNode (gql``), extract original string if available
    query:
      typeof query === "string"
        ? query
        : (query as any)?.loc?.source?.body ??
          (typeof query === "object" ? JSON.stringify(query) : String(query)),
    variables: variablesCopy,
  };

  formData.append("operations", JSON.stringify(operations));

  if (files.length > 0) {
    const map: Record<string, string[]> = {};
    files.forEach((file, index) => {
      map[index] = [file.path];
    });
    formData.append("map", JSON.stringify(map));

    files.forEach((file, index) => {
      formData.append(index.toString(), file.file);
    });
  } else {
    formData.append("map", "{}");
  }

  const headers: Record<string, string> = {
    "Accept-Language": language,
    "apollo-require-preflight": "true",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
    method: "POST",
    headers,
    body: formData,
  });

  const result = await response.json();

  console.log("Response status:", response.status);
  console.log("Response result:", result);

  if (!response.ok) {
    throw new Error(
      result.errors?.[0]?.message ||
        result.message ||
        `HTTP ${response.status}`,
    );
  }

  return result;
};
