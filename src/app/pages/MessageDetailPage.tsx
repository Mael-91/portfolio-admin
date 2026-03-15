import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  exportMessageRgpd,
  fetchMessageDetail,
  type MessageDetail,
  type ProcessingStatus,
  updateMessageProcessingStatus,
} from "../services/messages";
import { ExportRgpdModal } from "../components/ExportRgpdModal";
import { useToast } from "../hooks/useToast";

function getStatusLabel(status: ProcessingStatus): string {
  switch (status) {
    case "processed":
      return "Traité";
    case "in_progress":
      return "En cours";
    case "unprocessed":
    default:
      return "Non traité";
  }
}

function getStatusDotClass(status: ProcessingStatus): string {
  switch (status) {
    case "processed":
      return "bg-green-500";
    case "in_progress":
      return "bg-orange-400";
    case "unprocessed":
    default:
      return "bg-red-500";
  }
}

function getRequestTypeLabel(requestType: string): string {
  switch (requestType) {
    case "pro":
      return "Professionnel";
    case "part":
      return "Particulier";
    case "info":
      return "Information";
    default:
      return requestType;
  }
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

const processingStatusOptions: Array<{
  value: ProcessingStatus;
  label: string;
  description: string;
}> = [
  {
    value: "unprocessed",
    label: "Non traité",
    description: "La demande n’a pas encore été prise en charge.",
  },
  {
    value: "in_progress",
    label: "En cours",
    description: "La demande est en cours de traitement.",
  },
  {
    value: "processed",
    label: "Traité",
    description: "La demande a été finalisée.",
  },
];

export function MessageDetailPage() {
  const { id } = useParams();
  const { showToast } = useToast();

  const [message, setMessage] = useState<MessageDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExportingRgpd, setIsExportingRgpd] = useState(false);

  async function loadMessage() {
    if (!id) {
      setErrorMessage("Identifiant de message manquant.");
      setIsLoading(false);
      return;
    }

    try {
      setErrorMessage("");
      const response = await fetchMessageDetail(Number(id));
      setMessage(response.message);
    } catch (error: any) {
      setErrorMessage(error?.message || "Impossible de charger le message.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(status: ProcessingStatus) {
    if (!id) {
      return;
    }

    try {
      setErrorMessage("");
      setIsUpdatingStatus(true);

      const response = await updateMessageProcessingStatus(Number(id), status);
      setMessage(response.message);

      showToast({
        title: "Statut mis à jour",
        description: `Le message est maintenant marqué comme "${getStatusLabel(status)}".`,
        variant: "success",
      });
    } catch (error: any) {
      const messageError =
        error?.message || "Impossible de mettre à jour le statut.";
      setErrorMessage(messageError);

      showToast({
        title: "Erreur",
        description: messageError,
        variant: "error",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleRgpdExport(email: string) {
    if (!id) {
      return;
    }

    try {
      setErrorMessage("");
      setIsExportingRgpd(true);

      const response = await exportMessageRgpd(Number(id), email);

      setIsExportModalOpen(false);

      showToast({
        title: "Export RGPD envoyé",
        description: `Les données ont été envoyées à ${response.email}.`,
        variant: "success",
      });
    } catch (error: any) {
      const messageError =
        error?.message || "Impossible d’envoyer l’export RGPD.";
      setErrorMessage(messageError);

      showToast({
        title: "Erreur",
        description: messageError,
        variant: "error",
      });
    } finally {
      setIsExportingRgpd(false);
    }
  }

  useEffect(() => {
    loadMessage();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[24px] bg-white/[0.025] p-6 shadow-lg shadow-black/10">
          <p className="text-sm text-admin-text-soft">Chargement du message...</p>
        </div>
      </div>
    );
  }

  if (errorMessage && !message) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl bg-red-50 px-4 py-3 text-red-700">
          {errorMessage}
        </div>

        <Link
          to="/messages"
          className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-admin-text-soft"
        >
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="space-y-6">
        <div className="rounded-[24px] bg-white/[0.025] p-6 shadow-lg shadow-black/10">
          <p className="text-sm text-admin-text-soft">Message introuvable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorMessage ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <div>
          <Link to="/messages" className="text-sm text-admin-text-soft hover:text-white">
            ← Retour à la liste
          </Link>
          <h1 className="mt-2 text-[26px] font-semibold tracking-tight text-white">
            Message #{message.id}
          </h1>
          <p className="mt-1 text-sm text-admin-text-soft">
            Consultation du détail et gestion du statut de traitement.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <section className="rounded-[24px] bg-white/[0.025] p-6 shadow-lg shadow-black/10">
          <h2 className="text-lg font-semibold text-white">Informations</h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-admin-text-muted">
                Type
              </p>
              <p className="mt-2 text-sm text-admin-text">{getRequestTypeLabel(message.requestType)}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-admin-text-muted">
                Date
              </p>
              <p className="mt-2 text-sm text-admin-text">{formatDate(message.createdAt)}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-admin-text-muted">
                Prénom
              </p>
              <p className="mt-2 text-sm text-admin-text">{message.firstName || "-"}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-admin-text-muted">
                Nom
              </p>
              <p className="mt-2 text-sm text-admin-text">{message.lastName || "-"}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-admin-text-muted">
                Email
              </p>
              <p className="mt-2 text-sm text-admin-text">{message.email}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-admin-text-muted">
                Téléphone
              </p>
              <p className="mt-2 text-sm text-admin-text">{message.phone || "-"}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-admin-text-muted">
                Société
              </p>
              <p className="mt-2 text-sm text-admin-text">{message.company || "-"}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-admin-text-muted">
                Consentement confidentialité
              </p>
              <p className="mt-2 text-sm text-admin-text">
                {message.consentPrivacy ? "Oui" : "Non"}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-admin-text-muted">
              Message
            </p>

            <div className="mt-3 rounded-[20px] bg-[#0d1d38] p-5 text-sm leading-7 text-admin-text-soft whitespace-pre-wrap">
              {message.messageText}
            </div>
          </div>
        </section>

        <aside className="rounded-[24px] bg-white/[0.025] p-6 shadow-lg shadow-black/10">
          <h2 className="text-lg font-semibold text-white">Traitement</h2>

          <div className="mt-6 rounded-[20px] bg-[#0d1d38] p-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-admin-text-muted">
              Statut actuel
            </p>

            <div className="mt-3 flex items-center gap-3">
              <span
                className={`inline-block h-3.5 w-3.5 rounded-full ${getStatusDotClass(
                  message.processingStatus
                )}`}
              />
              <span className="text-sm font-medium text-white">
                {getStatusLabel(message.processingStatus)}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-admin-text-muted">
              Changer le statut
            </p>

            <div className="mt-3 space-y-2">
              {processingStatusOptions.map((option) => {
                const isSelected = message.processingStatus === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={isUpdatingStatus || isSelected}
                    onClick={() => handleStatusChange(option.value)}
                    className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      isSelected
                        ? "border-admin-accent bg-admin-accent-soft/60"
                        : "border-white/8 bg-white/[0.03] hover:bg-white/[0.06]"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        isSelected
                          ? "border-admin-accent bg-admin-accent"
                          : "border-white/20 bg-transparent"
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          isSelected ? "bg-white" : "bg-transparent"
                        }`}
                      />
                    </span>

                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-white">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-admin-text-soft">
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="w-full rounded-2xl bg-admin-accent px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Export RGPD
            </button>
          </div>
        </aside>
      </div>

      <ExportRgpdModal
        isOpen={isExportModalOpen}
        defaultEmail={message.email}
        isSubmitting={isExportingRgpd}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleRgpdExport}
      />
    </div>
  );
}