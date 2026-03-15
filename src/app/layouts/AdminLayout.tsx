import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.25 9.75V21h5.25v-6h3v6h5.25V9.75" />
      </svg>
    ),
  },
  {
    label: "Demandes de contact",
    href: "/messages",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 8h10" />
        <path d="M7 12h10" />
        <path d="M7 16h6" />
        <rect x="3" y="4" width="18" height="16" rx="2.5" />
      </svg>
    ),
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function AdminLayout() {
  const location = useLocation();
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
      <div className="mx-auto flex min-h-screen max-w-[1800px] overflow-hidden rounded-[28px] border border-admin-border bg-admin-panel shadow-2xl shadow-black/30">
        <aside className="flex w-[290px] shrink-0 flex-col border-r border-admin-border bg-[#041126]">
          <div className="flex h-20 items-center px-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-admin-accent-soft text-admin-accent ring-1 ring-white/5">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                <path d="M3.2 14.4c2.7-3 5.2-4.4 7.5-4.4 2 0 3.7.9 5.1 2.6 1.1 1.3 2.3 2 3.7 2 1 0 2-.3 3-.8-.9 1.9-2 3.3-3.4 4.2-1.1.7-2.3 1.1-3.7 1.1-2 0-3.8-.9-5.3-2.6-1.2-1.4-2.5-2.1-4-2.1-1 0-2 .2-2.9.6ZM4.5 8.7C6.5 5.6 9.1 4 12.2 4c1.6 0 3 .4 4.1 1.1 1 .7 1.9 1.8 2.8 3.2-1.5-.5-2.8-.8-4-.8-2.6 0-4.9.8-7 2.3-1.2.9-2.4 2-3.6 3.4.1-1.7.8-3.1 2-4.5Z" />
              </svg>
            </div>
          </div>

          <div className="px-5">
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl px-4 py-3 text-[17px] font-medium transition",
                      isActive
                        ? "bg-white/8 text-white shadow-inner ring-1 ring-white/5"
                        : "text-admin-text-soft hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span
                      className={cn(
                        "transition",
                        isActive ? "text-white" : "text-admin-text-muted group-hover:text-admin-text"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-10 px-8">
            <p className="text-sm font-semibold text-admin-text-muted">Espaces</p>

            <div className="mt-5 space-y-4">
              {["Administration", "Support", "Exports"].map((team, index) => (
                <div key={team} className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/6 bg-white/[0.03] text-sm font-semibold text-admin-text-soft">
                    {["A", "S", "E"][index]}
                  </div>
                  <span className="text-[17px] font-medium text-admin-text-soft">{team}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto px-5 pb-5">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[17px] font-medium text-admin-text-soft transition hover:bg-white/5 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M15 3h3a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-3" />
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
              </svg>
              <span>Déconnexion</span>
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-[linear-gradient(180deg,#07152e_0%,#08152b_100%)]">
          <header className="sticky top-0 z-20 border-b border-admin-border bg-admin-panel/80 px-8 py-5 backdrop-blur-md">
            <div className="flex items-center justify-between gap-6">
              <div className="relative w-full max-w-xl">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-admin-text-muted">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </span>

                <input
                  type="text"
                  placeholder="Search"
                  className="h-12 w-full rounded-2xl border border-white/6 bg-white/[0.03] pl-12 pr-4 text-sm text-white placeholder:text-admin-text-muted outline-none ring-0 transition focus:border-admin-border-strong focus:bg-white/[0.045]"
                />
              </div>

              <div className="flex items-center gap-5">
                <button className="relative text-admin-text-soft transition hover:text-white">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
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

                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-admin-text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
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