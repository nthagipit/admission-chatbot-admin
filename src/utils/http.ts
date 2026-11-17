import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import axios from "axios";
import config from "../constants/config";
import { ENDPOINTS } from "../constants/endpoint";

let inMemoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = () => inMemoryAccessToken;

export class Http {
  instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: config.baseUrl,
      timeout: 20000,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (inMemoryAccessToken && config.headers) {
          config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
          return config;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    let isRefreshing = false;
    let failedQueue: Array<{
      resolve: (token: string) => void;
      reject: (error: unknown) => void;
    }> = [];

    const processQueue = (error: unknown, token: string | null = null) => {
      failedQueue.forEach((prom) => {
        if (token) {
          prom.resolve(token);
        } else {
          prom.reject(error);
        }
      });
      failedQueue = [];
    };

    this.instance.interceptors.response.use(
      (response) => response,

      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (
          !error.response ||
          error.response.status !== 401 ||
          !originalRequest ||
          originalRequest._retry
        ) {
          return Promise.reject(error);
        }

        const requestUrl = originalRequest.url || "";
        const isAuthRequest =
          requestUrl.includes("auth/refresh") ||
          requestUrl.includes("auth/login") ||
          requestUrl.includes(ENDPOINTS.LOGIN) ||
          requestUrl.includes(ENDPOINTS.REFRESH);

        if (isAuthRequest) {
          setAccessToken(null);
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((newToken) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              return this.instance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          console.log("🔄 [Interceptor 401] Access Token hết hạn, đang gọi ngầm /auth/refresh...");
          const res = await axios.post<{
            code?: string;
            message?: string;
            data?: { access_token: string };
            access_token?: string;
          }>(`${config.baseUrl}/auth/refresh`, {}, { withCredentials: true });

          const newAccessToken =
            res.data.data?.access_token || res.data.access_token || "";

          console.log("🔄 [Interceptor 401] Đã nhận Access Token mới:", newAccessToken);

          if (!newAccessToken) {
            throw new Error("Cannot get new access token");
          }

          setAccessToken(newAccessToken);

          processQueue(null, newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          return this.instance(originalRequest);
        } catch (refreshError) {
          console.error("❌ [Interceptor 401] Refresh thất bại:", refreshError);
          processQueue(refreshError, null);
          setAccessToken(null);
          // Chỉ chuyển hướng nếu không phải đang ở trang login để tránh lặp vô hạn
          if (
            typeof window !== "undefined" &&
            window.location.pathname !== "/login" &&
            !window.location.pathname.startsWith("/login")
          ) {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      },
    );
  }
}

const http = new Http().instance;

export default http;
