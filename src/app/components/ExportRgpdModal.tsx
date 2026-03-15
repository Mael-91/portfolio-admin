import { type FormEvent, useEffect, useState } from "react";

interface ExportRgpdModalProps {
  isOpen: boolean;
  defaultEmail: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (email: string) => Promise<void>;
}

export function ExportRgpdModal({
  isOpen,
  defaultEmail,
  isSubmitting,
  onClose,
  onConfirm,
}: ExportRgpdModalProps) {
  const [email, setEmail] = useState(defaultEmail);

  useEffect(() => {
    setEmail(defaultEmail);
  }, [defaultEmail, isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onConfirm(email);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900">Export RGPD</h2>

        <p className="mt-2 text-sm text-slate-600">
          Confirme l’adresse email destinataire de l’export. Tu peux la modifier si besoin.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="rgpd-email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Adresse email
            </label>

            <input
              id="rgpd-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {isSubmitting ? "Envoi..." : "Envoyer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}