import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useToast } from "../hooks/useToast";
import { deleteRole, fetchRoles, saveRole, type Role } from "../services/roles";
import { PermissionCategory, RolePermissionSummary } from "../components/users/PermissionCategory";
import { DeleteRoleConfirmDialog } from "../components/users/DeleteRoleConfirmDialog";

export function RolesSettingsPage() {
  const { showToast } = useToast();
  const [catalog, setCatalog] = useState<Awaited<ReturnType<typeof fetchRoles>> | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "denied" | "error">("loading");
  const [editing, setEditing] = useState<Role | null>(null);
  const [code, setCode] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<Role | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetchRoles(signal);
      if (signal?.aborted) return;
      setCatalog(response);
      setState("ready");
    } catch (error) {
      if (signal?.aborted) return;
      setCatalog(null);
      if (error instanceof Error && "status" in error && error.status === 403) {
        setState("denied");
        return;
      }
      setState("error");
      showToast({ title: "Erreur", description: error instanceof Error ? error.message : "Chargement impossible.", variant: "error" });
    }
  }, [showToast]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  function edit(role: Role | null) {
    setEditing(role);
    setCode(role?.code ?? "");
    setPermissions(role?.permissions ?? []);
    setDeleting(null);
  }

  async function submit(action: () => Promise<unknown>, message: string, onError?: (message: string) => void) {
    setBusy(true);
    try {
      await action();
      edit(null);
      showToast({ title: message, variant: "success" });
      await load();
    } catch (error) {
      if (error instanceof Error && "status" in error && error.status === 403) {
        setCatalog(null);
        setState("denied");
        return;
      }
      const description = error instanceof Error ? error.message : "Opération impossible.";
      onError?.(description);
      showToast({ title: "Erreur", description, variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 text-white">
      <Link to="/settings/users" className="text-sm text-admin-text-soft hover:text-white">Retour aux utilisateurs</Link>
      <h1 className="text-2xl font-semibold tracking-tight">{state === "denied" ? "Accès refusé" : "Gestion des rôles"}</h1>
      {state === "denied" && <p role="status" className="text-sm text-admin-text-soft">Seuls les administrateurs peuvent gérer les rôles.</p>}
      {state === "loading" && <p role="status" className="text-sm text-admin-text-soft">Chargement...</p>}
      {state === "error" && <Button variant="secondary" onClick={() => void load()}>Réessayer</Button>}
      {state === "ready" && catalog && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <section className="min-w-0 space-y-3" aria-label="Rôles existants">
            {catalog.roles.map((role) => (
              <div key={role.id} className="space-y-3 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                <h2 className="break-all font-semibold">{role.code}</h2>
                <RolePermissionSummary categories={catalog.categories} selected={role.permissions} />
                {role.code === "admin" ? (
                  <p className="text-xs text-admin-text-muted">Rôle système immuable</p>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="secondary" disabled={busy} onClick={() => edit(role)}>Modifier</Button>
                    <Button size="sm" variant="dangerSoft" disabled={busy || role.inUse}
                      aria-describedby={role.inUse ? `role-in-use-${role.id}` : undefined}
                      onClick={() => {
                        setDeleteError(null);
                        setDeleting(role);
                      }}>
                      Supprimer
                    </Button>
                    {role.inUse && (
                      <p id={`role-in-use-${role.id}`} className="basis-full text-xs text-admin-text-muted">
                        Ce rôle est attribué à au moins un compte.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </section>
          <form className="min-w-0 space-y-4 self-start rounded-2xl border border-white/8 bg-white/[0.03] p-5" onSubmit={(event) => {
            event.preventDefault();
            void submit(() => saveRole(editing?.id ?? null, { code, permissions }), editing ? "Rôle mis à jour" : "Rôle créé");
          }}>
            <h2 className="text-lg font-semibold">{editing ? "Modifier le rôle" : "Créer un rôle"}</h2>
            <label className="block space-y-2 text-sm text-admin-text-soft">
              <span>Identifiant du rôle</span>
              <Input required maxLength={64} pattern="[a-z][a-z0-9_\\-]*" value={code} disabled={busy} onChange={(event) => setCode(event.target.value)} />
            </label>
            <p className="text-xs text-admin-text-muted">Commencez par une lettre minuscule. Lettres minuscules, chiffres, tirets et underscores sont acceptés.</p>
            <fieldset disabled={busy} className="space-y-2">
              <legend className="mb-2 text-sm font-semibold">Permissions</legend>
              <div className="space-y-3">
                {catalog.categories.map((category) => (
                  <PermissionCategory
                    key={category.id}
                    category={category}
                    selected={permissions}
                    onChange={setPermissions}
                  />
                ))}
              </div>
            </fieldset>
            {editing && <p className="text-sm text-admin-text-soft">Les permissions enregistrées s’appliquent à tous les comptes qui ont ce rôle.</p>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={busy}>Enregistrer</Button>
              {editing && <Button type="button" variant="secondary" disabled={busy} onClick={() => edit(null)}>Annuler</Button>}
            </div>
          </form>
          {deleting && deleting.code !== "admin" && !deleting.inUse && (
            <DeleteRoleConfirmDialog
              roleName={deleting.code}
              busy={busy}
              error={deleteError}
              onCancel={() => setDeleting(null)}
              onConfirm={() => {
                setDeleteError(null);
                void submit(() => deleteRole(deleting.id), "Rôle supprimé", setDeleteError);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
