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
import { Input } from "../components/ui/Input";
import { useToast } from "../hooks/useToast";

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
  const [, setErrorMessage] = useState("");
  const [, setSuccessMessage] = useState("");

  const [formMode, setFormMode] = useState<FormMode>("create");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [passwordReset, setPasswordReset] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();

  async function loadUsers() {
    setLoading(true);

    try {
      const response = await fetchAdminUsers();
      setUsers(response.users);
    } catch (error: any) {
      setErrorMessage(error?.message || "Erreur chargement utilisateurs");
      showToast({
        title: "Erreur",
        description: error?.message || "Erreur chargement utilisateurs",
        variant: "error",
      });
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
        showToast({
          title: "Utilisateur créé",
          description: "Le nouvel utilisateur a bien été créé.",
          variant: "success",
        });
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
        showToast({
          title: "Utilisateur mis à jour",
          description: "Les modifications ont bien été enregistrées.",
          variant: "success",
        });
      }

      resetForm();
      await loadUsers();
    } catch (error: any) {
      setErrorMessage(error?.message || "Erreur sauvegarde utilisateur");
      showToast({
        title: "Erreur",
        description: error?.message || "Erreur sauvegarde utilisateur",
        variant: "error",
      });
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
      showToast({
        title: user.isActive ? "Utilisateur désactivé" : "Utilisateur activé",
        description: `L'utilisateur a bien été ${
          user.isActive ? "désactivé" : "activé"
        }.`,
        variant: "success",
      });

      await loadUsers();
    } catch (error: any) {
      setErrorMessage(error?.message || "Erreur changement statut utilisateur");
      showToast({
        title: "Erreur",
        description: error?.message || "Erreur changement statut utilisateur",
        variant: "error",
      });
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
      showToast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a bien été supprimé.",
        variant: "success",
      });
      setDeleteTarget(null);

      if (selectedUserId === deleteTarget.id) {
        resetForm();
      }

      await loadUsers();
    } catch (error: any) {
      setErrorMessage(error?.message || "Erreur suppression utilisateur");
      showToast({
        title: "Erreur",
        description: error?.message || "Erreur suppression utilisateur",
        variant: "error",
      });
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
              <Button
                type="button"
                onClick={resetForm}
                className="text-admin-soft"
              >
                Annuler
              </Button>
            ) : null}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm text-admin-text-soft">
                Prénom
              </label>
              <Input 
                value={form.firstName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, firstName: e.target.value }))
                }
                className="px-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-admin-text-soft">
                Nom
              </label>
              <Input 
                value={form.lastName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, lastName: e.target.value }))
                }
                className="px-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-admin-text-soft">
                Email
              </label>
              <Input 
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="px-3 outline-none"
              />
            </div>

            {formMode === "create" ? (
              <div>
                <label className="mb-1 block text-sm text-admin-text-soft">
                  Mot de passe
                </label>
                <Input 
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="px-3 outline-none"
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
                <Input 
                  type="password"
                  value={passwordReset}
                  onChange={(e) => setPasswordReset(e.target.value)}
                  placeholder="Laisser vide pour ne pas changer"
                  className="px-3 outline-none placeholder:text-admin-text-muted"
                />
                <p className="mt-1 text-xs text-admin-text-muted">
                  12 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial.
                </p>
              </div>
            )}

            <Button type="submit" disabled={saving} className="w-full">
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