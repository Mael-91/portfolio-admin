import type { ReactNode } from "react";
import { useAccountAccess } from "../context/AccountAccessContext";
import { PAGE_PERMISSIONS } from "../router/page-access";

export function PageAccess({ path, children }: { path: string; children: ReactNode }) {
  const { hasPermission, isAdmin } = useAccountAccess();
  const permission = PAGE_PERMISSIONS[path];
  const allowed = path === "/settings/roles" ? isAdmin : permission && hasPermission(permission);
  if (allowed) return children;

  return (
    <section className="grid min-h-full place-items-center text-center text-white">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Accès refusé</h1>
        <p role="status" className="text-sm text-admin-text-soft">
          Vous n’avez pas la permission de consulter cette rubrique.
        </p>
      </div>
    </section>
  );
}
