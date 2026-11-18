import { useCallback, useEffect, useState } from "react";
import { getMe } from "../services/auth";
import type { AuthUser, MeResponse } from "../services/auth";

interface UseAuthResult {
  user: AuthUser | null;
  profile: MeResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    try {
      const response = await getMe();
      setProfile(response);
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshAuth();
    window.addEventListener("admin-access-changed", refreshAuth);
    return () => window.removeEventListener("admin-access-changed", refreshAuth);
  }, [refreshAuth]);

  return {
    profile,
    user: profile?.user ?? null,
    isLoading,
    isAuthenticated: Boolean(profile?.user),
    refreshAuth,
  };
}