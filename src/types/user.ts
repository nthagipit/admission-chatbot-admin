import type { UserRole } from "./auth.type";
import type { PageParams } from "./common";

export type AuthProvider = "LOCAL" | "GOOGLE";

export interface ManagedUser {
  id: string;
  fullName: string;
  email: string;
  authProvider: AuthProvider;
  role: UserRole;
  createdAt: string;
  enabled: boolean;
  avatarUrl?: string | null;
  totalConversations: number;
}

export interface UserListParams extends PageParams {
  search?: string;
  role?: UserRole | "";
  authProvider?: AuthProvider | "";
}

export interface UserUpdate {
  role?: UserRole;
  enabled?: boolean;
}
