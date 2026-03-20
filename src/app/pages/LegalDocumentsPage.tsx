import { useEffect, useMemo, useState } from "react";
import {
  fetchCurrentLegalDocument,
  fetchDraftLegalDocument,
  fetchLegalHistory,
  fetchLegalTypes,
  getLegalDownloadUrl,
  publishLegalDocument,
  saveLegalDraft,
  type LegalDocumentType,
} from "../services/legal";
import { LegalEditor } from "../components/editor/LegalEditor";
import { ConfirmLegalPublishModal } from "../components/legal/ConfirmLegalPublishModal";

type LegalTypeItem = {
  value: LegalDocumentType;
  label: string;
};

type LegalDocumentItem = {
  id: number;
  version_label: string;
  created_at: string;
  published_at: string | null;
  content_html?: string;
};

export function LegalDocumentsPage() {
  const [types, setTypes] = useState<LegalTypeItem[]>([]);
  const [selectedType, setSelectedType] =
    useState<LegalDocumentType>("privacy_content");

  const [currentDocument, setCurrentDocument] = useState<LegalDocumentItem | null>(null);
  const [draftDocument, setDraftDocument] = useState<LegalDocumentItem | null>(null);
  const [history, setHistory] = useState<LegalDocumentItem[]>([]);

  const [editorContent, setEditorContent] = useState("<p></p>");
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const currentDownloadId = useMemo(() => {
    if (draftDocument?.id) {
      return draftDocument.id;
    }

    return currentDocument?.id ?? null;
  }, [draftDocument, currentDocument]);

  async function loadTypes() {
    const response = await fetchLegalTypes();
    setTypes(response.types);
  }

  async function loadDocumentData(documentType: LegalDocumentType) {
    setLoading(true);

    try {
      const [currentRes, draftRes, historyRes] = await Promise.all([
        fetchCurrentLegalDocument(documentType),
        fetchDraftLegalDocument(documentType),
        fetchLegalHistory(documentType),
      ]);

      setCurrentDocument(currentRes.document);
      setDraftDocument(draftRes.document);
      setHistory(historyRes.documents ?? []);

      if (draftRes.document?.content_html) {
        setEditorContent(draftRes.document.content_html);
      } else if (currentRes.document?.content_html) {
        setEditorContent(currentRes.document.content_html);
      } else {
        setEditorContent("<p></p>");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDraft() {
    setSavingDraft(true);

    try {
      const response = await saveLegalDraft({
        documentType: selectedType,
        contentHtml: editorContent,
      });

      setDraftDocument(response.document);
      setSuccessMessage("Brouillon enregistré");
    } finally {
      setSavingDraft(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);

    try {
      const response = await publishLegalDocument({
        documentType: selectedType,
        contentHtml: editorContent,
      });

      setCurrentDocument(response.document);
      setDraftDocument(null);
      setShowPublishModal(false);
      setSuccessMessage("Document publié");

      await loadDocumentData(selectedType);
    } finally {
      setPublishing(false);
    }
  }

  useEffect(() => {
    loadTypes();
  }, []);

  useEffect(() => {
    loadDocumentData(selectedType);
  }, [selectedType]);

  return (
    <div className="space-y-6 text-white">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Documents légaux
        </h1>
        <p className="mt-1 text-sm text-admin-text-soft">
          Gestion des brouillons, publications et historique des documents.
        </p>
      </div>

      {successMessage ? (
        <div className="rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {successMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
        <aside className="rounded-2xl bg-white/[0.03] p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-admin-text-muted">
            Documents
          </p>

          <div className="space-y-2">
            {types.map((type) => {
              const active = type.value === selectedType;

              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedType(type.value)}
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm transition ${
                    active
                      ? "bg-admin-accent text-white"
                      : "bg-white/[0.03] text-admin-text-soft hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="space-y-4">
          {loading ? (
            <div className="rounded-2xl bg-white/[0.03] p-5 text-sm text-admin-text-soft">
              Chargement...
            </div>
          ) : (
            <>
              <LegalEditor content={editorContent} onChange={setEditorContent} />

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={savingDraft}
                  className="rounded-xl bg-white/[0.06] px-4 py-2 text-sm text-white transition hover:bg-white/[0.1]"
                >
                  {savingDraft ? "Enregistrement..." : "Enregistrer en brouillon"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowPublishModal(true)}
                  disabled={publishing}
                  className="rounded-xl bg-admin-accent px-4 py-2 text-sm text-white transition hover:brightness-110"
                >
                  Mettre à jour
                </button>

                {currentDownloadId ? (
                  <a
                    href={getLegalDownloadUrl(currentDownloadId)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] px-4 py-2 text-sm text-white transition hover:bg-white/[0.1]"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M12 3v12" />
                      <path d="m7 10 5 5 5-5" />
                      <path d="M5 21h14" />
                    </svg>
                    Télécharger
                  </a>
                ) : null}
              </div>
            </>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white/[0.03] p-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-admin-text-muted">
              Version actuelle
            </p>

            <div className="mt-3 space-y-2 text-sm">
              <div>
                <span className="text-admin-text-muted">Version :</span>{" "}
                <span className="text-white">
                  {currentDocument?.version_label ?? "Aucune"}
                </span>
              </div>

              <div>
                <span className="text-admin-text-muted">Date :</span>{" "}
                <span className="text-white">
                  {currentDocument?.published_at
                    ? new Date(currentDocument.published_at).toLocaleString("fr-FR")
                    : "-"}
                </span>
              </div>

              <div>
                <span className="text-admin-text-muted">Brouillon :</span>{" "}
                <span className="text-white">{draftDocument ? "Oui" : "Non"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.03] p-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-admin-text-muted">
              Historique des 5 dernières versions
            </p>

            <div className="mt-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-admin-text-soft">
                  Aucun historique disponible.
                </p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-white/[0.03] px-4 py-3 text-sm"
                  >
                    <div className="font-medium text-white">
                      {item.version_label}
                    </div>
                    <div className="mt-1 text-admin-text-soft">
                      {new Date(item.published_at ?? item.created_at).toLocaleString("fr-FR")}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      <ConfirmLegalPublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onConfirm={handlePublish}
        isSubmitting={publishing}
      />
    </div>
  );
}