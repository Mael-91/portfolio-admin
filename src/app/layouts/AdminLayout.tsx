import { Outlet, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";
import { Sidebar } from "../components/Sidebar";

export function AdminLayout() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // noop
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-admin-bg text-admin-text">
      <div className="flex min-h-screen w-full bg-admin-panel">
        <Sidebar onLogout={handleLogout} />

        <div className="flex min-w-0 flex-1 flex-col bg-[linear-gradient(180deg,#07152e_0%,#08152b_100%)]">
          <header className="sticky top-0 z-20 border-b border-white/6 bg-admin-panel/80 px-8 py-5 backdrop-blur-md">
            <div className="flex items-center justify-between gap-6">
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
                  className="h-12 w-full rounded-2xl border border-white/6 bg-white/[0.03] pl-12 pr-4 text-sm text-white placeholder:text-admin-text-muted outline-none transition focus:border-white/15 focus:bg-white/[0.045]"
                />
              </div>

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
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-x-hidden px-8 py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}