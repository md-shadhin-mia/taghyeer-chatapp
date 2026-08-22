export interface User {
  _id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface LoginRequest {
  phone: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UserSearchResult {
  _id: string;
  name: string;
  phone: string;
}

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  error: {
    message: string;
    code:
      | "NO_TOKEN"
      | "VALIDATION_ERROR"
      | "FORBIDDEN"
      | "NOT_FOUND"
      | "SERVER_ERROR"
      | string;
    details?: ApiErrorDetail[];
  };
}
