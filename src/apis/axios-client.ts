import axios from "axios";

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1",
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

let onUnauthorized: (() => void) | null = null;

/** AuthProvider đăng ký handler này để xử lý 401 (token hết hạn/không hợp lệ). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

axiosClient.interceptors.request.use((config) => {
  // const token = tokenStorage.get();
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isLoginCall = String(error.config?.url ?? "").includes("/auth/login");
    // 401 → xoá phiên và đưa về /login. 403 để từng màn tự hiển thị (xem getErrorMessage).
    if (status === 401 && !isLoginCall) {
      // tokenStorage.clear();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);
