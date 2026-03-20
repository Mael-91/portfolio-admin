export function UsersSettingsPage() {
  return (
    <div className="space-y-4 text-white">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Gestion des utilisateurs
        </h1>
        <p className="mt-1 text-sm text-admin-text-soft">
          Cette page permettra de gérer les utilisateurs du dashboard.
        </p>
      </div>

      <div className="rounded-2xl bg-white/[0.03] p-5 text-sm text-admin-text-soft">
        Fonctionnalité à venir :
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>liste des utilisateurs</li>
          <li>création d’un utilisateur</li>
          <li>édition</li>
          <li>activation / désactivation</li>
          <li>gestion du mot de passe</li>
        </ul>
      </div>
    </div>
  );
}