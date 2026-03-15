import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const stats = [
  {
    label: "Demandes totales",
    value: "--",
    helper: "Compteur branché à l’API ensuite",
  },
  {
    label: "Non traitées",
    value: "--",
    helper: "Demandes à traiter",
  },
  {
    label: "En cours",
    value: "--",
    helper: "Traitement en cours",
  },
  {
    label: "Traitées",
    value: "--",
    helper: "Historique récent",
  },
];

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="overflow-hidden rounded-[28px] border border-admin-border bg-[linear-gradient(135deg,rgba(109,94,252,0.14),rgba(255,255,255,0.02)_40%,rgba(255,255,255,0.01))] p-8 shadow-xl shadow-black/20">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-admin-text-muted">
                Dashboard admin
              </p>
              <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-white">
                Vue d’ensemble de la messagerie et du suivi des demandes.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-admin-text-soft">
                Cette base reprend l’esprit du thème Tailwind sombre que tu as partagé :
                sidebar latérale, topbar flottante, grosses cartes de synthèse et contenu
                central très lisible.
              </p>
            </div>

            <div className="hidden shrink-0 rounded-[24px] border border-white/8 bg-white/[0.04] p-5 xl:block">
              <p className="text-sm text-admin-text-muted">Connecté en tant que</p>
              <p className="mt-3 text-lg font-semibold text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="mt-1 text-sm text-admin-text-soft">{user?.email}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/messages"
              className="rounded-2xl bg-admin-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-admin-accent/20 transition hover:brightness-110"
            >
              Ouvrir les demandes
            </Link>

            <button
              type="button"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-admin-text-soft transition hover:bg-white/[0.06] hover:text-white"
            >
              Export global
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-admin-border bg-white/[0.025] p-7 shadow-xl shadow-black/20">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-admin-text-muted">
            Session
          </p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg font-semibold text-white">
              MC
            </div>

            <div>
              <p className="text-lg font-semibold text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-admin-text-soft">{user?.email}</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/6 bg-admin-panel-3/60 p-4">
            <p className="text-sm text-admin-text-muted">État du dashboard</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-white">Session active</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-[24px] border border-admin-border bg-white/[0.025] p-6 shadow-lg shadow-black/10"
          >
            <p className="text-sm font-medium text-admin-text-muted">{stat.label}</p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-white">
              {stat.value}
            </p>
            <p className="mt-3 text-sm text-admin-text-soft">{stat.helper}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-dashed border-admin-border-strong bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-6 shadow-lg shadow-black/10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Zone principale</h2>
            <p className="mt-2 text-sm text-admin-text-soft">
              On pourra y injecter ensuite tes vraies cartes métiers, graphiques,
              compteurs et alertes.
            </p>
          </div>
        </div>

        <div className="mt-6 min-h-[420px] rounded-[24px] border border-dashed border-white/10 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.02),rgba(255,255,255,0.02)_8px,transparent_8px,transparent_16px)]" />
      </section>
    </div>
  );
}