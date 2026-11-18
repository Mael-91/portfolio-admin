import { useId, useLayoutEffect, useRef } from "react";
import { Button } from "../ui/Button";

export function DeleteRoleConfirmDialog({ roleName, busy, error, onCancel, onConfirm }: {
  roleName: string;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>("[data-cancel]")?.focus();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
      className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-2xl bg-admin-panel-2 p-6 text-white shadow-xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <h2 id={titleId} className="text-lg font-semibold">Supprimer le rôle</h2>
      <p id={descriptionId} className="mt-2 break-words text-sm text-admin-text-soft">
        Voulez-vous supprimer le rôle <strong>{roleName}</strong> ? Cette action est irréversible.
      </p>
      {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button data-cancel type="button" variant="secondary" disabled={busy} onClick={onCancel}>
          Annuler
        </Button>
        <Button type="button" variant="danger" disabled={busy} onClick={onConfirm}>
          {busy ? "Suppression..." : "Supprimer"}
        </Button>
      </div>
    </dialog>
  );
}
