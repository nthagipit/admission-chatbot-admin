import type { UserRole } from "./auth.type";
import type { AuthProvider } from "./user";

export interface UserQueryConfig {
  page?: number | string;
  page_size?: number | string;
  search?: string;
  role?: string;
  provider?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  authProvider: AuthProvider;
  providerId?: string | null;
  role: UserRole;
  createdAt: string;
  avatarUrl: string | null;
  enabled?: boolean;
}

export interface UserResponse {
  id: string;
  full_name: string;
  email: string;
  auth_provider: string;
  provider_id?: string | null;
  role: string;
  created_at: string;
  avatar_url: string | null;
  enabled?: boolean;
}

export const mapToUser = (user: UserResponse): User => {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    authProvider: user.auth_provider as AuthProvider,
    providerId: user.provider_id ?? null,
    role: user.role as UserRole,
    createdAt: user.created_at,
    avatarUrl: user.avatar_url,
    enabled: user.enabled,
  };
};
