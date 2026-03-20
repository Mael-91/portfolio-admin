type LegalPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  html: string;
  title?: string;
};

export function LegalPreviewModal({
  isOpen,
  onClose,
  html,
  title = "Aperçu du document",
}: LegalPreviewModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-admin-panel-2 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white transition hover:bg-white/20"
          >
            Fermer
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6">
          <div className="rounded-2xl border border-white/10 bg-white p-8 text-slate-900">
            <div
              className="legal-preview prose max-w-none prose-slate"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}