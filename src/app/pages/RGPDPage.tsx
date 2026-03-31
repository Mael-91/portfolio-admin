import { useEffect, useState } from "react";
import { env } from "../../env";
import { useMessageNotifications } from "../hooks/useMessageNotifications";
import { Button } from "../components/ui/Button";

export function RGPDPage() {
  const [retentionDays, setRetentionDays] = useState(90);
  const [autoPurgeEnabled, setAutoPurgeEnabled] = useState(true);
  const [purgeHour, setPurgeHour] = useState("03:00");

  const [toDelete, setToDelete] = useState(0);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [nextDeletionDate, setNextDeletionDate] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { refreshSignal } = useMessageNotifications();

  async function loadAll() {
    try {
      const [settingsRes, statsRes] = await Promise.all([
        fetch(`${env.apiBaseUrl}/api/settings/rgpd`, {
          credentials: "include",
        }),
        fetch(
          `${env.apiBaseUrl}/api/settings/rgpd/rgpd-stats?retentionDays=${retentionDays}`,
          {
            credentials: "include",
          }
        ),
      ]);

      const settings = await settingsRes.json();
      const stats = await statsRes.json();

      setRetentionDays(settings.settings.retentionDays);
      setAutoPurgeEnabled(settings.settings.autoPurgeEnabled);
      setPurgeHour(settings.settings.purgeHour);
      setToDelete(stats.stats.toDelete);
      setNextDeletionDate(stats.stats.nextDeletionDate);
    } catch (error) {
      console.error("Erreur chargement settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshStats(currentRetentionDays: number) {
    try {
      const res = await fetch(
        `${env.apiBaseUrl}/api/settings/rgpd/rgpd-stats?retentionDays=${currentRetentionDays}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();
      setToDelete(data.stats.toDelete);
      setNextDeletionDate(data.stats.nextDeletionDate);
    } catch (error) {
      console.error("Erreur chargement stats RGPD:", error);
    }
  }

  async function saveSettings() {
    try {
      await fetch(`${env.apiBaseUrl}/api/settings/rgpd`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          retentionDays,
          autoPurgeEnabled,
          purgeHour,
        }),
      });
    } catch (error) {
      console.error("Erreur sauvegarde settings:", error);
    }
  }

  async function confirmPurge() {
    try {
      const res = await fetch(`${env.apiBaseUrl}/api/settings/rgpd/purge-now`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      setSuccessMessage(`${data.deleted} messages supprimés`);
      setShowModal(false);

      await refreshStats(retentionDays);
    } catch (error) {
      console.error("Erreur purge:", error);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (loading) return;

    const timeout = setTimeout(() => {
      saveSettings();
    }, 600);

    return () => clearTimeout(timeout);
  }, [retentionDays, autoPurgeEnabled, purgeHour, loading]);

  useEffect(() => {
    if (loading) return;

    const timeout = setTimeout(() => {
      refreshStats(retentionDays);
    }, 250);

    return () => clearTimeout(timeout);
  }, [retentionDays, loading]);

  useEffect(() => {
    if (loading) return;

    setSaving(true);
    setSaved(false);

    const timeout = setTimeout(async () => {
      await saveSettings();

      setSaving(false);
      setSaved(true);

      setTimeout(() => setSaved(false), 2000);
    }, 600);

    return () => clearTimeout(timeout);
  }, [retentionDays, autoPurgeEnabled, purgeHour]);

  useEffect(() => {
    if (refreshSignal === 0) return;

    loadAll();
  }, [refreshSignal]);

  if (loading) {
    return <div className="text-sm text-admin-text-soft">Chargement...</div>;
  }

  return (
    <div className="space-y-6 text-white">
      <div className="h-6">
        {saving && (
          <span className="text-xs text-blue-400 animate-pulse">
            Enregistrement...
          </span>
        )}

        {!saving && saved && (
          <span className="text-xs text-green-400">
            ✔ Paramètres sauvegardés
          </span>
        )}
      </div>
      <div>
        <h1 className="text-xl font-semibold">Paramètres RGPD</h1>
        <p className="text-sm text-admin-text-soft">
          Gestion de la conservation et suppression des données
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white/[0.03] p-4">
          <p className="text-xs uppercase text-admin-text-muted">
            Messages à supprimer
          </p>
          <p className="mt-1 text-2xl font-semibold text-red-400">{toDelete}</p>
        </div>

        <div className="rounded-2xl bg-white/[0.03] p-4">
          <p className="text-xs uppercase text-admin-text-muted">Durée</p>
          <p className="mt-1 text-2xl font-semibold">{retentionDays} j</p>
        </div>

        <div className="rounded-2xl bg-white/[0.03] p-4">
          <p className="text-xs uppercase text-admin-text-muted">Statut</p>
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
            Prochaine purge automatique
          </p>
          <p className="mt-1 text-sm font-semibold">
            {nextDeletionDate
              ? new Date(nextDeletionDate).toLocaleString()
              : "Aucune donnée"}
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold">Configuration</h2>

        <div>
          <label className="text-sm text-admin-text-soft">
            Durée de conservation (jours)
          </label>
          <input
            type="number"
            min={1}
            value={retentionDays}
            onChange={(e) => setRetentionDays(Number(e.target.value))}
            className="mt-1 w-full rounded-xl bg-admin-panel-3/60 p-2"
          />
        </div>

        <div>
          <label className="text-sm text-admin-text-soft">
            Heure de purge (0 - 23)
          </label>
          <input
            type="time"
            value={purgeHour}
            onChange={(e) => setPurgeHour(e.target.value)}
            className="mt-1 w-full rounded-xl bg-admin-panel-3/60 p-2"
          />
        </div>

        <div className="flex items-center justify-between rounded-xl bg-admin-panel-3/40 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-white">Purge automatique</p>
            <p className="text-xs text-admin-text-soft">
              Active ou désactive l’exécution quotidienne
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={autoPurgeEnabled}
            onClick={() => setAutoPurgeEnabled((prev) => !prev)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
              autoPurgeEnabled ? "bg-admin-accent" : "bg-white/15"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                autoPurgeEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-red-500/10 p-5">
        <h2 className="text-sm font-semibold text-red-400">Action critique</h2>

        <Button variant="danger" size="md" onClick={() => setShowModal(true)}>Purger maintenant</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-admin-panel-2 p-6">
            <h3 className="text-lg font-semibold text-white">
              Confirmer la purge
            </h3>

            <p className="mt-2 text-sm text-admin-text-soft">
              {toDelete} messages seront définitivement supprimés.
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl bg-white/10 px-4 py-2 text-sm"
              >
                Annuler
              </button>

              <button
                onClick={confirmPurge}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {successMessage}
        </div>
      )}
    </div>
  );
}