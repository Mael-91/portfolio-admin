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
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white"
          >
            Déplacer
          </button>

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
          <button
            onClick={() => onEdit(image)}
            className="cursor-pointer rounded-xl bg-white/[0.06] px-3 py-1.5 text-xs text-white hover:bg-white/[0.1]"
          >
            Modifier
          </button>

          <button
            onClick={() => onDelete(image)}
            className="cursor-pointer rounded-xl bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20"
          >
            Supprimer
          </button>
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

    setSavingForm(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (selectedImage) {
        await updatePortfolioImage(selectedImage.id, form);
        setSuccessMessage("Photo mise à jour");
      } else {
        if (!file) throw new Error("Veuillez sélectionner une image");

        const formData = new FormData();
        formData.append("image", file);
        formData.append("caption", form.caption);
        formData.append("altText", form.altText);
        formData.append("description", form.description);

        await createPortfolioImage(formData);

        setSuccessMessage("Photo ajoutée");
      }

      resetForm();
      await loadImages();
    } catch (err: any) {
      setErrorMessage(err.message);
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
            {!selectedImage && (
              <input
                type="file"
                onChange={(e) =>
                  setFile(e.target.files?.[0] ?? null)
                }
              />
            )}

            <input
              value={form.caption}
              onChange={(e) =>
                setForm({ ...form, caption: e.target.value })
              }
              placeholder="Caption"
            />

            <input
              value={form.altText}
              onChange={(e) =>
                setForm({ ...form, altText: e.target.value })
              }
              placeholder="Alt"
            />

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Description"
            />

            <label>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isActive: e.target.checked,
                  })
                }
              />
              Active
            </label>

            <button type="submit" disabled={savingForm}>
              {selectedImage ? "Modifier" : "Ajouter"}
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