import { useEffect, useState } from "react";
import {
  fetchPortfolioSiteSettings,
  savePortfolioSiteSettings,
  uploadPortfolioSiteImage,
  type PortfolioSiteSettings,
} from "../services/portfolioSiteSettings";
import { useToast } from "../hooks/useToast";
import { useFeedback } from "../hooks/useFeedback";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Input";
import { Switch } from "../components/ui/Switch";
import { env } from "../../env";

function resolveAssetUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${env.apiBaseUrl}${url}`;
}

type UploadTarget = "siteFaviconUrl" | "homeBackgroundImageUrl";

export function PortfolioConfigurationPage() {
  const { showToast } = useToast();
  const { setError, setSuccess, reset } = useFeedback();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isBackgroundPreviewOpen, setIsBackgroundPreviewOpen] = useState(false);

  const [form, setForm] = useState<PortfolioSiteSettings>({
    siteTitle: "",
    siteDescription: "",
    siteFaviconUrl: "",
    homeTitle: "",
    homeSubtitle: "",
    homeBackgroundImageUrl: "",
    gallerySectionTitle: "",
    gallerySectionSubtitle: "",
    contactSectionTitle: "",
    contactSectionSubtitle: "",
    contactOptionProEnabled: true,
    contactOptionPrivateEnabled: true,
    contactOptionInfoEnabled: true,
    contactSubmitButtonLabel: "Envoyer",
  });

  async function load() {
    setLoading(true);
    reset();

    try {
      const res = await fetchPortfolioSiteSettings();
      setForm(res.settings);
    } catch (error: any) {
      setError();
      showToast({
        title: "Erreur",
        description: error?.message || "Erreur chargement configuration",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    reset();

    try {
      await savePortfolioSiteSettings(form);
      setSuccess();

      showToast({
        title: "Configuration enregistrée",
        description: "Les paramètres du site ont été mis à jour.",
        variant: "success",
      });

      await load();
    } catch (error: any) {
      setError();

      showToast({
        title: "Erreur",
        description: error?.message || "Erreur sauvegarde",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(file: File, target: UploadTarget) {
    try {
      const res = await uploadPortfolioSiteImage(file, target);

      setForm((prev) => ({
        ...prev,
        [target]: res.fileUrl,
      }));

      showToast({
        title: "Image envoyée",
        description: "L’image a bien été téléversée.",
        variant: "success",
      });
    } catch (error: any) {
      setError();

      showToast({
        title: "Erreur upload",
        description: error?.message || "Impossible d’envoyer l’image.",
        variant: "error",
      });
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
    target: UploadTarget
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    handleUpload(file, target);
    event.target.value = "";
  }

  if (loading) {
    return <div className="text-white">Chargement...</div>;
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Configuration portfolio
          </h1>
          <p className="mt-1 text-sm text-admin-text-soft">
            Pilote les textes, images et options visibles sur le site vitrine.
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <Card>
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Identité du site
                </h2>
                <p className="mt-1 text-sm text-admin-text-soft">
                  Informations générales utilisées pour le référencement et
                  l’onglet du navigateur.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-admin-text-soft">
                  Titre du site
                </label>
                <Input
                  value={form.siteTitle}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      siteTitle: e.target.value,
                    }))
                  }
                  placeholder="Titre du site"
                  className="px-3 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-admin-text-soft">
                  Description du site
                </label>
                <Textarea
                  value={form.siteDescription}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      siteDescription: e.target.value,
                    }))
                  }
                  placeholder="Description utilisée par le site"
                  className="min-h-28 bg-white/[0.03] px-3 outline-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm text-admin-text-soft">
                  Image de l’onglet / favicon
                </label>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center pt-2">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                    {form.siteFaviconUrl ? (
                      <img
                        src={resolveAssetUrl(form.siteFaviconUrl)}
                        alt="Aperçu favicon"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-admin-text-soft">
                        Aucun
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "siteFaviconUrl")}
                      className="block w-full text-sm text-admin-text-soft file:mr-4 file:rounded-xl file:border-0 file:bg-white/[0.06] file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-white/[0.1]"
                    />
                    <p className="text-xs text-admin-text-muted">
                      Image utilisée pour le favicon ou l’aperçu du site.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Page d’accueil
                </h2>
                <p className="mt-1 text-sm text-admin-text-soft">
                  Configure le hero principal affiché en haut du site vitrine.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-admin-text-soft">
                  Titre d’accueil
                </label>
                <Input
                  value={form.homeTitle}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      homeTitle: e.target.value,
                    }))
                  }
                  placeholder="Titre"
                  className="px-3 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-admin-text-soft">
                  Sous-titre d’accueil
                </label>
                <Textarea
                  value={form.homeSubtitle}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      homeSubtitle: e.target.value,
                    }))
                  }
                  placeholder="Sous-titre"
                  className="min-h-28 bg-white/[0.03] px-3 outline-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm text-admin-text-soft">
                  Image d’arrière-plan
                </label>

                {form.homeBackgroundImageUrl ? (
                <button
                    type="button"
                    onClick={() => setIsBackgroundPreviewOpen(true)}
                    className="group relative block w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] mt-2"
                >
                    <img
                    src={resolveAssetUrl(form.homeBackgroundImageUrl)}
                    alt="Aperçu arrière-plan accueil"
                    className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />

                    <span className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white backdrop-blur transition group-hover:bg-black/80">
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                        <path d="M16 3h3a2 2 0 0 1 2 2v3" />
                        <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
                        <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                    </svg>
                    </span>
                </button>
                ) : (
                <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] text-sm text-admin-text-soft">
                    Aucune image sélectionnée
                </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange(e, "homeBackgroundImageUrl")
                  }
                  className="block w-full text-sm text-admin-text-soft file:mr-4 file:rounded-xl file:border-0 file:bg-white/[0.06] file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-white/[0.1]"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Section portfolio
                </h2>
                <p className="mt-1 text-sm text-admin-text-soft">
                  Textes affichés au-dessus de la galerie d’images.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-admin-text-soft">
                  Titre de section
                </label>
                <Input
                  value={form.gallerySectionTitle}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      gallerySectionTitle: e.target.value,
                    }))
                  }
                  placeholder="Titre de la section portfolio"
                  className="px-3 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-admin-text-soft">
                  Sous-titre de section
                </label>
                <Textarea
                  value={form.gallerySectionSubtitle}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      gallerySectionSubtitle: e.target.value,
                    }))
                  }
                  placeholder="Sous-titre de la section portfolio"
                  className="min-h-24 bg-white/[0.03] px-3 outline-none"
                />
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Section contact
                </h2>
                <p className="mt-1 text-sm text-admin-text-soft">
                  Configure les textes et les choix proposés dans le formulaire.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-admin-text-soft">
                  Titre de la section contact
                </label>
                <Input
                  value={form.contactSectionTitle}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contactSectionTitle: e.target.value,
                    }))
                  }
                  placeholder="Titre de la section contact"
                  className="px-3 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-admin-text-soft">
                  Sous-titre de la section contact
                </label>
                <Textarea
                  value={form.contactSectionSubtitle}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contactSectionSubtitle: e.target.value,
                    }))
                  }
                  placeholder="Sous-titre de la section contact"
                  className="min-h-24 bg-white/[0.03] px-3 outline-none"
                />
              </div>

              <div className="space-y-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">
                  Options du menu déroulant
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-admin-text-soft">
                      Devis professionnel
                    </span>
                    <Switch
                      checked={form.contactOptionProEnabled}
                      onChange={(checked) =>
                        setForm((prev) => ({
                          ...prev,
                          contactOptionProEnabled: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-admin-text-soft">
                      Devis particulier
                    </span>
                    <Switch
                      checked={form.contactOptionPrivateEnabled}
                      onChange={(checked) =>
                        setForm((prev) => ({
                          ...prev,
                          contactOptionPrivateEnabled: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-admin-text-soft">
                      Demande d’information
                    </span>
                    <Switch
                      checked={form.contactOptionInfoEnabled}
                      onChange={(checked) =>
                        setForm((prev) => ({
                          ...prev,
                          contactOptionInfoEnabled: checked,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-admin-text-soft">
                  Texte du bouton d’envoi
                </label>
                <Input
                  value={form.contactSubmitButtonLabel}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contactSubmitButtonLabel: e.target.value,
                    }))
                  }
                  placeholder="Envoyer"
                  className="px-3 outline-none"
                />
              </div>
            </div>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Enregistrement..." : "Enregistrer la configuration"}
          </Button>
        </div>
      </div>
      {isBackgroundPreviewOpen && form.homeBackgroundImageUrl ? (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
            onClick={() => setIsBackgroundPreviewOpen(false)}
        >
            <div
            className="relative max-h-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
            >
            <button
                type="button"
                onClick={() => setIsBackgroundPreviewOpen(false)}
                className="absolute right-3 top-3 z-10 rounded-full bg-black/70 p-2 text-white transition hover:bg-black"
                aria-label="Fermer l’aperçu"
            >
                <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                >
                <path d="M18 6 6 18" />
                <path d="M6 6l12 12" />
                </svg>
            </button>

            <img
                src={resolveAssetUrl(form.homeBackgroundImageUrl)}
                alt="Image d’arrière-plan en grand"
                className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            </div>
        </div>
        ) : null}
    </div>
  );
}