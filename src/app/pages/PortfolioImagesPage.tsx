import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  createPortfolioImage,
  deletePortfolioImage,
  fetchPortfolioImages,
  reorderPortfolioImages,
  updatePortfolioImage,
  type PortfolioImage,
} from "../services/portfolioImages";

import { DeletePortfolioImageModal } from "../components/portfolio/DeletePortfolioImageModal";
import { env } from "../../env";
import { Button } from "../components/ui/Button";

/* ========================= */
/* Utils */
/* ========================= */

function resolveImageUrl(url: string) {
  if (url.startsWith("http")) return url;
  return `${env.apiBaseUrl}${url}`;
}

/* ========================= */
/* Card draggable */
/* ========================= */

function SortablePortfolioCard({
  image,
  onEdit,
  onDelete,
}: {
  image: PortfolioImage;
  onEdit: (image: PortfolioImage) => void;
  onDelete: (image: PortfolioImage) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: String(image.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <figure ref={setNodeRef} style={style} className="auto__card">
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.04]">
        <img
          className="auto__img"
          src={resolveImageUrl(image.fileUrl)}
          alt={image.altText}
          draggable={false}
        />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <Button variant="secondary" size="sm" className="cursor-grab active:cursor-grabbing" 
            type="button"
            {...attributes}
            {...listeners}
          >
            Déplacer
          </Button>

          <span
            className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
              image.isActive
                ? "bg-green-500/20 text-green-300"
                : "bg-orange-500/20 text-orange-300"
            }`}
          >
            {image.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <figcaption className="auto__caption">
        <div className="font-medium text-white">{image.caption}</div>

        <div className="mt-1 flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => onEdit(image)}>Modifier</Button>

          <Button variant="dangerSoft" size="sm" onClick={() => onDelete(image)}>Supprimer</Button>
        </div>
      </figcaption>
    </figure>
  );
}

/* ========================= */
/* Page principale */
/* ========================= */

export function PortfolioImagesPage() {
  const sensors = useSensors(useSensor(PointerSensor));

  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] =
    useState<PortfolioImage | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<PortfolioImage | null>(null);

  const [savingForm, setSavingForm] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [file, setFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    caption: "",
    altText: "",
    description: "",
    isActive: true,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  /* ========================= */
  /* Load data */
  /* ========================= */

  async function loadImages() {
    setLoading(true);

    try {
      const res = await fetchPortfolioImages();
      setImages(res.images);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  function handleFileSelect(nextFile: File | null) {
  if (!nextFile) return;

  if (!nextFile.type.startsWith("image/")) {
    setErrorMessage("Veuillez sélectionner un fichier image valide.");
    return;
  }

  setErrorMessage("");
  setFile(nextFile);
}

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files?.[0] ?? null;
    handleFileSelect(droppedFile);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
  }

  /* ========================= */
  /* Helpers */
  /* ========================= */

  function resetForm() {
    setSelectedImage(null);
    setForm({
      caption: "",
      altText: "",
      description: "",
      isActive: true,
    });
    setFile(null);
  }

  function handleEdit(image: PortfolioImage) {
    setSelectedImage(image);
    setForm({
      caption: image.caption,
      altText: image.altText,
      description: image.description ?? "",
      isActive: image.isActive,
    });
  }

  /* ========================= */
  /* Submit form */
  /* ========================= */

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  setErrorMessage("");
  setSuccessMessage("");

  if (!form.caption.trim()) {
    setErrorMessage("Le champ caption est obligatoire.");
    return;
  }

  if (!form.altText.trim()) {
    setErrorMessage("Le texte alternatif est obligatoire.");
    return;
  }

  if (!selectedImage && !file) {
    setErrorMessage("Veuillez sélectionner une image.");
    return;
  }

  setSavingForm(true);

  try {
    const payload = {
      ...form,
      altText: form.altText.trim() || form.caption.trim(),
      caption: form.caption.trim(),
      description: form.description.trim(),
      isActive: form.isActive ?? true,
    };

    if (selectedImage) {
      await updatePortfolioImage(selectedImage.id, payload);
      setSuccessMessage("Photo mise à jour");
    } else {
      const formData = new FormData();
      formData.append("image", file as File);
      formData.append("caption", payload.caption);
      formData.append("altText", payload.altText);
      formData.append("description", payload.description || "");
      formData.append("isActive", String(form.isActive));

      await createPortfolioImage(formData);
      setSuccessMessage("Photo ajoutée");
    }

    resetForm();
    await loadImages();
  } catch (err: any) {
    setErrorMessage(err.message || "Erreur lors de l'enregistrement");
  } finally {
    setSavingForm(false);
  }
}

  /* ========================= */
  /* Delete */
  /* ========================= */

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await deletePortfolioImage(deleteTarget.id);
      setSuccessMessage("Photo supprimée");
      setDeleteTarget(null);
      await loadImages();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setDeleting(false);
    }
  }

  /* ========================= */
  /* Drag & Drop */
  /* ========================= */

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex(
      (i) => String(i.id) === String(active.id)
    );
    const newIndex = images.findIndex(
      (i) => String(i.id) === String(over.id)
    );

    const reordered = arrayMove(images, oldIndex, newIndex).map(
      (img, index) => ({
        ...img,
        displayOrder: index + 1,
      })
    );

    setImages(reordered);
    setSavingOrder(true);

    try {
      await reorderPortfolioImages(
        reordered.map((i) => ({
          id: i.id,
          displayOrder: i.displayOrder,
        }))
      );

      setSuccessMessage("Ordre mis à jour");
    } catch (err: any) {
      setErrorMessage(err.message);
      await loadImages();
    } finally {
      setSavingOrder(false);
    }
  }

  /* ========================= */
  /* Derived */
  /* ========================= */

  const activeImages = useMemo(
    () =>
      images
        .filter((i) => i.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [images]
  );

  /* ========================= */
  /* Render */
  /* ========================= */

  return (
    <div className="space-y-6 text-white">
      {/* STYLE PREVIEW IDENTIQUE AU SITE */}
      <style>{`
        .auto__grid-preview {
          columns: 3;
          column-gap: 18px;
        }

        .auto__card {
          break-inside: avoid;
          margin-bottom: 18px;
        }

        .auto__img {
          width: 100%;
          border-radius: 16px;
        }

        .auto__caption {
          margin-top: 8px;
          font-size: 14px;
        }
      `}</style>

      <h1 className="text-2xl font-semibold">Portfolio</h1>

      {errorMessage && (
        <div className="text-red-400">{errorMessage}</div>
      )}

      {successMessage && (
        <div className="text-green-400">{successMessage}</div>
      )}

      <div className="grid xl:grid-cols-[1fr_350px] gap-6">
        {/* GRID */}
        <div>
          {loading ? (
            "Chargement..."
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={images.map((i) => String(i.id))}
                strategy={rectSortingStrategy}
              >
                <div className="auto__grid-preview">
                  {images.map((img) => (
                    <SortablePortfolioCard
                      key={img.id}
                      image={img}
                      onEdit={handleEdit}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* FORM */}
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {!selectedImage ? (
              <div className="space-y-3">
                <label className="mb-1 block text-sm text-admin-text-soft">
                  Image
                </label>

                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`rounded-2xl border border-dashed p-4 text-center transition ${
                    isDragOver
                      ? "border-admin-accent bg-admin-accent/10"
                      : "border-white/15 bg-white/[0.03]"
                  }`}
                >
                  <input
                    id="portfolio-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                  />

                  <label
                    htmlFor="portfolio-image-upload"
                    className="flex cursor-pointer flex-col items-center gap-2"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-8 w-8 text-admin-text-soft"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M12 16V4" />
                      <path d="m7 9 5-5 5 5" />
                      <path d="M4 20h16" />
                    </svg>

                    <div className="text-sm text-white">
                      Glisse-dépose une image ici
                    </div>

                    <div className="text-xs text-admin-text-soft">
                      ou clique pour sélectionner un fichier
                    </div>
                  </label>
                </div>

                {previewUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-admin-text-soft">
                        Aperçu avant envoi
                      </span>

                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="cursor-pointer rounded-lg bg-red-500/10 px-2 py-1 text-xs text-red-400 transition hover:bg-red-500/20"
                      >
                        Retirer
                      </button>
                    </div>

                    <img
                      src={previewUrl}
                      alt="Aperçu"
                      className="w-full rounded-xl object-cover"
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            <input
              value={form.caption}
              onChange={(e) =>
                setForm({ ...form, caption: e.target.value })
              }
              placeholder="Caption"
              className={`w-full rounded-xl border bg-white/[0.03] px-3 py-2 text-sm text-white outline-none ${
                errorMessage && !form.caption.trim()
                  ? "border-red-500"
                  : "border-white/10 focus:border-white/20"
              }`}
            />

            <input
              value={form.altText}
              onChange={(e) =>
                setForm({ ...form, altText: e.target.value })
              }
              placeholder="Texte alternatif"
              className={`w-full rounded-xl border bg-white/[0.03] px-3 py-2 text-sm text-white outline-none ${
                errorMessage && !form.altText.trim()
                  ? "border-red-500"
                  : "border-white/10 focus:border-white/20"
              }`}
            />

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Description"
              className={`w-full rounded-xl border bg-white/[0.03] px-3 py-2 text-sm text-white outline-none ${
                errorMessage && !form.description.trim()
                  ? "border-red-500"
                  : "border-white/10 focus:border-white/20"
              }`}
            />

            <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-sm text-admin-text-soft">
                Activer la photo sur le site
              </span>

              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, isActive: !prev.isActive }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  form.isActive ? "bg-green-500" : "bg-white/20"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    form.isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </label>

            <button
              type="submit"
              disabled={savingForm}
              className={`w-full rounded-2xl px-4 py-2.5 text-sm font-medium transition 
                ${
                  savingForm
                    ? "bg-white/10 text-white/60 cursor-not-allowed"
                    : "bg-admin-accent text-white hover:brightness-110 active:scale-[0.98]"
                }
              `}
            >
              {savingForm
                ? "Enregistrement..."
                : selectedImage
                ? "Enregistrer les modifications"
                : "Ajouter la photo"}
            </button>
          </form>
        </div>
      </div>

      <DeletePortfolioImageModal
        isOpen={!!deleteTarget}
        imageLabel={deleteTarget?.caption}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isSubmitting={deleting}
      />
    </div>
  );
}