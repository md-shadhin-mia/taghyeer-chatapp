import { apiRequest } from "@/services/api/client";
import type { LoginRequest, LoginResponse, User } from "@/types/api";

export function login(payload: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", { method: "POST", body: payload });
}

export function getCurrentUser(token: string): Promise<User> {
  return apiRequest<User>("/auth/me", { token });
}
