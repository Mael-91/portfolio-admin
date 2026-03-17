import { Link, useLocation } from "react-router-dom";
import { useMessageNotifications } from "../hooks/useMessageNotifications";

export function Sidebar() {
  const location = useLocation();
  const { unprocessedCount } = useMessageNotifications();

  function isActive(path: string) {
    return location.pathname.startsWith(path);
  }

  return (
    <aside className="flex h-full w-64 flex-col bg-[#0b162d] px-4 py-6">
      {/* Logo */}
      <div className="mb-10 px-2">
        <h1 className="text-base font-semibold text-white">Admin</h1>
      </div>

      <nav className="flex flex-col gap-1 text-sm">
        <Link
          to="/"
          className={`rounded-lg px-3 py-2 transition ${
            isActive("/") ? "bg-white/10 text-white" : "text-admin-text-soft hover:bg-white/5"
          }`}
        >
          Dashboard
        </Link>

        <Link
          to="/messages"
          className={`flex items-center justify-between rounded-lg px-3 py-2 transition ${
            isActive("/messages")
              ? "bg-white/10 text-white"
              : "text-admin-text-soft hover:bg-white/5"
          }`}
        >
          <span>Demandes de contact</span>

          {unprocessedCount > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
              {unprocessedCount}
            </span>
          )}
        </Link>

        <Link
          to="/settings"
          className={`rounded-lg px-3 py-2 transition ${
            isActive("/settings")
              ? "bg-white/10 text-white"
              : "text-admin-text-soft hover:bg-white/5"
          }`}
        >
          Paramètres
        </Link>
      </nav>
    </aside>
  );
}