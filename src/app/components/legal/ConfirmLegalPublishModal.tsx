type ConfirmLegalPublishModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
};

export function ConfirmLegalPublishModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}: ConfirmLegalPublishModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-admin-panel-2 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white">
          Confirmer la mise à jour
        </h3>

        <p className="mt-2 text-sm text-admin-text-soft">
          Une nouvelle version publiée sera créée. Les versions publiées au-delà
          des 5 plus récentes seront archivées en HTML sur le serveur puis
          supprimées de la base.
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
            className="rounded-xl bg-admin-accent px-4 py-2 text-sm text-white transition hover:brightness-110"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publication..." : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}