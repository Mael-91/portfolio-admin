import { useEffect, useState } from "react";
import { getMe } from "../services/auth";
import type { AuthUser } from "../services/auth";

interface UseAuthResult {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshAuth() {
    try {
      const response = await getMe();
      setUser(response.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshAuth();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    refreshAuth,
  };
}