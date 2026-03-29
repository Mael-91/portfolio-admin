import { useEffect, useState } from "react";
import {
  fetchServicesContent,
  saveServicesContent,
  type ServiceCard,
  type ServiceType,
} from "../services/servicesContent";
import { LegalEditor } from "../components/editor/LegalEditor";
import { useToast } from "../hooks/useToast";


type EditableCard = ServiceCard;

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? "bg-green-500" : "bg-white/20"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export function ServicesContentPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ServiceType>("pro");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [introEnabled, setIntroEnabled] = useState(false);
  const [introHtml, setIntroHtml] = useState("");

  const [cards, setCards] = useState<EditableCard[]>([]);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function load(serviceType: ServiceType) {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data = await fetchServicesContent(serviceType);
      setIntroEnabled(data.section.introEnabled);
      setIntroHtml(data.section.introHtml ?? "");
      setCards(data.cards);
    } catch (error: any) {
      setErrorMessage(error?.message || "Erreur chargement prestations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(activeTab);
  }, [activeTab]);

  function updateCard(cardId: number, updater: (card: EditableCard) => EditableCard) {
    setCards((prev) =>
      prev.map((card) => (card.id === cardId ? updater(card) : card))
    );
  }

  async function handleSave() {
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await saveServicesContent({
        serviceType: activeTab,
        introEnabled,
        introHtml,
        cards: cards.map((card) => ({
          id: card.id,
          title: card.title,
          bodyEnabled: card.bodyEnabled,
          bodyHtml: card.bodyHtml,
          bulletsEnabled: card.bulletsEnabled,
          priceEnabled: card.priceEnabled,
          priceLabel: card.priceLabel,
          bullets: card.bullets,
        })),
      });

      showToast({
        title: "Prestations enregistrées",
        description:
          activeTab === "pro"
            ? "Les prestations professionnelles ont été mises à jour."
            : "Les prestations particuliers ont été mises à jour.",
        variant: "success",
      });

      await load(activeTab);
    } catch (error: any) {
      showToast({
        title: "Erreur d’enregistrement",
        description:
          error?.message || "Impossible d’enregistrer les prestations.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 text-white">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Prestations
        </h1>
        <p className="mt-1 text-sm text-admin-text-soft">
          Configure les contenus des onglets Professionnels et Particuliers.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("pro")}
          className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
            activeTab === "pro"
              ? "bg-white/8 text-white shadow-inner ring-1 ring-white/5"
              : "text-admin-text-soft hover:bg-white/5 hover:text-white"
          }`}
        >
          Professionnels
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("private")}
          className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
            activeTab === "private"
              ? "bg-white/8 text-white shadow-inner ring-1 ring-white/5"
              : "text-admin-text-soft hover:bg-white/5 hover:text-white"
          }`}
        >
          Particuliers
        </button>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {errorMessage}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl bg-white/[0.03] p-5 text-sm text-admin-text-soft">
          Chargement...
        </div>
      ) : (
        <>
          <section className="rounded-2xl bg-white/[0.03] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Texte d’introduction</h2>
              <Toggle checked={introEnabled} onChange={setIntroEnabled} />
            </div>

            <LegalEditor content={introHtml} onChange={setIntroHtml} />
          </section>

          <div className="space-y-6">
            {cards.map((card) => (
              <section
                key={card.id}
                className="rounded-2xl bg-white/[0.03] p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">
                    Carte {card.cardIndex}
                  </h2>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-admin-text-soft">
                    Titre
                  </label>
                  <input
                    value={card.title}
                    onChange={(e) =>
                      updateCard(card.id, (current) => ({
                        ...current,
                        title: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-white/20"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-admin-text-soft">
                    Afficher le texte
                  </span>
                  <Toggle
                    checked={card.bodyEnabled}
                    onChange={(value) =>
                      updateCard(card.id, (current) => ({
                        ...current,
                        bodyEnabled: value,
                      }))
                    }
                  />
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    card.bodyEnabled ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="pt-2">
                    <LegalEditor
                      content={card.bodyHtml}
                      onChange={(value) =>
                        updateCard(card.id, (current) => ({
                          ...current,
                          bodyHtml: value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-admin-text-soft">
                    Afficher la liste à puces
                  </span>
                  <Toggle
                    checked={card.bulletsEnabled}
                    onChange={(value) =>
                      updateCard(card.id, (current) => ({
                        ...current,
                        bulletsEnabled: value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  {card.bullets.map((bullet, index) => (
                    <input
                      key={`${card.id}-${index}`}
                      value={bullet}
                      onChange={(e) =>
                        updateCard(card.id, (current) => ({
                          ...current,
                          bullets: current.bullets.map((item, bulletIndex) =>
                            bulletIndex === index ? e.target.value : item
                          ),
                        }))
                      }
                      placeholder={`Puces ${index + 1}`}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-white/20"
                    />
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      updateCard(card.id, (current) => ({
                        ...current,
                        bullets: [...current.bullets, ""],
                      }))
                    }
                    className="rounded-xl bg-white/[0.06] px-3 py-2 text-sm text-white transition hover:bg-white/[0.1]"
                  >
                    Ajouter une puce
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-admin-text-soft">
                    Afficher le prix
                  </span>
                  <Toggle
                    checked={card.priceEnabled}
                    onChange={(value) =>
                      updateCard(card.id, (current) => ({
                        ...current,
                        priceEnabled: value,
                      }))
                    }
                  />
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    card.priceEnabled ? "max-h-40 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="pt-2">
                    <label className="mb-1 block text-sm text-admin-text-soft">
                      Libellé du prix
                    </label>
                    <input
                      value={card.priceLabel}
                      onChange={(e) =>
                        updateCard(card.id, (current) => ({
                          ...current,
                          priceLabel: e.target.value,
                        }))
                      }
                      placeholder='Ex: À partir de 250€ / session'
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-white/20"
                    />
                  </div>
                </div>
              </section>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`rounded-2xl px-5 py-2.5 text-sm font-medium transition ${
                saving
                  ? "bg-white/10 text-white/60 cursor-not-allowed"
                  : "bg-admin-accent text-white hover:brightness-110 active:scale-[0.98]"
              }`}
            >
              {saving ? "Enregistrement..." : "Enregistrer les prestations"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}