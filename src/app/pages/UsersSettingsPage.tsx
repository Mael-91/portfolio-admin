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
import { useFeedback } from "../hooks/useFeedback";
import { useFormValidation } from "../hooks/useFormValidation";
import { cn } from "../../lib/utils";
import { getInputFeedbackClasses } from "../../lib/feedbackStyles";

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

  const [formMode, setFormMode] = useState<FormMode>("create");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [passwordReset, setPasswordReset] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();
  const { feedbackState, setSuccess, setError, reset } = useFeedback();

  const {
    hasFieldError,
    submitValidation,
    resetValidation,
    touchField,
    hasAnyError,
  } = useFormValidation(
    {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      passwordReset,
    },
    {
      firstName: (value) => value.trim().length > 0,
      lastName: (value) => value.trim().length > 0,
      email: (value) => value.trim().length > 0,
      password: (value) =>
        formMode === "create" ? value.trim().length > 0 : true,
      passwordReset: () => true,
    }
  );

  async function loadUsers() {
    setLoading(true);
    reset();

    try {
      const response = await fetchAdminUsers();
      setUsers(response.users);
    } catch (error: any) {
      setError();
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
    resetValidation();
    reset();
  }

  function handleEditUser(user: AdminUser) {
    resetValidation();
    reset();

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
    reset();
    submitValidation();

    if (hasAnyError) {
      setError();
      showToast({
        title: "Erreur",
        description: "Veuillez renseigner les champs obligatoires.",
        variant: "error",
      });
      return;
    }

    setSaving(true);

    try {
      if (formMode === "create") {
        await createAdminUser(form);
        setSuccess();
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

        setSuccess();
        showToast({
          title: "Utilisateur mis à jour",
          description: "Les modifications ont bien été enregistrées.",
          variant: "success",
        });
      }

      resetForm();
      await loadUsers();
    } catch (error: any) {
      setError();
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
    reset();

    try {
      await updateAdminUserActiveStatus(user.id, {
        isActive: !user.isActive,
      });

      setSuccess();
      showToast({
        title: user.isActive ? "Utilisateur désactivé" : "Utilisateur activé",
        description: `L'utilisateur a bien été ${
          user.isActive ? "désactivé" : "activé"
        }.`,
        variant: "success",
      });

      await loadUsers();
    } catch (error: any) {
      setError();
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

    reset();
    setDeleting(true);

    try {
      await deleteAdminUser(deleteTarget.id);

      setSuccess();
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
      setError();
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
    <div className="space-y-8 text-white">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Gestion des utilisateurs
        </h1>
        <p className="text-sm text-admin-text-soft">
          Crée, modifie et active les comptes administrateurs du dashboard.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Utilisateurs existants
        </h2>

        {loading ? (
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 text-sm text-admin-text-soft">
            Chargement...
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 text-sm text-admin-text-soft">
            Aucun utilisateur trouvé.
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-base font-medium text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="mt-1 text-sm text-admin-text-soft">
                      {user.email}
                    </p>
                    <p className="mt-2 text-xs text-admin-text-muted">
                      Créé le {new Date(user.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        user.isActive
                          ? "bg-green-500/15 text-green-400"
                          : "bg-orange-500/15 text-orange-400"
                      }`}
                    >
                      {user.isActive ? "Actif" : "Inactif"}
                    </span>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      Modifier
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(user)}
                    >
                      {user.isActive ? "Désactiver" : "Activer"}
                    </Button>

                    <Button
                      variant="dangerSoft"
                      size="sm"
                      onClick={() => setDeleteTarget(user)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            <DeleteUserConfirmModal
              isOpen={!!deleteTarget}
              userLabel={
                deleteTarget
                  ? `${deleteTarget.firstName} ${deleteTarget.lastName}`
                  : undefined
              }
              onClose={() => setDeleteTarget(null)}
              onConfirm={handleDeleteUser}
              isSubmitting={deleting}
            />
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">
            {formMode === "create"
              ? "Créer un utilisateur"
              : "Modifier un utilisateur"}
          </h2>

          {formMode === "edit" ? (
            <Button variant="secondary" size="sm" onClick={resetForm}>
              Annuler
            </Button>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-white/8 bg-white/[0.03] p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-admin-text-soft">Prénom</label>
              <Input
                value={form.firstName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, firstName: e.target.value }))
                }
                onBlur={() => touchField("firstName")}
                className={cn(
                  "px-3 outline-none",
                  getInputFeedbackClasses(
                    feedbackState,
                    hasFieldError("firstName")
                  )
                )}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-admin-text-soft">Nom</label>
              <Input
                value={form.lastName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, lastName: e.target.value }))
                }
                onBlur={() => touchField("lastName")}
                className={cn(
                  "px-3 outline-none",
                  getInputFeedbackClasses(
                    feedbackState,
                    hasFieldError("lastName")
                  )
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-admin-text-soft">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              onBlur={() => touchField("email")}
              className={cn(
                "px-3 outline-none",
                getInputFeedbackClasses(feedbackState, hasFieldError("email"))
              )}
            />
          </div>

          {formMode === "create" ? (
            <div className="space-y-2">
              <label className="text-sm text-admin-text-soft">
                Mot de passe
              </label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                onBlur={() => touchField("password")}
                className={cn(
                  "px-3 outline-none",
                  getInputFeedbackClasses(
                    feedbackState,
                    hasFieldError("password")
                  )
                )}
              />
              <p className="text-xs text-admin-text-muted">
                12 caractères minimum, avec majuscule, minuscule, chiffre et
                caractère spécial.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm text-admin-text-soft">
                Nouveau mot de passe
              </label>
              <Input
                type="password"
                value={passwordReset}
                onChange={(e) => setPasswordReset(e.target.value)}
                onBlur={() => touchField("passwordReset")}
                placeholder="Laisser vide pour ne pas changer"
                className={cn(
                  "px-3 outline-none placeholder:text-admin-text-muted",
                  getInputFeedbackClasses(
                    feedbackState,
                    hasFieldError("passwordReset")
                  )
                )}
              />
              <p className="text-xs text-admin-text-muted">
                12 caractères minimum, avec majuscule, minuscule, chiffre et
                caractère spécial.
              </p>
            </div>
          )}

          <Button type="submit" disabled={saving}>
            {saving
              ? "Enregistrement..."
              : formMode === "create"
              ? "Créer l'utilisateur"
              : "Enregistrer les modifications"}
          </Button>
        </form>
      </section>
    </div>
  );
}