type DeletePortfolioImageModalProps = {
  isOpen: boolean;
  imageLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
};

export function DeletePortfolioImageModal({
  isOpen,
  imageLabel,
  onClose,
  onConfirm,
  isSubmitting = false,
}: DeletePortfolioImageModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-admin-panel-2 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white">
          Supprimer la photo
        </h3>

        <p className="mt-2 text-sm text-admin-text-soft">
          {imageLabel
            ? `Voulez-vous vraiment supprimer la photo "${imageLabel}" ?`
            : "Voulez-vous vraiment supprimer cette photo ?"}
        </p>

        <p className="mt-2 text-sm text-red-400">
          Le fichier sera aussi supprimé du serveur.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
            disabled={isSubmitting}
          >
            Annuler
          </button>

          <button
            onClick={onConfirm}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm text-white transition hover:bg-red-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}