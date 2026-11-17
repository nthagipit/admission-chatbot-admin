import { createContext, useEffect, useState } from "react";
import { mapToUser, type User } from "@/types/user.type";
import authApi from "@/apis/auth.api";
import { setAccessToken } from "@/utils/http";

interface AppContextInterface {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  logout: () => Promise<void>;
  reset: () => void;
}

export const getInitialAppContext: () => AppContextInterface = () => ({
  isAuthenticated: false,
  setIsAuthenticated: () => null,
  user: null,
  setUser: () => null,
  isLoading: true,
  logout: async () => {},
  reset: () => null,
});

const initialAppContext = getInitialAppContext();

export const AppContext = createContext<AppContextInterface>(initialAppContext);

/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
export const AppProvider = ({
  children,
  defaultValue = initialAppContext,
}: {
  children: React.ReactNode;
  defaultValue?: AppContextInterface;
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    defaultValue.isAuthenticated,
  );
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("👉 [AuthContext] F5/Mount: Đang gọi /auth/refresh...");
        const res = await authApi.refresh();
        console.log("👉 [AuthContext] /auth/refresh raw response:", res);
        const token = res.data.data.access_token;
        console.log("👉 [AuthContext] TOKEN khôi phục thành công:", token);
        if (token) {
          setAccessToken(token);
          setIsAuthenticated(true);
          try {
            const meRes = await authApi.getMe();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const userData = (meRes.data as any)?.data || meRes.data;
            if (userData) {
              setUser(mapToUser(userData));
            }
          } catch (err) {
            console.warn(
              "👉 [AuthContext] Không lấy được thông tin /users/me:",
              err,
            );
          }
        }
      } catch (error) {
        console.warn(
          "👉 [AuthContext] Không khôi phục được token (chưa đăng nhập hoặc cookie hết hạn):",
          error,
        );
        setAccessToken(null);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    void initializeAuth();
  }, []);

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
    } finally {
      setAccessToken(null);
      setIsAuthenticated(false);
      setUser(null);
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }
    }
  };

  const reset = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        isLoading,
        logout,
        reset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
