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

function buildPagination(currentPage: number, totalPages: number): number[] {
  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);

  for (let i = currentPage - 1; i <= currentPage + 1; i += 1) {
    if (i >= 1 && i <= totalPages) {
      pages.add(i);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
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
  const [errorMessage, setErrorMessage] = useState("");

  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const toastTimeoutRef = useRef<number | null>(null);
  const lastSeenIdRef = useRef<number>(0);
  const hasLoadedOnceRef = useRef(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [pageSize, total]);
  const paginationPages = useMemo(() => buildPagination(page, totalPages), [page, totalPages]);

  async function loadMessages(options?: { silent?: boolean }) {
    const silent = options?.silent ?? false;

    if (!silent) {
      setIsLoading(true);
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
      if (!silent) {
        setIsLoading(false);
      }
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
      // noop
    }
  }

  function handleReloadNewMessages() {
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
    document.title = newMessagesCount > 0 ? `(${newMessagesCount}) ${titleBase}` : titleBase;
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
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
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
    <div className="relative space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-white">
            Demandes de contact
          </h1>
          <p className="mt-1 text-sm text-admin-text-soft">
            Liste paginée des demandes avec tri, statut et détection automatique des nouveaux messages.
          </p>
        </div>

        <div className="rounded-2xl bg-white/[0.025] px-4 py-3 shadow-lg shadow-black/10">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-admin-text-muted">
            Nouveaux messages
          </p>
          <p className="mt-1 text-xl font-semibold text-white">{newMessagesCount}</p>
        </div>
      </div>

      <div className="rounded-[20px] bg-white/[0.025] p-3 shadow-lg shadow-black/10">
        <div className="grid gap-3 md:grid-cols-3 xl:max-w-4xl">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-admin-text-muted">
              Trier par
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setPage(1);
                setSortBy(e.target.value);
              }}
              className="w-full rounded-xl border border-white/8 bg-admin-panel-3/60 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="date">Date</option>
              <option value="id">ID</option>
              <option value="alphabetical">Ordre alphabétique</option>
              <option value="status">Statut</option>
              <option value="type">Type de demande</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-admin-text-muted">
              Ordre
            </label>
            <select
              value={sortOrder}
              onChange={(e) => {
                setPage(1);
                setSortOrder(e.target.value as "asc" | "desc");
              }}
              className="w-full rounded-xl border border-white/8 bg-admin-panel-3/60 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="desc">Décroissant</option>
              <option value="asc">Croissant</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-admin-text-muted">
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value as "" | ProcessingStatus);
              }}
              className="w-full rounded-xl border border-white/8 bg-admin-panel-3/60 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="">Tous</option>
              <option value="unprocessed">Non traité</option>
              <option value="in_progress">En cours</option>
              <option value="processed">Traité</option>
            </select>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="rounded-[24px] bg-white/[0.025] shadow-lg shadow-black/10">
        <div className="flex items-center justify-between px-4 py-4">
          <p className="text-sm text-admin-text-soft">
            {total} résultat{total > 1 ? "s" : ""}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-admin-text-soft">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]">ID</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]">Type</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]">Email</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]">Message</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]">Téléphone</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]">Consentement</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]">Statut</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]">Date</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-admin-text-soft">
                    Chargement des messages...
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-admin-text-soft">
                    Aucun message trouvé.
                  </td>
                </tr>
              ) : (
                messages.map((message) => (
                  <tr
                    key={message.id}
                    onClick={() => navigate(`/messages/${message.id}`)}
                    className="cursor-pointer border-t border-white/6 transition hover:bg-[#0d1f3c]"
                  >
                    <td className="px-4 py-3.5 text-sm font-medium text-white">{message.id}</td>
                    <td className="px-4 py-3.5 text-sm text-admin-text-soft">
                      {getRequestTypeLabel(message.requestType)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-admin-text-soft">{message.email}</td>
                    <td className="max-w-md px-4 py-3.5 text-sm text-admin-text-soft" title={message.messagePreview}>
                      <div className="line-clamp-2">{message.messagePreview}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block h-3 w-3 rounded-full ${
                          message.allowPhoneContact ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block h-3 w-3 rounded-full ${
                          message.consentPrivacy ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-3 w-3 rounded-full ${getStatusDotClass(message.processingStatus)}`} />
                        <span className="text-sm text-admin-text-soft">
                          {getStatusLabel(message.processingStatus)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-admin-text-soft">
                      {formatDate(message.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-sm text-admin-text-soft">
          Page {page} sur {totalPages}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-admin-text-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            Précédent
          </button>

          {paginationPages.map((pageNumber, index) => {
            const previousPage = paginationPages[index - 1];
            const showGap = previousPage && pageNumber - previousPage > 1;

            return (
              <div key={pageNumber} className="flex items-center gap-2">
                {showGap ? <span className="px-1 text-admin-text-muted">…</span> : null}

                <button
                  onClick={() => setPage(pageNumber)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    page === pageNumber
                      ? "bg-admin-accent text-white"
                      : "border border-white/10 bg-white/[0.03] text-admin-text-soft hover:bg-white/[0.05]"
                  }`}
                >
                  {pageNumber}
                </button>
              </div>
            );
          })}

          <button
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-admin-text-soft disabled:cursor-not-allowed disabled:opacity-50"
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

            <button onClick={() => setShowToast(false)} className="text-slate-300 hover:text-white">
              ✕
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleReloadNewMessages}
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