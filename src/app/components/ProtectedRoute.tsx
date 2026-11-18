import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import { MessageNotificationsProvider } from "../providers/MessageNotificationsProvider";
import { AccountAccessContext } from "../context/AccountAccessContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, profile } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-slate-700">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AccountAccessContext.Provider value={profile}>
      <MessageNotificationsProvider enabled={Boolean(profile?.permissions?.some((code) => code === "messages.read" || code === "rgpd.read"))}>
        {children}
      </MessageNotificationsProvider>
    </AccountAccessContext.Provider>
  );
}