"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, login as loginRequest } from "@/services/api/auth";
import { disconnectSocket } from "@/services/socket/client";
import { useAuthStore } from "@/store/auth-store";
import { queryKeys } from "@/utils/query-keys";
import type { LoginRequest } from "@/types/api";

export function useAuth() {
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setToken = useAuthStore((state) => state.setToken);
  const clearToken = useAuthStore((state) => state.clearToken);
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: queryKeys.me(token),
    queryFn: () => getCurrentUser(token as string),
    enabled: hasHydrated && Boolean(token),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (payload: LoginRequest) => loginRequest(payload),
    onSuccess: ({ token: newToken, user }) => {
      setToken(newToken);
      queryClient.setQueryData(queryKeys.me(newToken), user);
    },
  });

  const user = token ? meQuery.data ?? null : null;
  const isLoading = !hasHydrated || (Boolean(token) && meQuery.isPending);

  async function login(payload: LoginRequest) {
    const result = await loginMutation.mutateAsync(payload);
    return result.user;
  }

  function logout() {
    clearToken();
    disconnectSocket();
    queryClient.clear();
  }

  return {
    user,
    token,
    isLoading,
    login,
    logout,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
  };
}
