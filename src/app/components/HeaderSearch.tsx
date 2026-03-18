import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

export default function HeaderSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");

  // 🔁 Sync avec URL
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setSearch(urlSearch);
  }, [location.search]);

  // 🔥 Debounce recherche globale
  useEffect(() => {
    const timeout = setTimeout(() => {
      const trimmed = search.trim();

      const params = new URLSearchParams();

      if (trimmed) {
        params.set("search", trimmed);
        params.set("page", "1");
      }

      // ✅ CAS 1 : recherche active → redirection ou update
      if (trimmed) {
        if (location.pathname !== "/messages") {
          navigate({
            pathname: "/messages",
            search: `?${params.toString()}`,
          });
        } else {
          setSearchParams(params, { replace: true });
        }

        return;
      }

      // ✅ CAS 2 : recherche vide → on nettoie seulement SI on est sur messages
      if (location.pathname === "/messages") {
        setSearchParams({}, { replace: true });
      }

    }, 200);

    return () => clearTimeout(timeout);
  }, [search, location.pathname]);

  return (
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
        {search && (<button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/50 hover:text-white">✕</button>)}
    </div>
  );
}