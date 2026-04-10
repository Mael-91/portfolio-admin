import { useEffect, useState } from "react";
import { useMessageNotifications } from "../hooks/useMessageNotifications";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Switch } from "../components/ui/Switch";
import {
  fetchRgpdSettings,
  fetchRgpdStats,
  runRgpdPurgeNow,
  saveRgpdSettings,
} from "../services/rgpd";
//import { useToast } from "../hooks/useToast";

export function RGPDPage() {
  const [retentionDays, setRetentionDays] = useState(90);
  const [autoPurgeEnabled, setAutoPurgeEnabled] = useState(true);
  const [purgeHour, setPurgeHour] = useState("03:00");
  const [toDelete, setToDelete] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  //const [, setSuccessMessage] = useState("");
  const [nextDeletionDate, setNextDeletionDate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { refreshSignal } = useMessageNotifications();
  //const { showToast } = useToast();

  async function loadAll() {
    try {
      const [settingsData, statsData] = await Promise.all([
        fetchRgpdSettings(),
        fetchRgpdStats(retentionDays),
      ]);

      setRetentionDays(settingsData.settings.retentionDays);
      setAutoPurgeEnabled(settingsData.settings.autoPurgeEnabled);
      setPurgeHour(settingsData.settings.purgeHour);
      setToDelete(statsData.stats.toDelete);
      setNextDeletionDate(statsData.stats.nextDeletionDate);
    } catch (error) {
      console.error("Erreur chargement settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshStats(currentRetentionDays: number) {
    try {
      const data = await fetchRgpdStats(currentRetentionDays);
      setToDelete(data.stats.toDelete);
      setNextDeletionDate(data.stats.nextDeletionDate);
    } catch (error) {
      console.error("Erreur chargement stats RGPD:", error);
    }
  }

  async function saveSettings() {
    try {
      await saveRgpdSettings({
        retentionDays,
        autoPurgeEnabled,
        purgeHour,
      });

      await refreshStats(retentionDays);
    } catch (error) {
      console.error("Erreur sauvegarde des paramètres:", error);
    }
  }

  async function confirmPurge() {
    try {
      await runRgpdPurgeNow();
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
      refreshStats(retentionDays);
    }, 250);

    return () => clearTimeout(timeout);
  }, [retentionDays, purgeHour, loading]);

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
    return <div className="text-white">Chargement...</div>;
  }

  return (
    <div className="space-y-6 text-white">
      {(saving || saved) && (
        <div className="text-sm text-admin-text-soft">
          {saving && <span>Enregistrement...</span>}
          {!saving && saved && <span>✔ Paramètres sauvegardés</span>}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Paramètres RGPD
        </h1>
        <p className="mt-1 text-sm text-admin-text-soft">
          Gestion de la conservation et suppression des données
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-sm text-admin-text-soft">Messages à supprimer</p>
          <p className="mt-2 text-2xl font-semibold text-white">{toDelete}</p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-sm text-admin-text-soft">Durée</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {retentionDays} j
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-sm text-admin-text-soft">Statut</p>
          <p className={`mt-1 text-2xl font-semibold ${
              autoPurgeEnabled ? "text-green-400" : "text-orange-400"
            }`}
          >
            {autoPurgeEnabled ? "Actif" : "Off"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-sm text-admin-text-soft">
            Prochaine purge automatique
          </p>
          <p className="mt-1 text-sm">
            {toDelete === 0
              ? "Aucun message à supprimer"
              : nextDeletionDate
              ? new Date(nextDeletionDate).toLocaleString("fr-FR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Aucune donnée"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold text-white">Configuration</h2>

        <div className="mt-5 space-y-5">
          <div>
            <label className="text-sm text-admin-text-soft">
              Durée de conservation (jours)
            </label>
            <Input
              type="number"
              min={1}
              value={retentionDays}
              onChange={(e) => setRetentionDays(Number(e.target.value))}
              className="mt-1 bg-admin-panel-3/60 p-2"
            />
          </div>

          <div>
            <label className="text-sm text-admin-text-soft">
              Heure de purge (0 - 23)
            </label>
            <Input
              type="time"
              value={purgeHour}
              onChange={(e) => setPurgeHour(e.target.value)}
              className="mt-1 bg-admin-panel-3/60 p-2"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-admin-panel-3/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">
                Purge automatique
              </p>
              <p className="text-xs text-admin-text-soft">
                Active ou désactive l’exécution quotidienne
              </p>
            </div>

            <Switch
              checked={autoPurgeEnabled}
              onChange={setAutoPurgeEnabled}
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-6">
        <h2 className="text-lg font-semibold text-white">Action critique</h2>

        <Button
          variant="dangerSoft"
          onClick={() => setShowModal(true)}
          className="mt-3"
        >
          Purger maintenant
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-admin-panel p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">
              Confirmer la purge
            </h3>

            <p className="mt-3 text-sm text-admin-text-soft">
              {toDelete} messages seront définitivement supprimés.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                className="px-4 py-2"
              >
                Annuler
              </Button>

              <Button variant="dangerSoft" onClick={confirmPurge}>
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}