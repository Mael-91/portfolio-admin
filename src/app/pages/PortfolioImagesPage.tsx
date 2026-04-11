import { useEffect, useState } from "react";
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
import { Input, Textarea } from "../components/ui/Input";
import { Switch } from "../components/ui/Switch";
import { useToast } from "../hooks/useToast";
import { useFeedback } from "../hooks/useFeedback";
import { useFormValidation } from "../hooks/useFormValidation";
import { cn } from "../../lib/utils";
import { getInputFeedbackClasses } from "../../lib/feedbackStyles";

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
          <Button
            variant="secondary"
            size="sm"
            className="cursor-grab active:cursor-grabbing bg-black/50"
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
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(image)}
          >
            Modifier
          </Button>

          <Button
            variant="dangerSoft"
            size="sm"
            onClick={() => onDelete(image)}
          >
            Supprimer
          </Button>
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
  const [, setSavingOrder] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [file, setFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    caption: "",
    altText: "",
    description: "",
    isActive: true,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const { showToast } = useToast();
  const { feedbackState, setSuccess, setError, reset } = useFeedback();

  const {
    hasFieldError,
    submitValidation,
    resetValidation,
    touchField,
    hasAnyError,
  } = useFormValidation(form, {
    caption: (value) => value.trim().length > 0,
    altText: (value) => value.trim().length > 0,
    description: () => true,
    isActive: () => true,
  });

  /* ========================= */
  /* Load data */
  /* ========================= */

  async function loadImages() {
    setLoading(true);
    reset();

    try {
      const res = await fetchPortfolioImages();
      setImages(res.images);
    } catch (err: any) {
      setError();
      showToast({
        title: "Erreur",
        description: "Impossible de téléverser l’image.",
        variant: "error",
      });
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
    reset();
    if (!nextFile) return;

    if (!nextFile.type.startsWith("image/")) {
      setError();
      showToast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier image valide.",
        variant: "error",
      });
      return;
    }

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
    resetValidation();
    reset();
  }

  function handleEdit(image: PortfolioImage) {
    resetValidation();
    reset();

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
    reset();
    submitValidation();

    if (hasAnyError) {
      setError();
      showToast({
        title: "Erreur",
        description: "Veuillez renseigner les champs obligatoires.",
        variant: "error",
      });
      return;
    }

    if (!selectedImage && !file) {
      setError();
      showToast({
        title: "Erreur",
        description: "Veuillez sélectionner une image.",
        variant: "error",
      });

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
        setSuccess();
        showToast({
          title: "Succès",
          description: "Photo mise à jour avec succès.",
          variant: "success",
        });
      } else {
        const formData = new FormData();
        formData.append("image", file as File);
        formData.append("caption", payload.caption);
        formData.append("altText", payload.altText);
        formData.append("description", payload.description || "");
        formData.append("isActive", String(form.isActive));

        await createPortfolioImage(formData);
        setSuccess();
        showToast({
          title: "Succès",
          description: "Photo ajoutée avec succès.",
          variant: "success",
        });
      }

      resetForm();
      await loadImages();
    } catch (err: any) {
      setError();
      showToast({
        title: "Erreur",
        description: err?.message || "Erreur lors de l'enregistrement.",
        variant: "error",
      });
    } finally {
      setSavingForm(false);
    }
  }

  /* ========================= */
  /* Delete */
  /* ========================= */

  async function handleDelete() {
    reset();
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await deletePortfolioImage(deleteTarget.id);
      setSuccess();
      showToast({
        title: "Succès",
        description: "Photo supprimée avec succès.",
        variant: "success",
      });
      setDeleteTarget(null);
      await loadImages();
    } catch (err: any) {
      setError();
      showToast({
        title: "Erreur",
        description: err.message,
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  }

  /* ========================= */
  /* Drag & Drop */
  /* ========================= */

  async function handleDragEnd(event: DragEndEvent) {
    reset();
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

      setSuccess();
      showToast({
        title: "Succès",
        description: "Ordre mis à jour avec succès.",
        variant: "success",
      });
    } catch (err: any) {
      setError();
      showToast({
        title: "Erreur",
        description: err.message,
        variant: "error",
      });
      await loadImages();
    } finally {
      setSavingOrder(false);
    }
  }

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
                    onChange={(e) =>
                      handleFileSelect(e.target.files?.[0] ?? null)
                    }
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
                      <Button
                        variant="dangerSoft"
                        size="sm"
                        type="button"
                        onClick={() => setFile(null)}
                      >
                        Retirer
                      </Button>
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

            <Input
              value={form.caption}
              onChange={(e) =>
                setForm({ ...form, caption: e.target.value })
              }
              onBlur={() => touchField("caption")}
              placeholder="Caption"
              className={cn(
                "outline-none",
                getInputFeedbackClasses(
                  feedbackState,
                  hasFieldError("caption")
                )
              )}
            />
            <Input
              value={form.altText}
              onChange={(e) =>
                setForm({ ...form, altText: e.target.value })
              }
              onBlur={() => touchField("altText")}
              placeholder="Texte alternatif"
              className={cn(
                "outline-none",
                getInputFeedbackClasses(
                  feedbackState,
                  hasFieldError("altText")
                )
              )}
            />
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              onBlur={() => touchField("description")}
              placeholder="Description"
              className={cn(
                "bg-white/[0.03] outline-none",
                getInputFeedbackClasses(
                  feedbackState,
                  hasFieldError("description")
                )
              )}
            />

            <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-sm text-admin-text-soft">
                Activer la photo sur le site
              </span>
              <Switch
                checked={form.isActive}
                onChange={(checked) =>
                  setForm((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </label>

            <Button
              type="submit"
              disabled={savingForm}
              className={`w-full 
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
            </Button>
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