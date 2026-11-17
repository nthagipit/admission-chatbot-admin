import type { SuccessResponse } from "@/types/utils.type";
import { ENDPOINTS } from "../constants/endpoint";
import type { AuthResponse, RefreshTokenResponse } from "../types/auth.type";
import http from "../utils/http";
import type { UserResponse } from "@/types/user.type";

const authApi = {
  login(body: { email: string; password: string }) {
    return http.post<AuthResponse>(ENDPOINTS.LOGIN, body);
  },

  logout() {
    return http.post(ENDPOINTS.LOGOUT);
  },
  refresh() {
    return http.post<RefreshTokenResponse>(ENDPOINTS.REFRESH);
  },
  getMe() {
    return http.get<SuccessResponse<UserResponse>>("/users/me");
  },
};

export default authApi;
