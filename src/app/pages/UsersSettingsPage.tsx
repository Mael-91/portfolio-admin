import { useEffect, useState } from "react";
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  updateAdminUser,
  updateAdminUserActiveStatus,
  updateAdminUserPassword,
  type AdminUser,
} from "../services/users";
import { DeleteUserConfirmModal } from "../components/users/DeleteUserConfirmModal";
import { Button } from "../components/ui/Button";

type FormMode = "create" | "edit";

const emptyForm = {
  email: "",
  firstName: "",
  lastName: "",
  password: "",
};

export function UsersSettingsPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formMode, setFormMode] = useState<FormMode>("create");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [passwordReset, setPasswordReset] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadUsers() {
    setLoading(true);

    try {
      const response = await fetchAdminUsers();
      setUsers(response.users);
    } catch (error: any) {
      setErrorMessage(error?.message || "Erreur chargement utilisateurs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function resetForm() {
    setFormMode("create");
    setSelectedUserId(null);
    setForm(emptyForm);
    setPasswordReset("");
  }

  function handleEditUser(user: AdminUser) {
    setFormMode("edit");
    setSelectedUserId(user.id);
    setForm({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: "",
    });
    setPasswordReset("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (formMode === "create") {
        await createAdminUser(form);
        setSuccessMessage("Utilisateur créé");
      } else if (selectedUserId) {
        await updateAdminUser(selectedUserId, {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
        });

        if (passwordReset.trim()) {
          await updateAdminUserPassword(selectedUserId, {
            password: passwordReset,
          });
        }

        setSuccessMessage("Utilisateur mis à jour");
      }

      resetForm();
      await loadUsers();
    } catch (error: any) {
      setErrorMessage(error?.message || "Erreur sauvegarde utilisateur");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(user: AdminUser) {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await updateAdminUserActiveStatus(user.id, {
        isActive: !user.isActive,
      });

      setSuccessMessage(
        user.isActive ? "Utilisateur désactivé" : "Utilisateur activé"
      );

      await loadUsers();
    } catch (error: any) {
      setErrorMessage(error?.message || "Erreur changement statut utilisateur");
    }
  }

  async function handleDeleteUser() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await deleteAdminUser(deleteTarget.id);
      setSuccessMessage("Utilisateur supprimé");
      setDeleteTarget(null);

      if (selectedUserId === deleteTarget.id) {
        resetForm();
      }

      await loadUsers();
    } catch (error: any) {
      setErrorMessage(error?.message || "Erreur suppression utilisateur");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6 text-white">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Gestion des utilisateurs
        </h1>
        <p className="mt-1 text-sm text-admin-text-soft">
          Crée, modifie et active les comptes administrateurs du dashboard.
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {successMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-2xl bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Utilisateurs existants</h2>
          </div>

          {loading ? (
            <div className="text-sm text-admin-text-soft">Chargement...</div>
          ) : users.length === 0 ? (
            <div className="text-sm text-admin-text-soft">
              Aucun utilisateur trouvé.
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="rounded-2xl border border-white/8 bg-white/[0.02] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium text-white">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="mt-1 text-sm text-admin-text-soft">
                        {user.email}
                      </div>
                      <div className="mt-2 text-xs text-admin-text-muted">
                        Créé le{" "}
                        {new Date(user.createdAt).toLocaleString("fr-FR")}
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                        user.isActive
                          ? "bg-green-500/15 text-green-400"
                          : "bg-orange-500/15 text-orange-400"
                      }`}
                    >
                      {user.isActive ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="secondary" size="md" onClick={() => handleEditUser(user)}>
                      Modifier
                    </Button>
                    <Button variant="secondary" size="md" onClick={() => handleToggleActive(user)}>
                      {user.isActive ? "Désactiver" : "Activer"}
                    </Button>
                    <Button variant="dangerSoft" size="md" onClick={() => setDeleteTarget(user)}>
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
              <DeleteUserConfirmModal
                isOpen={Boolean(deleteTarget)}
                userLabel={
                  deleteTarget ? `${deleteTarget.firstName} ${deleteTarget.lastName}` : undefined
                }
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteUser}
                isSubmitting={deleting}
              />
            </div>
          )}
        </section>

        <aside className="rounded-2xl bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {formMode === "create"
                ? "Créer un utilisateur"
                : "Modifier un utilisateur"}
            </h2>

            {formMode === "edit" ? (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-admin-text-soft transition hover:text-white"
              >
                Annuler
              </button>
            ) : null}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm text-admin-text-soft">
                Prénom
              </label>
              <input
                value={form.firstName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, firstName: e.target.value }))
                }
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-white/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-admin-text-soft">
                Nom
              </label>
              <input
                value={form.lastName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, lastName: e.target.value }))
                }
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-white/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-admin-text-soft">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-white/20"
              />
            </div>

            {formMode === "create" ? (
              <div>
                <label className="mb-1 block text-sm text-admin-text-soft">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-white/20"
                />
                <p className="mt-1 text-xs text-admin-text-muted">
                  12 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial.
                </p>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-sm text-admin-text-soft">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwordReset}
                  onChange={(e) => setPasswordReset(e.target.value)}
                  placeholder="Laisser vide pour ne pas changer"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none placeholder:text-admin-text-muted focus:border-white/20"
                />
                <p className="mt-1 text-xs text-admin-text-muted">
                  12 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial.
                </p>
              </div>
            )}

            <Button variant="primary" size="md" type="submit" disabled={saving} className="w-full">
              {saving
                ? "Enregistrement..."
                : formMode === "create"
                ? "Créer l'utilisateur"
                : "Enregistrer les modifications"}
            </Button>
          </form>
        </aside>
      </div>
    </div>
  );
}