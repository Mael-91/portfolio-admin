import { Outlet, Link, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

export function AdminLayout() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // on redirige quand même
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-64 bg-slate-900 p-6 text-white">
        <h2 className="mb-8 text-xl font-bold">Admin</h2>

        <nav className="space-y-3">
          <Link to="/" className="block rounded-lg px-3 py-2 hover:bg-slate-800">
            Dashboard
          </Link>

          <Link
            to="/messages"
            className="block rounded-lg px-3 py-2 hover:bg-slate-800"
          >
            Demandes de contact
          </Link>
        </nav>

        <div className="mt-10">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-slate-700 px-3 py-2 text-left hover:bg-slate-800"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}