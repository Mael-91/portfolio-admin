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

export function MessageDetailPage() {
  const { id } = useParams();
  const [message, setMessage] = useState<MessageDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExportingRgpd, setIsExportingRgpd] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function loadMessage() {
    if (!id) {
      return;
    }

    try {
      setErrorMessage("");
      setIsLoading(true);

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
      setIsUpdatingStatus(true);

      const response = await updateMessageProcessingStatus(Number(id), status);
      setMessage(response.message);
    } catch (error: any) {
      setErrorMessage(error?.message || "Impossible de mettre à jour le statut.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleRgpdExport(email: string) {
  if (!id) {
    return;
  }

  try {
    setIsExportingRgpd(true);
    setErrorMessage("");
    setSuccessMessage("");

    const response = await exportMessageRgpd(Number(id), email);

    setSuccessMessage(`Export envoyé à ${response.email}`);
    setIsExportModalOpen(false);
  } catch (error: any) {
    setErrorMessage(error?.message || "Impossible d’envoyer l’export RGPD.");
  } finally {
    setIsExportingRgpd(false);
  }
}

  useEffect(() => {
    loadMessage();
  }, [id]);

  if (isLoading) {
    return <div className="p-8">Chargement...</div>;
  }

  if (errorMessage) {
    return (
      <div className="p-8">
        <div className="rounded-xl bg-red-50 px-4 py-3 text-red-700">
          {errorMessage}
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  if (!message) {
    return <div className="p-8">Message introuvable.</div>;
  }

  return (
    <div className="p-8">
      {errorMessage ? (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-green-700">
          {successMessage}
        </div>
      ) : null}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to="/messages" className="text-sm text-slate-600 hover:text-slate-900">
            ← Retour à la liste
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Message #{message.id}
          </h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Informations</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Prénom</p>
              <p className="font-medium text-slate-900">{message.firstName || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Nom</p>
              <p className="font-medium text-slate-900">{message.lastName || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-medium text-slate-900">{message.email}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Téléphone</p>
              <p className="font-medium text-slate-900">{message.phone || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Type</p>
              <p className="font-medium text-slate-900">{message.requestType}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Société</p>
              <p className="font-medium text-slate-900">{message.company || "-"}</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-slate-500">Message</p>
            <div className="mt-2 rounded-xl bg-slate-50 p-4 whitespace-pre-wrap text-slate-800">
              {message.messageText}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Traitement</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Statut actuel</p>
              <p className="font-medium text-slate-900">
                {getStatusLabel(message.processingStatus)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm text-slate-500">Changer le statut</p>

              <div className="space-y-2">
                <button
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange("unprocessed")}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-left hover:bg-slate-50"
                >
                  Non traité
                </button>

                <button
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange("in_progress")}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-left hover:bg-slate-50"
                >
                  En cours
                </button>

                <button
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange("processed")}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-left hover:bg-slate-50"
                >
                  Traité
                </button>
              </div>
            </div>

            <button type="button" onClick={() => setIsExportModalOpen(true)} className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">Export RGPD</button>
          </div>
        </div>
      </div>
      <ExportRgpdModal isOpen={isExportModalOpen} defaultEmail={message.email} isSubmitting={isExportingRgpd} onClose={() => setIsExportModalOpen(false)} onConfirm={handleRgpdExport}/>
    </div>
  );
}