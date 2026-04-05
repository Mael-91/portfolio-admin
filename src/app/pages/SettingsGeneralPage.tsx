import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Textarea } from "../components/ui/Input";
import { Switch } from "../components/ui/Switch";
import {
  fetchSettingsGeneral,
  saveSettingsGeneral,
  uploadGeneralLogo,
} from "../services/settingsGeneral";
import { useToast } from "../hooks/useToast";
import { env } from "../../env";
import { useGeneralSettings } from "../context/GeneralSettingsContext";

type GeneralSettingsForm = {
  siteName: string;
  siteDescription: string;
  siteLogoUrl: string;
  siteSidebarLogoUrl: string;
};

type StorageUsage = {
  portfolioImagesSize: number;
  legalArchivesSize: number;
  logosSize: number;
  totalSize: number;
};

const emptyForm: GeneralSettingsForm = {
  siteName: "",
  siteDescription: "",
  siteLogoUrl: "",
  siteSidebarLogoUrl: "",
};

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 o";

  const units = ["o", "Ko", "Mo", "Go", "To"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** index;

  return `${value.toFixed(value >= 100 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function resolveAssetUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${env.apiBaseUrl}${url}`;
}

export function SettingsGeneralPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<GeneralSettingsForm>(emptyForm);
  const [storage, setStorage] = useState<StorageUsage>({
    portfolioImagesSize: 0,
    legalArchivesSize: 0,
    logosSize: 0,
    totalSize: 0,
  });

  const [isUploadingSiteLogo, setIsUploadingSiteLogo] = useState(false);
  const [isUploadingSidebarLogo, setIsUploadingSidebarLogo] = useState(false);

  const [showPreviews, setShowPreviews] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const { refreshSettings } = useGeneralSettings();

  async function loadData() {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchSettingsGeneral();

      setForm({
        siteName: data.settings.siteName ?? "",
        siteDescription: data.settings.siteDescription ?? "",
        siteLogoUrl: data.settings.siteLogoUrl ?? "",
        siteSidebarLogoUrl: data.settings.siteSidebarLogoUrl ?? "",
      });

      setStorage({
        portfolioImagesSize: data.storage.portfolioImagesSize ?? 0,
        legalArchivesSize: data.storage.legalArchivesSize ?? 0,
        logosSize: data.storage.logosSize ?? 0,
        totalSize: data.storage.totalSize ?? 0,
      });
    } catch (error: any) {
      setErrorMessage(
        error?.message || "Erreur lors du chargement des paramètres généraux."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSave() {
    setSaving(true);
    setErrorMessage("");

    try {
      await saveSettingsGeneral(form);
      await refreshSettings();

      showToast({
        title: "Paramètres enregistrés",
        description: "Les paramètres généraux ont bien été mis à jour.",
        variant: "success",
      });

      await loadData();
    } catch (error: any) {
      const message =
        error?.message ||
        "Impossible d’enregistrer les paramètres généraux.";

      setErrorMessage(message);

      showToast({
        title: "Erreur",
        description: message,
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadLogo(
    file: File | null,
    target: "siteLogoUrl" | "siteSidebarLogoUrl"
  ) {
    if (!file) return;

    const setUploading =
      target === "siteLogoUrl"
        ? setIsUploadingSiteLogo
        : setIsUploadingSidebarLogo;

    setUploading(true);
    setErrorMessage("");

    try {
      const data = await uploadGeneralLogo(file);
      await refreshSettings();

      setForm((prev) => ({
        ...prev,
        [target]: data.fileUrl,
      }));

      showToast({
        title: "Logo téléversé",
        description: "Le logo a bien été ajouté.",
        variant: "success",
      });
    } catch (error: any) {
      const message = error?.message || "Erreur lors du téléversement du logo.";

      setErrorMessage(message);

      showToast({
        title: "Erreur",
        description: message,
        variant: "error",
      });
    } finally {
      setUploading(false);
    }
  }

  const siteLogoPreview = useMemo(
    () => resolveAssetUrl(form.siteLogoUrl),
    [form.siteLogoUrl]
  );

  const sidebarLogoPreview = useMemo(
    () => resolveAssetUrl(form.siteSidebarLogoUrl),
    [form.siteSidebarLogoUrl]
  );

  if (loading) {
    return (
      <div className="space-y-6 text-white">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Paramètres généraux
          </h1>
          <p className="mt-1 text-sm text-admin-text-soft">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Paramètres généraux
          </h1>
          <p className="mt-1 text-sm text-admin-text-soft">
            Gère l’identité visuelle et les paramètres globaux du site.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleSave}
          isLoading={saving}
          disabled={saving}
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

      {errorMessage ? (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Identité du site
                </h2>
                <p className="mt-1 text-sm text-admin-text-soft">
                  Nom, description et branding principal.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-admin-text-soft">
                  Nom du site
                </label>
                <Input
                  value={form.siteName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, siteName: e.target.value }))
                  }
                  placeholder="Mael Constantin"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-admin-text-soft">
                  Description
                </label>
                <Textarea
                  rows={5}
                  value={form.siteDescription}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      siteDescription: e.target.value,
                    }))
                  }
                  placeholder="Description du site"
                />
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-white">Logos</h2>
                <p className="mt-1 text-sm text-admin-text-soft">
                  Téléverse le logo principal du site et celui de la sidebar.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="text-sm text-admin-text-soft">
                    Logo du site
                  </label>

                  <Input
                    value={form.siteLogoUrl}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        siteLogoUrl: e.target.value,
                      }))
                    }
                    placeholder="/uploads/logos/..."
                  />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleUploadLogo(
                        e.target.files?.[0] ?? null,
                        "siteLogoUrl"
                      )
                    }
                    className="block w-full text-sm text-admin-text-soft file:mr-4 file:rounded-xl file:border-0 file:bg-white/[0.06] file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-white/[0.1]"
                  />

                  <p className="text-xs text-admin-text-soft">
                    {isUploadingSiteLogo
                      ? "Téléversement..."
                      : "PNG, JPG, WEBP recommandés"}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm text-admin-text-soft">
                    Logo de la sidebar
                  </label>

                  <Input
                    value={form.siteSidebarLogoUrl}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        siteSidebarLogoUrl: e.target.value,
                      }))
                    }
                    placeholder="/uploads/logos/..."
                  />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleUploadLogo(
                        e.target.files?.[0] ?? null,
                        "siteSidebarLogoUrl"
                      )
                    }
                    className="block w-full text-sm text-admin-text-soft file:mr-4 file:rounded-xl file:border-0 file:bg-white/[0.06] file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-white/[0.1]"
                  />

                  <p className="text-xs text-admin-text-soft">
                    {isUploadingSidebarLogo
                      ? "Téléversement..."
                      : "PNG, JPG, WEBP recommandés"}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Aperçus
                  </h2>
                  <p className="mt-1 text-sm text-admin-text-soft">
                    Prévisualisation rapide des éléments visuels.
                  </p>
                </div>

                <Switch
                  checked={showPreviews}
                  onChange={setShowPreviews}
                  variant="default"
                  size="sm"
                />
              </div>

              {showPreviews ? (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <p className="text-sm text-admin-text-soft">
                      Logo du site
                    </p>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                      {siteLogoPreview ? (
                        <img
                          src={siteLogoPreview}
                          alt="Logo du site"
                          className="max-h-20 max-w-full object-contain"
                        />
                      ) : (
                        <p className="text-sm text-admin-text-soft">
                          Aucun logo renseigné.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-admin-text-soft">
                      Logo sidebar
                    </p>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                      {sidebarLogoPreview ? (
                        <img
                          src={sidebarLogoPreview}
                          alt="Logo sidebar"
                          className="max-h-20 max-w-full object-contain"
                        />
                      ) : (
                        <p className="text-sm text-admin-text-soft">
                          Aucun logo renseigné.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-admin-text-soft">
                  Aperçus masqués.
                </p>
              )}
            </div>
          </Card>

          <Card>
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Stockage
                </h2>
                <p className="mt-1 text-sm text-admin-text-soft">
                  Occupation actuelle des fichiers du site.
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-admin-text-soft">Images portfolio</span>
                  <span className="text-white">
                    {formatBytes(storage.portfolioImagesSize)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-admin-text-soft">Archives légales</span>
                  <span className="text-white">
                    {formatBytes(storage.legalArchivesSize)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-admin-text-soft">Logos</span>
                  <span className="text-white">
                    {formatBytes(storage.logosSize)}
                  </span>
                </div>

                <div className="my-2 h-px bg-white/10" />

                <div className="flex items-center justify-between text-base font-medium">
                  <span className="text-white">Total</span>
                  <span className="text-white">
                    {formatBytes(storage.totalSize)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}