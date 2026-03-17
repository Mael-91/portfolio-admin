import { useEffect, useState } from "react";
import { env } from "../../env";

function getNextPurge(purgeHour: number) {
  const now = new Date();
  const next = new Date();

  next.setHours(purgeHour, 0, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  return next;
}

export function SettingsPage() {
  const [retentionDays, setRetentionDays] = useState(90);
  const [autoPurgeEnabled, setAutoPurgeEnabled] = useState(true);
  const [purgeHour, setPurgeHour] = useState(3);

  const [toDelete, setToDelete] = useState(0);

  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  async function loadAll() {
    try {
      const [settingsRes, statsRes] = await Promise.all([
        fetch(`${env.apiBaseUrl}/api/settings`, {
          credentials: "include",
        }),
        fetch(`${env.apiBaseUrl}/api/settings/rgpd-stats`, {
          credentials: "include",
        }),
      ]);

      const settingsText = await settingsRes.text();
      const statsText = await statsRes.text();

      let settings;
      let stats;

      try {
        settings = JSON.parse(settingsText);
        stats = JSON.parse(statsText);
      } catch {
        console.error("Réponse API invalide", {
          settingsText,
          statsText,
        });
        throw new Error("Réponse serveur invalide");
      }

      setRetentionDays(settings.settings.retentionDays);
      setAutoPurgeEnabled(settings.settings.autoPurgeEnabled);
      setPurgeHour(settings.settings.purgeHour);

      setToDelete(stats.stats.toDelete);
    } catch (error) {
      console.error("Erreur chargement settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    try {
      await fetch(`${env.apiBaseUrl}/api/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          retentionDays,
          autoPurgeEnabled,
          purgeHour,
        }),
      });

      setSuccessMessage("Paramètres sauvegardés");
    } catch (error) {
      console.error(error);
    }
  }

  async function purgeNow() {
    try {
      const res = await fetch(
        `${env.apiBaseUrl}/api/settings/purge-now`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();

      setSuccessMessage(`${data.deleted} messages supprimés`);

      // refresh stats
      loadAll();
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  if (loading) {
    return (
      <div className="text-admin-text-soft text-sm">
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">Paramètres RGPD</h1>
        <p className="text-sm text-admin-text-soft">
          Gestion de la conservation et suppression des données
        </p>
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white/[0.03] p-4">
          <p className="text-xs text-admin-text-muted uppercase">
            Messages à supprimer
          </p>
          <p className="mt-1 text-2xl font-semibold text-red-400">
            {toDelete}
          </p>
        </div>

        <div className="rounded-2xl bg-white/[0.03] p-4">
          <p className="text-xs text-admin-text-muted uppercase">
            Durée conservation
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {retentionDays} j
          </p>
        </div>

        <div className="rounded-2xl bg-white/[0.03] p-4">
          <p className="text-xs text-admin-text-muted uppercase">
            Statut RGPD
          </p>
          <p
            className={`mt-1 text-2xl font-semibold ${
              autoPurgeEnabled ? "text-green-400" : "text-orange-400"
            }`}
          >
            {autoPurgeEnabled ? "Actif" : "Off"}
          </p>
        </div>

        <div className="rounded-2xl bg-white/[0.03] p-4">
          <p className="text-xs text-admin-text-muted uppercase">
            Prochaine purge
          </p>
          <p className="mt-1 text-sm font-semibold">
            {getNextPurge(purgeHour).toLocaleString()}
          </p>
        </div>
      </div>

      {/* CONFIG */}
      <div className="rounded-2xl bg-white/[0.03] p-5 space-y-4">
        <h2 className="text-sm font-semibold">Configuration</h2>

        <div>
          <label className="text-sm text-admin-text-soft">
            Durée de conservation (jours)
          </label>
          <input
            type="number"
            value={retentionDays}
            onChange={(e) =>
              setRetentionDays(Number(e.target.value))
            }
            className="mt-1 w-full rounded-xl bg-admin-panel-3/60 p-2"
          />
        </div>

        <div>
          <label className="text-sm text-admin-text-soft">
            Heure de purge (0 - 23)
          </label>
          <input
            type="number"
            min={0}
            max={23}
            value={purgeHour}
            onChange={(e) =>
              setPurgeHour(Number(e.target.value))
            }
            className="mt-1 w-full rounded-xl bg-admin-panel-3/60 p-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoPurgeEnabled}
            onChange={(e) =>
              setAutoPurgeEnabled(e.target.checked)
            }
          />
          <span className="text-sm">
            Activer la purge automatique
          </span>
        </div>

        <button
          onClick={saveSettings}
          className="rounded-xl bg-admin-accent px-4 py-2 text-sm"
        >
          Sauvegarder
        </button>
      </div>

      {/* ACTION */}
      <div className="rounded-2xl bg-red-500/10 p-5">
        <h2 className="text-sm font-semibold text-red-400">
          Action critique
        </h2>

        <p className="text-sm text-admin-text-soft">
          Cette action supprimera définitivement les données concernées.
        </p>

        <button
          onClick={purgeNow}
          className="mt-3 rounded-xl bg-red-500 px-4 py-2 text-sm"
        >
          Purger maintenant
        </button>
      </div>

      {/* SUCCESS */}
      {successMessage && (
        <div className="rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {successMessage}
        </div>
      )}
    </div>
  );
}