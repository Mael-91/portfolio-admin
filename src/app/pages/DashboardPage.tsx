import { useAuth } from "../hooks/useAuth";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-2 text-sm font-medium text-slate-500">
            Utilisateur connecté
          </h2>

          <p className="text-lg font-semibold text-slate-900">
            {user?.firstName} {user?.lastName}
          </p>

          <p className="text-sm text-slate-600">
            {user?.email}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-2 text-sm font-medium text-slate-500">
            Demandes de contact
          </h2>

          <p className="text-3xl font-bold text-slate-900">
            --
          </p>

          <p className="text-sm text-slate-600">
            Nombre total de demandes
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-2 text-sm font-medium text-slate-500">
            Messages non traités
          </h2>

          <p className="text-3xl font-bold text-slate-900">
            --
          </p>

          <p className="text-sm text-slate-600">
            À traiter
          </p>
        </div>

      </div>
    </div>
  );
}