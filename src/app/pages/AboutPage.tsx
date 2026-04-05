import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useToast } from "../hooks/useToast";
import { env } from "../../env";
import {
  cleanupOrphanAboutImages,
  fetchAboutContent,
  saveAboutContent,
  uploadAboutImage,
} from "../services/about";
import { LegalEditor } from "../components/editor/LegalEditor";

type AboutForm = {
  textHtml: string;
  imageAlt: string;
  imageUrl: string;
};

const emptyForm: AboutForm = {
  textHtml: "",
  imageAlt: "",
  imageUrl: "",
};

function resolveAssetUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${env.apiBaseUrl}${url}`;
}

export function AboutPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState<AboutForm>(emptyForm);
  const [cleaningOrphans, setCleaningOrphans] = useState(false);

  async function loadData() {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchAboutContent();

      setForm({
        textHtml: data.about.textHtml ?? "",
        imageAlt: data.about.imageAlt ?? "",
        imageUrl: data.about.imageUrl ?? "",
      });
    } catch (error: any) {
      setErrorMessage(error?.message || "Erreur chargement page à propos.");
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
      await saveAboutContent(form);

      showToast({
        title: "À propos enregistré",
        description: "La section À propos a bien été mise à jour.",
        variant: "success",
      });

      await loadData();
    } catch (error: any) {
      const message = error?.message || "Impossible d’enregistrer la section À propos.";
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

  async function handleUpload(file: File | null) {
    if (!file) return;

    setUploading(true);
    setErrorMessage("");

    try {
      const data = await uploadAboutImage(file);

      setForm((prev) => ({
        ...prev,
        imageUrl: data.fileUrl,
      }));

      showToast({
        title: "Image téléversée",
        description: "L’image de la section À propos a bien été ajoutée.",
        variant: "success",
      });
    } catch (error: any) {
      const message = error?.message || "Erreur lors du téléversement de l’image.";
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

  async function handleCleanupOrphans() {
    setCleaningOrphans(true);
    setErrorMessage("");

    try {
      const data = await cleanupOrphanAboutImages();

      showToast({
        title: "Nettoyage terminé",
        description:
          data.deletedCount > 0
            ? `${data.deletedCount} image${data.deletedCount > 1 ? "s" : ""} orpheline${data.deletedCount > 1 ? "s" : ""} supprimée${data.deletedCount > 1 ? "s" : ""}.`
            : "Aucune image orpheline à supprimer.",
        variant: "success",
      });

      await loadData();
    } catch (error: any) {
      const message =
        error?.message || "Erreur lors du nettoyage des images orphelines.";

      setErrorMessage(message);

      showToast({
        title: "Erreur",
        description: message,
        variant: "error",
      });
    } finally {
      setCleaningOrphans(false);
    }
  }

  const imagePreviewUrl = useMemo(
    () => resolveAssetUrl(form.imageUrl),
    [form.imageUrl]
  );

  if (loading) {
    return (
      <div className="space-y-6 text-white">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">À propos</h1>
          <p className="mt-1 text-sm text-admin-text-soft">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">À propos</h1>
          <p className="mt-1 text-sm text-admin-text-soft">
            Gère le texte et la photo de la section À propos du site vitrine.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={handleCleanupOrphans}
          isLoading={cleaningOrphans}
          disabled={cleaningOrphans}
        >
          {cleaningOrphans
            ? "Nettoyage..."
            : "Nettoyer les images orphelines"}
        </Button>

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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Texte de présentation
                </h2>
                <p className="mt-1 text-sm text-admin-text-soft">
                  Modifie le paragraphe affiché dans la section À propos.
                </p>
              </div>

              <LegalEditor
                content={form.textHtml}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    textHtml: value,
                  }))
                }
              />
            </div>
          </Card>

          <Card>
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Image
                </h2>
                <p className="mt-1 text-sm text-admin-text-soft">
                  Téléverse la photo et définis son texte alternatif.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm text-admin-text-soft">
                  URL de l’image
                </label>
                <Input
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }))
                  }
                  placeholder="/uploads/about/..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm text-admin-text-soft">
                  Alt de l’image
                </label>
                <Input
                  value={form.imageAlt}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      imageAlt: e.target.value,
                    }))
                  }
                  placeholder="Portrait de ..."
                />
              </div>

              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-admin-text-soft file:mr-4 file:rounded-xl file:border-0 file:bg-white/[0.06] file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-white/[0.1]"
                />

                <p className="text-xs text-admin-text-soft">
                  {uploading
                    ? "Téléversement..."
                    : "PNG, JPG, WEBP recommandés"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Aperçu image
                </h2>
                <p className="mt-1 text-sm text-admin-text-soft">
                  Prévisualisation de la photo utilisée dans la section À propos.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                {imagePreviewUrl ? (
                  <img
                    src={imagePreviewUrl}
                    alt={form.imageAlt || "Aperçu image à propos"}
                    className="max-h-[360px] w-full rounded-2xl object-cover"
                  />
                ) : (
                  <p className="text-sm text-admin-text-soft">
                    Aucune image renseignée.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}