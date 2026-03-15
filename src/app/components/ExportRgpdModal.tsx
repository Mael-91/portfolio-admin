import { useEffect, useRef, useState } from "react";

type Props = {
  isOpen: boolean;
  defaultEmail: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (email: string) => void;
};

export function ExportRgpdModal({
  isOpen,
  defaultEmail,
  isSubmitting,
  onClose,
  onConfirm,
}: Props) {
  const [email, setEmail] = useState(defaultEmail);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEmail(defaultEmail);
  }, [defaultEmail]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onConfirm(email);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      onMouseDown={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-[24px] bg-[#0f1f3d] p-6 shadow-2xl shadow-black/50"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Export RGPD
            </h2>

            <p className="mt-1 text-sm text-admin-text-soft">
              Envoyer les données personnelles du contact par email.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-admin-text-muted hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.14em] text-admin-text-muted">
              Email destinataire
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1833] px-4 py-2.5 text-sm text-white outline-none transition focus:border-admin-accent"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-admin-text-soft transition hover:bg-white/[0.06]"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-admin-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {isSubmitting ? "Envoi..." : "Envoyer l’export"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}