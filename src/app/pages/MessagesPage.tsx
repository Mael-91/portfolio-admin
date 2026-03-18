import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  fetchMessages,
  type MessageListItem,
  type ProcessingStatus,
} from "../services/messages";
import { useMessageNotifications } from "../hooks/useMessageNotifications";

const PAGE_SIZE = 10;
//const ACTIVE_POLLING_INTERVAL_MS = 15000;
//const BACKGROUND_POLLING_INTERVAL_MS = 30000;

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

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseSortOrder(value: string | null): "asc" | "desc" {
  return value === "asc" ? "asc" : "desc";
}

function parseStatusFilter(value: string | null): "" | ProcessingStatus {
  if (
    value === "unprocessed" ||
    value === "in_progress" ||
    value === "processed"
  ) {
    return value;
  }

  return "";
}

function parseSortBy(value: string | null): string {
  const allowed = new Set(["date", "id", "alphabetical", "status", "type"]);
  return value && allowed.has(value) ? value : "date";
}

export function MessagesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get("search") || "";
  const [isSearching, setIsSearching] = useState(false);

  const [messages, setMessages] = useState<MessageListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const { unprocessedCount, refreshSignal } = useMessageNotifications();

  const page = parsePositiveInt(searchParams.get("page"), 1);
  const sortBy = parseSortBy(searchParams.get("sortBy"));
  const sortOrder = parseSortOrder(searchParams.get("sortOrder"));
  const statusFilter = parseStatusFilter(searchParams.get("status"));

  const isFetchingRef = useRef(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  );

  const paginationPages = useMemo(
    () => buildPagination(page, totalPages),
    [page, totalPages]
  );

  function updateSearchParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams);

    Object.entries(patch).forEach(([key, value]) => {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    setSearchParams(next);
  }

  function setPage(pageValue: number) {
    updateSearchParams({
      page: String(pageValue),
    });
  }

  function setSortByValue(value: string) {
    updateSearchParams({
      sortBy: value === "date" ? null : value,
      page: "1",
    });
  }

  function setSortOrderValue(value: "asc" | "desc") {
    updateSearchParams({
      sortOrder: value === "desc" ? null : value,
      page: "1",
    });
  }

  function setStatusFilterValue(value: "" | ProcessingStatus) {
    updateSearchParams({
      status: value || null,
      page: "1",
    });
  }

  async function loadMessages(options?: { silent?: boolean }) {
    const silent = options?.silent ?? false;

    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    if (!silent) {
      setIsLoading(true);
    }

    if (searchParam) {
      setIsSearching(true);
    }

    try {
      setErrorMessage("");

      const response = await fetchMessages({
        page,
        pageSize: PAGE_SIZE,
        sortBy,
        sortOrder,
        status: statusFilter || undefined,
        search: searchParam || undefined,
      });

      setMessages(response.messages);
      setTotal(response.total);
    } catch (error: any) {
      setErrorMessage(error?.message || "Impossible de charger les messages.");
    } finally {
      isFetchingRef.current = false;
      setIsSearching(false);

      if (!silent) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    loadMessages();
  }, [page, sortBy, sortOrder, statusFilter]);

  useEffect(() => {
    console.log("2 searchParam changed:", searchParam);
    if (refreshSignal === 0) return;
    if (searchParam) return;
    console.log("2 searchParam changed:", searchParam);
    loadMessages({ silent: true });
  }, [refreshSignal, searchParam]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="relative space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Demandes de contact
          </h1>
          <p className="mt-1 text-sm text-admin-text-soft">
            Liste paginée des demandes avec tri, filtres et détection des
            nouveaux messages.
          </p>
        </div>

        <div className="rounded-2xl bg-white/[0.025] px-4 py-3 shadow-lg shadow-black/10">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-admin-text-muted">
            Nouveaux messages
          </p>
          <p className="mt-1 text-lg font-semibold text-white">
            {unprocessedCount}
          </p>
        </div>
      </div>

      <div className="rounded-[20px] bg-white/[0.025] p-3 shadow-lg shadow-black/10">
        <div className="grid gap-3 md:grid-cols-3 xl:max-w-4xl">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-admin-text-muted">
              Trier par
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortByValue(e.target.value)}
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
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-admin-text-muted">
              Ordre
            </label>
            <select
              value={sortOrder}
              onChange={(e) =>
                setSortOrderValue(e.target.value as "asc" | "desc")
              }
              className="w-full rounded-xl border border-white/8 bg-admin-panel-3/60 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="desc">Décroissant</option>
              <option value="asc">Croissant</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-admin-text-muted">
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilterValue(e.target.value as "" | ProcessingStatus)
              }
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
          <table className="w-full text-left">
            <thead className="bg-white/[0.03] text-admin-text-soft">
              <tr>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  ID
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Type
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Email
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Message
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Téléphone
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Consentement
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Statut
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-admin-text-soft"
                  >
                    Chargement des messages...
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center">
                    <div className="mx-auto max-w-md">
                      <p className="text-sm font-medium text-white">
                        Aucun message trouvé
                      </p>
                      <p className="mt-1 text-sm text-admin-text-soft">
                        Essaie de modifier les filtres ou attends l’arrivée d’une
                        nouvelle demande.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                messages.map((message) => (
                  <tr
                    key={message.id}
                    onClick={() =>
                      navigate(
                        `/messages/${message.id}?${searchParams.toString()}`
                      )
                    }
                    className="cursor-pointer border-t border-white/6 transition hover:bg-[#0d1f3c]"
                  >
                    <td className="px-4 py-3.5 text-sm font-medium text-white">
                      {message.id}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-admin-text-soft">
                      {getRequestTypeLabel(message.requestType)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-admin-text-soft">
                      {message.email}
                    </td>
                    <td
                      className="max-w-md px-4 py-3.5 text-sm text-admin-text-soft"
                      title={message.messagePreview}
                    >
                      <div className="line-clamp-2">
                        {message.messagePreview}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block h-3 w-3 rounded-full ${
                          message.allowPhoneContact
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block h-3 w-3 rounded-full ${
                          message.consentPrivacy
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block h-3 w-3 rounded-full ${getStatusDotClass(
                            message.processingStatus
                          )}`}
                        />
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
            onClick={() => setPage(Math.max(1, page - 1))}
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
                {showGap ? (
                  <span className="px-1 text-admin-text-muted">…</span>
                ) : null}

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
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-admin-text-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}