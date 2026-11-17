import { AppContext } from "@/contexts/app.context";
import { useContext } from "react";

export function useAuth() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
