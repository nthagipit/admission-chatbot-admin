import http from "@/utils/http";
import type { AuthProvider } from "@/types/user";
import type { User, UserQueryConfig, UserResponse } from "@/types/user.type";
import type { SuccessResponse } from "@/types/utils.type";
import type { PagebleData } from "@/types/conversation.type";
import type { UserRole } from "@/types/auth.type";

// ─── Mappers ─────────────────────────────────────────────────────────────────

export function mapUserDataItem(raw: UserResponse): User {
  const roleStr = String(raw.role ?? "").toUpperCase();
  const role: UserRole = roleStr === "ADMIN" ? "ADMIN" : "USER";

  const providerStr = String(raw.auth_provider ?? "").toUpperCase();
  const authProvider: AuthProvider =
    providerStr === "GOOGLE" ? "GOOGLE" : "LOCAL";

  return {
    id: raw.id,
    fullName: raw.full_name || raw.email?.split("@")[0] || "User",
    email: raw.email,
    authProvider,
    providerId: raw.provider_id || null,
    role,
    createdAt: raw.created_at,
    avatarUrl: raw.avatar_url || null,
    enabled: raw.enabled !== undefined ? raw.enabled : true,
  };
}

export function mapUserData(raw: PagebleData<UserResponse>): PagebleData<User> {
  if (!raw || !Array.isArray(raw.items)) {
    return { items: [], page: 1, page_size: 10, total: 0, total_pages: 1 };
  }
  return {
    items: raw.items.map(mapUserDataItem),
    page: raw.page,
    page_size: raw.page_size,
    total: raw.total,
    total_pages: raw.total_pages,
  };
}

export const userApi = {
  async getAllUser(
    params: UserQueryConfig,
  ): Promise<{ data: SuccessResponse<PagebleData<User>> }> {
    const res = await http.get<SuccessResponse<PagebleData<UserResponse>>>(
      "/users",
      {
        params,
      },
    );

    return {
      ...res,
      data: {
        ...res.data,
        data: mapUserData(res.data.data),
      },
    };
  },

  async getUserById(id: string): Promise<User> {
    const res = await http.get<SuccessResponse<UserResponse>>(`/users/${id}`);
    return mapUserDataItem(res.data.data);
  },

  async getUser(id: string): Promise<User> {
    return this.getUserById(id);
  },

  async updateUser(
    id: string,
    patch: { role?: UserRole; enabled?: boolean },
  ): Promise<User> {
    const body: Record<string, unknown> = {};
    if (patch.role) body.role = patch.role.toLowerCase();
    if (patch.enabled !== undefined) {
      body.enabled = patch.enabled;
      body.is_active = patch.enabled;
    }
    const res = await http.patch<SuccessResponse<UserResponse>>(
      `/users/${id}`,
      body,
    );
    return mapUserDataItem(res.data.data);
  },
};
