import { createContext, useContext } from "react";
import type { MeResponse } from "../services/auth";

export const AccountAccessContext = createContext<MeResponse | null>(null);

export function useAccountAccess() {
  const profile = useContext(AccountAccessContext);
  return {
    profile,
    isAdmin: profile?.roles?.includes("admin") ?? false,
    hasPermission: (code: string) => profile?.permissions?.includes(code) ?? false,
  };
}
