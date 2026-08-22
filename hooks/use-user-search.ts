"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { searchUsers } from "@/services/api/users";
import { ApiError } from "@/services/api/error";
import { queryKeys } from "@/utils/query-keys";

export function useUserSearch(token: string | null, currentUserId?: string) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 350);

  const searchQuery = useQuery({
    queryKey: queryKeys.userSearch(token, debouncedQuery),
    queryFn: () => searchUsers(token as string, debouncedQuery),
    enabled: Boolean(token) && debouncedQuery.length > 0,
    select: (users) => users.filter((candidate) => candidate._id !== currentUserId),
  });

  return {
    query,
    setQuery,
    debouncedQuery,
    results: searchQuery.data ?? [],
    isLoading: Boolean(debouncedQuery) && searchQuery.isFetching,
    isError: searchQuery.isError,
    error:
      searchQuery.error instanceof ApiError
        ? searchQuery.error.message
        : searchQuery.isError
          ? "Couldn't search right now. Please try again."
          : null,
  };
}
