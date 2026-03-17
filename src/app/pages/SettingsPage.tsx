import { useEffect, useState } from "react";

export function SettingsPage() {
  const [retentionDays, setRetentionDays] = useState(90);
  const [autoPurgeEnabled, setAutoPurgeEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");

  async function loadSettings() {
    const res = await fetch(
      `${import.meta.env.VITE_ADMIN_API_URL}/api/settings`,
      { credentials: "include" }
    );

    const data = await res.json();

    setRetentionDays(data.settings.retentionDays);
    setAutoPurgeEnabled(data.settings.autoPurgeEnabled);
    setLoading(false);
  }

  async function saveSettings() {
    await fetch(
      `${import.meta.env.VITE_ADMIN_API_URL}/api/settings`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          retentionDays,
          autoPurgeEnabled,
        }),
      }
    );

    setSuccess("Paramètres sauvegardés");
  }

  async function purgeNow() {
    const res = await fetch(
      `${import.meta.env.VITE_ADMIN_API_URL}/api/settings/purge-now`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await res.json();

    setSuccess(`${data.deleted} messages supprimés`);
  }

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) return <div className="text-white">Chargement...</div>;

  return (
    <div className="max-w-xl space-y-6 text-white">
      <h1 className="text-xl font-semibold">Paramètres RGPD</h1>

      <div className="space-y-4">
        <div>
          <label>Durée de conservation (jours)</label>
          <input
            type="number"
            value={retentionDays}
            onChange={(e) => setRetentionDays(Number(e.target.value))}
            className="w-full rounded bg-white/10 p-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoPurgeEnabled}
            onChange={(e) => setAutoPurgeEnabled(e.target.checked)}
          />
          <span>Activer la purge automatique</span>
        </div>

        <button
          onClick={saveSettings}
          className="rounded bg-blue-500 px-4 py-2"
        >
          Sauvegarder
        </button>

        <button
          onClick={purgeNow}
          className="rounded bg-red-500 px-4 py-2"
        >
          Purger maintenant
        </button>

        {success && (
          <div className="text-green-400 text-sm">{success}</div>
        )}
      </div>
    </div>
  );
}