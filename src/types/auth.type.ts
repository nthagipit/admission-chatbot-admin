import type { SuccessResponse } from "./utils.type";

export type AuthResponse = SuccessResponse<{
  access_token: string;
  expires: number;
  token_type: string;
}>;

export type RefreshTokenResponse = SuccessResponse<{
  access_token: string;
  expires_access_token: number;
  token_type: string;
}>;

export type UserRole = "USER" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}
