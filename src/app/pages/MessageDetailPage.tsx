import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  exportMessageRgpd,
  fetchMessageDetail,
  type MessageDetail,
  type ProcessingStatus,
  updateMessageProcessingStatus,
} from "../services/messages";
import { ExportRgpdModal } from "../components/ExportRgpdModal";
import { useToast } from "../hooks/useToast";
import { Button } from "../components/ui/Button";

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

function formatDate(value: string | null) {
  if (!value) return "-";

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
  const location = useLocation();
  const { showToast } = useToast();

  const [message, setMessage] = useState<MessageDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExportingRgpd, setIsExportingRgpd] = useState(false);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const backToMessagesHref = useMemo(() => {
    return location.search ? `/messages${location.search}` : "/messages";
  }, [location.search]);


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
        description: `Le message est maintenant marqué comme « ${getStatusLabel(status)} ».`,
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

  async function copyToClipboard(text: string) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }

      // 🔁 fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      document.execCommand("copy");
      document.body.removeChild(textarea);

      return true;
    } catch (error) {
      console.error("Erreur copie :", error);
      return false;
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
          to={backToMessagesHref}
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

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link to={backToMessagesHref} className="text-sm text-admin-text-soft hover:text-white">
            ← Retour à la liste
          </Link>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Message #{message.id}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-admin-text-soft">
            <span>{getRequestTypeLabel(message.requestType)}</span>
            <span className="h-1 w-1 rounded-full bg-admin-text-muted" />
            <span>{formatDate(message.createdAt)}</span>
            <span className="h-1 w-1 rounded-full bg-admin-text-muted" />
            <span className="inline-flex items-center gap-2">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${getStatusDotClass(
                  message.processingStatus
                )}`}
              />
              {getStatusLabel(message.processingStatus)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
        <section className="space-y-6">
          <div className="rounded-[24px] bg-white/[0.025] p-6 shadow-lg shadow-black/10">
            <h2 className="text-base font-semibold text-white">Contact</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-admin-text-muted">
                  Prénom
                </p>
                <p className="mt-2 text-sm text-admin-text">{message.firstName || "-"}</p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-admin-text-muted">
                  Nom
                </p>
                <p className="mt-2 text-sm text-admin-text">{message.lastName || "-"}</p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-admin-text-muted">
                  Email
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-sm text-admin-text">{message.email}</p>
                  <Button variant="icon" size="icon"
                    onClick={async () => {
                      const success = await copyToClipboard(message.email);
                      if (success) {
                        setCopiedField("email");
                        showToast({
                          title: "Copié",
                          description: "Adresse email copiée",
                          variant: "success",
                        });
                        setTimeout(() => setCopiedField(null), 1500);
                      } else {
                        showToast({
                          title: "Erreur",
                          description: "Impossible de copier",
                          variant: "error",
                        });
                      }
                    }}
                    title="copier"
                    className={`transition-all duration-200 active:scale-90 ${copiedField === "email" ? "text-green-400" : "text-admin-text-soft hover:text-white"}`}
                    >
                      {/* COPY ICON */}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`absolute h-4 w-4 transition-all duration-200 ${copiedField === "email" ? "opacity-0 scale-75" : "opacity-100 scale-100"}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25h3A2.25 2.25 0 0021 15V5.25A2.25 2.25 0 0018.75 3h-9.5A2.25 2.25 0 007 5.25v3"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7.5h-3A2.25 2.25 0 003.75 9.75v9.75A2.25 2.25 0 006 21.75h9.75A2.25 2.25 0 0018 19.5v-9.75A2.25 2.25 0 0015.75 7.5H9z"/>
                      </svg>

                      {/* SUCCESS ICON */}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`absolute h-4 w-4 transition-all duration-200 ${copiedField === "email" ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    </Button>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-admin-text-muted">
                  Téléphone
                </p>
                <p className="mt-2 text-sm text-admin-text">{message.phone || "-"}</p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-admin-text-muted">
                  Société
                </p>
                <p className="mt-2 text-sm text-admin-text">{message.company || "-"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] bg-white/[0.025] p-6 shadow-lg shadow-black/10">
            <h2 className="text-base font-semibold text-white">Informations de demande</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-admin-text-muted">
                  Type
                </p>
                <p className="mt-2 text-sm text-admin-text">
                  {getRequestTypeLabel(message.requestType)}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-admin-text-muted">
                  Date de création
                </p>
                <p className="mt-2 text-sm text-admin-text">{formatDate(message.createdAt)}</p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-admin-text-muted">
                  Consentement confidentialité
                </p>
                <p className="mt-2 text-sm text-admin-text">
                  {message.consentPrivacy ? "Oui" : "Non"}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-admin-text-muted">
                  Contact téléphone
                </p>
                <p className="mt-2 text-sm text-admin-text">
                  {message.allowPhoneContact ? "Autorisé" : "Non autorisé"}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-admin-text-muted">
                  Dernière mise à jour statut
                </p>
                <p className="mt-2 text-sm text-admin-text">
                  {formatDate(message.processingUpdatedAt)}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-admin-text-muted">
                  Identifiant technique
                </p>
                <p className="mt-2 text-sm text-admin-text">#{message.id}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] bg-white/[0.025] p-6 shadow-lg shadow-black/10">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-white">Message</h2>

              <Button variant="icon" size="icon"
                  onClick={async () => {
                    const success = await copyToClipboard(message.messageText);
                    if (success) {
                      setCopiedField("message");
                      showToast({
                        title: "Copié",
                        description: "Message copié",
                        variant: "success",
                      });
                      setTimeout(() => setCopiedField(null), 1500);
                    } else {
                      showToast({
                        title: "Erreur",
                        description: "Impossible de copier",
                        variant: "error",
                      });
                    }
                  }}
                  title="copier"
                  className={`transition-all duration-200 active:scale-90 ${copiedField === "message" ? "text-green-400" : "text-admin-text-soft hover:text-white"}`}
                >
                  {/* COPY ICON */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`absolute h-4 w-4 transition-all duration-200 ${copiedField === "message" ? "opacity-0 scale-75" : "opacity-100 scale-100"}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25h3A2.25 2.25 0 0021 15V5.25A2.25 2.25 0 0018.75 3h-9.5A2.25 2.25 0 007 5.25v3"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7.5h-3A2.25 2.25 0 003.75 9.75v9.75A2.25 2.25 0 006 21.75h9.75A2.25 2.25 0 0018 19.5v-9.75A2.25 2.25 0 0015.75 7.5H9z"/>
                  </svg>

                  {/* SUCCESS ICON */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`absolute h-4 w-4 transition-all duration-200 ${copiedField === "message" ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </Button>
            </div>

            <div className="mt-4 rounded-[20px] bg-[#0c1a34] p-5 text-[15px] leading-7 text-admin-text-soft whitespace-pre-wrap">
              {message.messageText}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[24px] bg-white/[0.025] p-6 shadow-lg shadow-black/10">
            <h2 className="text-base font-semibold text-white">Traitement</h2>

            <div className="mt-5 rounded-[20px] bg-[#0d1d38] p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-admin-text-muted">
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
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-admin-text-muted">
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
          </div>

          <div className="rounded-[24px] bg-white/[0.025] p-6 shadow-lg shadow-black/10">
            <h2 className="text-base font-semibold text-white">Actions</h2>

            <div className="mt-5 space-y-3">
              <Button size="lg" align="center" className="w-full rounded-2xl px-4 font-semibold" type="button" onClick={() => setIsExportModalOpen(true)}>
                Export RGPD
              </Button>
            </div>
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