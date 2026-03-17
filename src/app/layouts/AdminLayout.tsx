import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { logout } from "../services/auth";
import { Sidebar } from "../components/Sidebar";

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");

  // 🔁 Sync avec URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search") || "";
    setSearch(searchParam);
  }, [location.search]);

  // 🔥 Debounce recherche globale
  useEffect(() => {
  const timeout = setTimeout(() => {
    const params = new URLSearchParams(location.search);

    if (search) {
      params.set("search", search);
      params.set("page", "1");

      navigate(`/messages?${params.toString()}`, {
        replace: true,
      });
    } else {
      params.delete("search");

      // si déjà sur messages → reset
      if (location.pathname === "/messages") {
        navigate(`/messages`, { replace: true });
      }
    }
  }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-admin-bg text-white">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          {/* 🔍 SEARCH BAR */}
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Rechercher (email, message...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                rounded-xl
                bg-white/[0.03]
                border border-white/10
                px-3 py-2 pr-8
                text-sm text-white
                placeholder:text-admin-text-muted
                outline-none
                transition-all

                focus:border-admin-accent
                focus:ring-1 focus:ring-admin-accent
              "
            />

            {/* ❌ Clear button */}
            {search && (
              <button
                onClick={() => setSearch("")}
                className="
                  absolute right-2 top-1/2 -translate-y-1/2
                  text-xs text-white/50
                  hover:text-white
                "
              >
                ✕
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="
                rounded-lg
                bg-red-500/10
                px-3 py-1.5
                text-sm text-red-400
                border border-red-500/20
                hover:bg-red-500/20
                transition
              "
            >
              Déconnexion
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