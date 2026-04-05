import { Link, useLocation } from "react-router-dom";
import { useMessageNotifications } from "../hooks/useMessageNotifications";
import { memo, useEffect, useState } from "react";
import { env } from "../../env";
import { useGeneralSettings } from "../context/GeneralSettingsContext";

type SidebarProps = {
  onLogout: () => void | Promise<void>;
};

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
  {
    label: "Portfolio",
    href: "/portfolio-images",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="m7 14 3-3 3 3 4-4 2 2" />
        <circle cx="8.5" cy="9" r="1.2" />
      </svg>
    ),
  },
  {
    label: "Prestations",
    href: "/prestations",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="4" y="5" width="16" height="14" rx="2.5" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
      </svg>
    ),
  },
  {
    label: "À propos",
    href: "/about",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="8" r="3.25" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </svg>
    ),
  },
  {
    label: "Documents légaux",
    href: "/legal",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 7h8" />
        <path d="M8 11h8" />
        <path d="M8 15h5" />
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
        <path d="M14 3v5h5" />
      </svg>
    ),
  },
];

function resolveAssetUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${env.apiBaseUrl}${url}`;
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SidebarComponent({ onLogout }: SidebarProps) {
  const location = useLocation();
  const { unprocessedCount } = useMessageNotifications();

  const isSettingsRoute = location.pathname.startsWith("/settings");
  const [settingsOpen, setSettingsOpen] = useState(isSettingsRoute);

  const { settings } = useGeneralSettings();
  const sidebarLogoUrl = resolveAssetUrl(settings.siteSidebarLogoUrl);

  useEffect(() => {
    if (isSettingsRoute) {
      setSettingsOpen(true);
    }
  }, [isSettingsRoute]);

  return (
    <aside className="flex w-[250px] shrink-0 flex-col border-r border-white/6 bg-[#041126]">
      <div className="flex h-20 items-center px-7">
        {sidebarLogoUrl ? (
          <img
            src={sidebarLogoUrl}
            alt={settings.siteName || "Logo dashboard"}
            className="max-h-12 max-w-[160px] object-cover rounded-full ring-1 ring-white/10"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-admin-accent-soft text-admin-accent ring-1 ring-white/5">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
              <path d="M3.2 14.4c2.7-3 5.2-4.4 7.5-4.4 2 0 3.7.9 5.1 2.6 1.1 1.3 2.3 2 3.7 2 1 0 2-.3 3-.8-.9 1.9-2 3.3-3.4 4.2-1.1.7-2.3 1.1-3.7 1.1-2 0-3.8-.9-5.3-2.6-1.2-1.4-2.5-2.1-4-2.1-1 0-2 .2-2.9.6ZM4.5 8.7C6.5 5.6 9.1 4 12.2 4c1.6 0 3 .4 4.1 1.1 1 .7 1.9 1.8 2.8 3.2-1.5-.5-2.8-.8-4-.8-2.6 0-4.9.8-7 2.3-1.2.9-2.4 2-3.6 3.4.1-1.7.8-3.1 2-4.5Z" />
            </svg>
          </div>
        )}
      </div>

      <div className="px-5 pt-8">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.href);

            const isMessages = item.href === "/messages";

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-2xl px-4 py-3 text-[14px] font-medium transition",
                  isActive
                    ? "bg-white/8 text-white shadow-inner ring-1 ring-white/5"
                    : "text-admin-text-soft hover:bg-white/5 hover:text-white"
                )}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "transition",
                      isActive
                        ? "text-white"
                        : "text-admin-text-muted group-hover:text-admin-text"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="block leading-tight whitespace-normal">
                    {item.label}
                  </span>
                </span>

                {isMessages && unprocessedCount > 0 ? (
                  <span className="ml-3 rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {unprocessedCount}
                  </span>
                ) : null}
              </Link>
            );
          })}

          {/* PARAMÈTRES DROPDOWN */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setSettingsOpen((prev) => !prev)}
              className={cn(
                "group flex w-full items-center justify-between rounded-2xl px-4 py-3 text-[14px] font-medium transition",
                isSettingsRoute
                  ? "bg-white/8 text-white shadow-inner ring-1 ring-white/5"
                  : "text-admin-text-soft hover:bg-white/5 hover:text-white"
              )}
            >
              <span className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5Z" />
                  <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6Z" />
                </svg>
                Paramètres
              </span>

              <svg
                viewBox="0 0 24 24"
                className={cn("h-4 w-4 transition-transform", settingsOpen && "rotate-180")}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {settingsOpen && (
              <div className="ml-6 space-y-1 border-l border-white/6 pl-3">
                <Link
                  to="/settings/rgpd"
                  className={cn(
                    "block rounded-xl px-3 py-2 text-sm transition",
                    location.pathname === "/settings/rgpd"
                      ? "bg-white/8 text-white"
                      : "text-admin-text-soft hover:bg-white/5 hover:text-white"
                  )}
                >
                  RGPD
                </Link>

                <Link
                  to="/settings/users"
                  className={cn(
                    "block rounded-xl px-3 py-2 text-sm transition",
                    location.pathname === "/settings/users"
                      ? "bg-white/8 text-white"
                      : "text-admin-text-soft hover:bg-white/5 hover:text-white"
                  )}
                >
                  Utilisateurs
                </Link>

                <Link
                  to="/settings/general"
                  className={cn(
                    "block rounded-xl px-3 py-2 text-sm transition",
                    location.pathname === "/settings/general"
                      ? "bg-white/8 text-white"
                      : "text-admin-text-soft hover:bg-white/5 hover:text-white"
                  )}
                >
                  Paramètre généraux
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>

      <div className="mt-auto px-5 pb-5">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[14px] font-medium text-admin-text-soft transition hover:bg-white/5 hover:text-white"
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
  );
}

const Sidebar = memo(SidebarComponent);
export default Sidebar;