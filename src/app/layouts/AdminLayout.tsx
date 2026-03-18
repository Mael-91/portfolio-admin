import { Outlet, useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { logout } from "../services/auth";
import Sidebar from "../components/Sidebar";
import HeaderSearch from "../components/HeaderSearch";

export function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login");
  }, [navigate]);

  return (
    <div className="flex h-screen bg-admin-bg text-white">
      <Sidebar onLogout={handleLogout} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          {/* 🔍 SEARCH BAR */}
          <HeaderSearch />
          {/* Actions */}
          <div className="flex items-center gap-5">
            <button className="relative text-admin-text-soft transition hover:text-white">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M15 17H9a4 4 0 0 1-4-4V10a7 7 0 1 1 14 0v3a4 4 0 0 1-4 4Z" />
                <path d="M10 20a2 2 0 0 0 4 0" />
              </svg>
            </button>

            <div className="h-8 w-px bg-white/10" />

            <button className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition hover:bg-white/5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white">
                MC
              </div>

              <div className="hidden text-left md:block">
                <p className="text-base font-semibold text-white">Mael Constantin</p>
              </div>

              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-admin-text-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
              </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}