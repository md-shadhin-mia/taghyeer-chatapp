import { apiRequest } from "@/services/api/client";
import type { UserSearchResult } from "@/types/api";

// The API has a bug where a leading "+" in the query breaks its regex search
// (see API.md "Observed quirks"), so we search on digits only.
export function searchUsers(token: string, query: string): Promise<UserSearchResult[]> {
  const sanitized = query.replace(/^\+/, "");
  return apiRequest<UserSearchResult[]>(
    `/users/search?q=${encodeURIComponent(sanitized)}`,
    { token },
  );
}
