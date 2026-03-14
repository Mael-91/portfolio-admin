import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchMessages,
  fetchNewMessagesCount,
  type MessageListItem,
  type ProcessingStatus,
} from "../services/messages";

const PAGE_SIZE = 10;
const ACTIVE_POLLING_INTERVAL_MS = 15000;
const BACKGROUND_POLLING_INTERVAL_MS = 30000;

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

export function MessagesPage() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState<MessageListItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<"" | ProcessingStatus>("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const toastTimeoutRef = useRef<number | null>(null);
  const lastSeenIdRef = useRef<number>(0);
  const hasLoadedOnceRef = useRef(false);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / pageSize));
  }, [pageSize, total]);

  async function loadMessages(options?: { silent?: boolean }) {
    const silent = options?.silent ?? false;

    if (!silent) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      setErrorMessage("");

      const response = await fetchMessages({
        page,
        pageSize,
        sortBy,
        sortOrder,
        status: statusFilter || undefined,
      });

      setMessages(response.messages);
      setTotal(response.total);

      if (response.messages.length > 0) {
        const maxId = Math.max(...response.messages.map((message) => message.id));

        if (!hasLoadedOnceRef.current) {
          lastSeenIdRef.current = maxId;
          hasLoadedOnceRef.current = true;
        }
      }
    } catch (error: any) {
      setErrorMessage(error?.message || "Impossible de charger les messages.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  async function checkNewMessages() {
    try {
      const response = await fetchNewMessagesCount(lastSeenIdRef.current);

      if (response.total > 0) {
        setNewMessagesCount(response.total);
        setShowToast(true);

        if (toastTimeoutRef.current) {
          window.clearTimeout(toastTimeoutRef.current);
        }

        toastTimeoutRef.current = window.setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch {
      // on ignore silencieusement pour le polling
    }
  }

  function handleRefreshNow() {
    if (messages.length > 0) {
      const maxId = Math.max(...messages.map((message) => message.id));
      lastSeenIdRef.current = maxId;
    }

    setNewMessagesCount(0);
    setShowToast(false);
    loadMessages({ silent: true });
  }

  useEffect(() => {
    loadMessages();
  }, [page, sortBy, sortOrder, statusFilter]);

  useEffect(() => {
    const titleBase = "Admin";
    document.title =
      newMessagesCount > 0 ? `(${newMessagesCount}) ${titleBase}` : titleBase;
  }, [newMessagesCount]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadMessages({ silent: true });
      checkNewMessages();
    }, document.hidden ? BACKGROUND_POLLING_INTERVAL_MS : ACTIVE_POLLING_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [page, sortBy, sortOrder, statusFilter]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      loadMessages({ silent: true });
      checkNewMessages();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [page, sortBy, sortOrder, statusFilter]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="relative p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Demandes de contact</h1>
          <p className="mt-1 text-sm text-slate-600">
            Consulte les demandes, surveille les nouveaux messages et ouvre le détail.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefreshNow}
            className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
          >
            Actualiser
          </button>

          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            Export RGPD
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Total</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{total}</p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Nouveaux messages</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{newMessagesCount}</p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Polling</p>
          <p className="mt-2 text-sm font-medium text-slate-900">
            {isRefreshing ? "Actualisation..." : "Actif"}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Page</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {page} / {totalPages}
          </p>
        </div>
      </div>

      <div className="mb-4 grid gap-3 rounded-xl bg-white p-4 shadow md:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Trier par
          </label>

          <select
            value={sortBy}
            onChange={(e) => {
              setPage(1);
              setSortBy(e.target.value);
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="date">Date</option>
            <option value="id">ID</option>
            <option value="alphabetical">Ordre alphabétique</option>
            <option value="status">Statut</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Ordre
          </label>

          <select
            value={sortOrder}
            onChange={(e) => {
              setPage(1);
              setSortOrder(e.target.value as "asc" | "desc");
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="desc">Décroissant</option>
            <option value="asc">Croissant</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Statut
          </label>

          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value as "" | ProcessingStatus);
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">Tous</option>
            <option value="unprocessed">Non traité</option>
            <option value="in_progress">En cours</option>
            <option value="processed">Traité</option>
          </select>
        </div>

        <div className="flex items-end">
          <div className="w-full rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Les nouveaux messages mettent à jour l’onglet et affichent une alerte.
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Consentement</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  Chargement des messages...
                </td>
              </tr>
            ) : messages.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  Aucun message trouvé.
                </td>
              </tr>
            ) : (
              messages.map((message) => (
                <tr
                  key={message.id}
                  onClick={() => navigate(`/messages/${message.id}`)}
                  className="cursor-pointer border-t transition hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">{message.id}</td>

                  <td className="px-4 py-3">
                    {getRequestTypeLabel(message.requestType)}
                  </td>

                  <td className="px-4 py-3 text-slate-700">{message.email}</td>

                  <td className="max-w-md px-4 py-3 text-slate-600 line-clamp-2">
                    {message.messagePreview}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-block h-3 w-3 rounded-full ${
                        message.allowPhoneContact ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-block h-3 w-3 rounded-full ${
                        message.consentPrivacy ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block h-3 w-3 rounded-full ${getStatusDotClass(
                          message.processingStatus
                        )}`}
                      />
                      <span>{getStatusLabel(message.processingStatus)}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(message.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {total} résultat{total > 1 ? "s" : ""}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="rounded-lg border border-slate-300 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Précédent
          </button>

          <button
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-slate-300 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>

      {showToast && newMessagesCount > 0 ? (
        <div className="fixed bottom-6 right-6 w-full max-w-sm rounded-2xl bg-slate-900 p-4 text-white shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Nouveaux messages reçus</p>
              <p className="mt-1 text-sm text-slate-200">
                {newMessagesCount} nouveau{newMessagesCount > 1 ? "x" : ""} message
                {newMessagesCount > 1 ? "s" : ""} détecté
                {newMessagesCount > 1 ? "s" : ""}.
              </p>
            </div>

            <button
              onClick={() => setShowToast(false)}
              className="text-slate-300 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleRefreshNow}
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              Recharger
            </button>

            <button
              onClick={() => setShowToast(false)}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-800"
            >
              Ignorer
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}