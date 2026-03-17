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
      <Sidebar onLogout={handleLogout} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          {/* 🔍 SEARCH BAR */}
          <div className="relative w-full max-w-xl">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-admin-text-muted">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </span>

            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-2xl border border-white/6 bg-white/[0.03] pl-12 pr-4 text-sm text-white placeholder:text-admin-text-muted outline-none transition focus:border-white/15 focus:bg-white/[0.045]"
            />
            <button onClick={() => setSearch("")}className="absolute right-2 top-1/2 -translate-y-1/2text-xs text-white/50hover:text-white">✕</button>
          </div>

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