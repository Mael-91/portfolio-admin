import { useEffect, useState } from "react";
import { RolePicker } from "../components/users/RolePicker";
import { fetchRoles, type RoleOption } from "../services/roles";
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
import { getMe } from "../services/auth";

type FormMode = "create" | "edit";

const emptyForm = {
  email: "",
  firstName: "",
  lastName: "",
  password: "",
};

export function UsersSettingsPage() {
  const [access, setAccess] = useState<"loading" | "allowed" | "denied" | "error">("loading");
  const { showToast } = useToast();
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getMe>> | null>(null);
  const [profileVersion, setProfileVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      try {
        const profile = await getMe();
        if (!cancelled) {
          setProfile(profile);
          setAccess(profile.permissions?.includes("users.read") ? "allowed" : "denied");
        }
      } catch (error) {
        if (cancelled) return;
        setAccess("error");
        showToast({
          title: "Erreur",
          description: error instanceof Error ? error.message : "Erreur chargement du profil",
          variant: "error",
        });
      }
    }

    void checkAccess();
    return () => {
      cancelled = true;
    };
  }, [profileVersion, showToast]);

  if (access === "allowed" && profile) {
    return (
      <UsersSettingsContent
        profile={profile}
        onAccessDenied={() => setAccess("denied")}
        onOwnRolesChanged={() => {
          setAccess("loading");
          setProfileVersion((version) => version + 1);
        }}
      />
    );
  }

  if (access === "denied") {
    return (
      <section className="grid min-h-full place-items-center text-center text-white">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Accès refusé</h1>
          <p className="text-sm text-admin-text-soft" role="status">
            Vous n’avez pas la permission de consulter les utilisateurs.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-2 text-white">
      <h1 className="text-2xl font-semibold tracking-tight">
        Gestion des utilisateurs
      </h1>
      <p className="text-sm text-admin-text-soft" role="status">
        {access === "loading" ? "Chargement..." : "Impossible de vérifier vos droits d’accès."}
      </p>
    </section>
  );
}

function UsersSettingsContent({ profile, onAccessDenied, onOwnRolesChanged }: {
  profile: Awaited<ReturnType<typeof getMe>>;
  onAccessDenied: () => void;
  onOwnRolesChanged: () => void;
}) {
  const isAdmin = profile.roles?.includes("admin") ?? false;
  const canCreate = profile.permissions?.includes("users.create") ?? false;
  const canUpdate = profile.permissions?.includes("users.update") ?? false;
  const canReset = profile.permissions?.includes("users.reset_password") ?? false;
  const canToggle = profile.permissions?.includes("users.set_active") ?? false;
  const canDelete = profile.permissions?.includes("users.delete") ?? false;
  const [roleOptions, setRoleOptions] = useState<RoleOption[] | null>(null);
  const [roleLoadFailed, setRoleLoadFailed] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [initialRoles, setInitialRoles] = useState<string[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { setSuccess, setError, reset } = useFeedback();

  const [formMode, setFormMode] = useState<FormMode>("create");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [passwordReset, setPasswordReset] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();

  const {
    submitValidation,
    resetValidation,
    touchField,
    hasAnyError,
  } = useFormValidation(
    {
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,
      password: form.password,
      passwordReset,
    },
    {
      email: (value) => value.trim().length > 0,
      firstName: (value) => value.trim().length > 0,
      lastName: (value) => value.trim().length > 0,
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
      if (error?.status === 403) {
        setUsers([]);
        onAccessDenied();
        return;
      }
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

  useEffect(() => {
    if (!isAdmin) return;
    const controller = new AbortController();
    fetchRoles(controller.signal)
      .then(({ roles }) => setRoleOptions(roles))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setRoleLoadFailed(true);
        showToast({
          title: "Erreur",
          description: error instanceof Error ? error.message : "Impossible de charger les rôles.",
          variant: "error",
        });
      });
    return () => controller.abort();
  }, [isAdmin, showToast]);

  function resetForm() {
    setFormMode("create");
    setSelectedUserId(null);
    setForm(emptyForm);
    setSelectedRoles([]);
    setInitialRoles([]);
    setPasswordReset("");
    resetValidation();
    reset();
  }

  function handleEditUser(user: AdminUser) {
    resetValidation();
    reset();

    const roles = user.roles.map(({ id }) => id);
    setSelectedRoles(roles);
    setInitialRoles(roles);
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
      const rolesChanged = selectedRoles.length !== initialRoles.length ||
        selectedRoles.some((id) => !initialRoles.includes(id));
      const roleIds = isAdmin && roleOptions && rolesChanged ? selectedRoles : undefined;
      if (formMode === "create") {
        await createAdminUser({ ...form, roleIds });
        setSuccess();
        showToast({
          title: "Utilisateur créé",
          description: "Le nouvel utilisateur a bien été créé.",
          variant: "success",
        });
      } else if (selectedUserId) {
        const password = canReset && passwordReset.trim() ? passwordReset : undefined;
        if (canUpdate) {
          await updateAdminUser(selectedUserId, {
            email: form.email,
            firstName: form.firstName,
            lastName: form.lastName,
            roleIds,
            password,
          });
        } else if (password) {
          await updateAdminUserPassword(selectedUserId, { password });
        } else {
          return;
        }

        setSuccess();
        showToast({
          title: "Utilisateur mis à jour",
          description: "Les modifications ont bien été enregistrées.",
          variant: "success",
        });
        if (roleIds && selectedUserId === profile.user.id) {
          onOwnRolesChanged();
          return;
        }
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
    reset();

    if (!deleteTarget) {
      return;
    }

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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
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
              {users.map((user) => {
                const canManageTarget = isAdmin || !user.roles.some(({ code }) => code === "admin");
                return (
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
                          Créé le{" "}
                          {new Date(user.createdAt).toLocaleString("fr-FR")}
                        </p>
                        <p className="mt-1 break-words text-xs text-admin-text-muted">
                          {user.roles.length ? user.roles.map(({ code }) => code).join(", ") : "Aucun rôle"}
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

                        {canManageTarget && (canUpdate || canReset) && <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          Modifier
                        </Button>}

                        {canManageTarget && canToggle && <Button
                          variant="secondary" size="sm"
                          disabled={user.id === profile.user.id}
                          onClick={() => handleToggleActive(user)}
                        >
                          {user.isActive ? "Désactiver" : "Activer"}
                        </Button>}

                        {canManageTarget && canDelete && user.id !== profile.user.id && <Button
                          variant="dangerSoft"
                          size="sm"
                          onClick={() => setDeleteTarget(user)}
                        >
                          Supprimer
                        </Button>}
                      </div>
                    </div>
                  </div>
                );
              })}

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

        {(canCreate || formMode === "edit") && <section className="min-w-0 space-y-4">
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
            <fieldset disabled={formMode === "edit" && !canUpdate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-admin-text-soft">Prénom</label>
                  <Input
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    onBlur={() => touchField("firstName")}
                    className="px-3 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-admin-text-soft">Nom</label>
                  <Input
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    onBlur={() => touchField("lastName")}
                    className="px-3 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-admin-text-soft">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  onBlur={() => touchField("email")}
                  className="px-3 outline-none"
                />
              </div>

              {isAdmin && (
                roleOptions ? (
                  <RolePicker roles={roleOptions} selected={selectedRoles} onChange={setSelectedRoles} />
                ) : (
                  <p role="status" className="text-sm text-admin-text-soft">
                    {roleLoadFailed ? "Rôles indisponibles. Rouvrez la rubrique pour réessayer." : "Chargement des rôles..."}
                  </p>
                )
              )}
            </fieldset>

            {formMode === "create" ? (
              <div className="space-y-2">
                <label className="text-sm text-admin-text-soft">
                  Mot de passe
                </label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  onBlur={() => touchField("password")}
                  className="px-3 outline-none"
                />
                <p className="text-xs text-admin-text-muted">
                  12 caractères minimum, avec majuscule, minuscule, chiffre et
                  caractère spécial.
                </p>
              </div>
            ) : canReset && (
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
                  className="px-3 outline-none placeholder:text-admin-text-muted"
                />
                <p className="text-xs text-admin-text-muted">
                  12 caractères minimum, avec majuscule, minuscule, chiffre et
                  caractère spécial.
                </p>
              </div>
            )}

            <Button type="submit" disabled={saving || (formMode === "edit" && !canUpdate && !passwordReset.trim())} className="w-full">
              {saving
                ? "Enregistrement..."
                : formMode === "create"
                ? "Créer l'utilisateur"
                : "Enregistrer les modifications"}
            </Button>
          </form>
        </section>}
      </div>
    </div>
  );
}
