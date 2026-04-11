import { useEffect, useMemo, useState } from "react";
import {
  fetchServicesContent,
  saveServicesContent,
  type ServiceCard,
  type ServiceType,
} from "../services/servicesContent";
import { LegalEditor } from "../components/editor/LegalEditor";
import { useToast } from "../hooks/useToast";
import { useAutoSave } from "../hooks/useAutoSave";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Switch } from "../components/ui/Switch";
import { useFeedback } from "../hooks/useFeedback";

type EditableCard = ServiceCard;

export function ServicesContentPage() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ServiceType>("pro");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [introEnabled, setIntroEnabled] = useState(false);
  const [introHtml, setIntroHtml] = useState("");

  const [cards, setCards] = useState<EditableCard[]>([]);

  const { setError, reset } = useFeedback();

  const autoSavePayload = useMemo(
    () => ({
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
    }),
    [activeTab, introEnabled, introHtml, cards]
  );

  const { saveNow, markAsSaved } = useAutoSave({
    value: autoSavePayload,
    delay: 1000,
    enabled: cards.length === 3,
    onSave: async (payload) => {
      try {
        await saveServicesContent(payload);
      } catch (error: any) {
        showToast({
          title: "Erreur d’enregistrement",
          description: "Impossible d’enregistrer les prestations.",
          variant: "error",
        });

        throw error;
      }
    },
  });

  async function load(serviceType: ServiceType) {
    setLoading(true);
    reset();

    try {
      const data = await fetchServicesContent(serviceType);
      setIntroEnabled(data.section.introEnabled);
      setIntroHtml(data.section.introHtml ?? "");
      setCards(data.cards);

      markAsSaved({
        serviceType,
        introEnabled: data.section.introEnabled,
        introHtml: data.section.introHtml ?? "",
        cards: data.cards.map((card: ServiceCard) => ({
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
    } catch (error: any) {
      setError();
      showToast({
        title: "Erreur",
        description: "Impossible de charger les prestations. Veuillez réessayer.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(activeTab);
  }, [activeTab]);

  function updateCard(
    cardId: number,
    updater: (card: EditableCard) => EditableCard
  ) {
    setCards((prev) =>
      prev.map((card) => (card.id === cardId ? updater(card) : card))
    );
  }

  async function handleSave() {
    setSaving(true);
    reset();

    try {
      await saveNow();

      showToast({
        title: "Prestations enregistrées",
        description:
          activeTab === "pro"
            ? "Les prestations professionnelles ont été mises à jour."
            : "Les prestations particuliers ont été mises à jour.",
        variant: "success",
      });

      await load(activeTab);
    } catch {
      // géré dans le hook
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 text-white">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Prestations</h1>
        <p className="mt-1 text-sm text-admin-text-soft">
          Configure les contenus des onglets Professionnels et Particuliers.
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          type="button"
          onClick={() => setActiveTab("pro")}
          className={`rounded-2xl font-medium ${
            activeTab === "pro"
              ? "bg-white/8 text-white shadow-inner ring-1 ring-white/5"
              : "text-admin-text-soft hover:bg-white/5 hover:text-white"
          }`}
        >
          Professionnels
        </Button>
        <Button
          variant="secondary"
          type="button"
          onClick={() => setActiveTab("private")}
          className={`rounded-2xl font-medium ${
            activeTab === "private"
              ? "bg-white/8 text-white shadow-inner ring-1 ring-white/5"
              : "text-admin-text-soft hover:bg-white/5 hover:text-white"
          }`}
        >
          Particuliers
        </Button>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white/[0.03] p-5 text-sm text-admin-text-soft">
          Chargement...
        </div>
      ) : (
        <>
          <section className="rounded-2xl bg-white/[0.03] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Texte d’introduction</h2>
              <Switch variant="success" checked={introEnabled} onChange={setIntroEnabled} />
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                introEnabled
                  ? "max-h-[1000px] opacity-100"
                  : "max-h-0 opacity-0 pointer-events-none"
              }`}
            >
              <div className="pt-2">
                <LegalEditor content={introHtml} onChange={setIntroHtml} />
              </div>
            </div>
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
                  <Input
                    value={card.title}
                    onChange={(e) =>
                      updateCard(card.id, (current) => ({
                        ...current,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Titre de la carte"
                    className="px-3 outline-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-admin-text-soft">
                    Afficher le texte
                  </span>
                  <Switch variant="success" checked={card.bodyEnabled} onChange={(value) =>
                      updateCard(card.id, (current) => ({
                        ...current,
                        bodyEnabled: value,
                      }))} 
                    />
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    card.bodyEnabled
                      ? "max-h-[1000px] opacity-100"
                      : "max-h-0 opacity-0 pointer-events-none"
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
                  <Switch variant="success" checked={card.bulletsEnabled} onChange={(value) =>
                      updateCard(card.id, (current) => ({
                        ...current,
                        bulletsEnabled: value,
                      }))} 
                    />
                </div>

                <div className="space-y-2">
                  {card.bullets.map((bullet, index) => (
                    <Input
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
                      className="px-3 outline-none"
                    />
                  ))}

                  <Button variant="secondary"
                    type="button"
                    onClick={() =>
                      updateCard(card.id, (current) => ({
                        ...current,
                        bullets: [...current.bullets, ""],
                      }))
                    }
                  >
                    Ajouter une puce
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-admin-text-soft">
                    Afficher le prix
                  </span>
                  <Switch variant="success" checked={card.priceEnabled} onChange={(value) =>
                      updateCard(card.id, (current) => ({
                        ...current,
                        priceEnabled: value,
                      }))} 
                    />
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    card.priceEnabled
                      ? "max-h-40 opacity-100"
                      : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="pt-2">
                    <label className="mb-1 block text-sm text-admin-text-soft">
                      Libellé du prix
                    </label>
                    <Input
                      value={card.priceLabel}
                      onChange={(e) =>
                        updateCard(card.id, (current) => ({
                          ...current,
                          priceLabel: e.target.value,
                        }))
                      }
                      placeholder="Ex: À partir de 250€ / session"
                      className="px-3 outline-none"
                    />
                  </div>
                </div>
              </section>
            ))}
          </div>

          <div className="flex justify-end">
            <Button
              size="lg"
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`rounded-2xl py-2.5 text-sm font-medium  ${
                saving
                  ? "cursor-not-allowed bg-white/10 text-white/60"
                  : "bg-admin-accent text-white hover:brightness-110 active:scale-[0.98]"
              }`}
            >
              {saving ? "Enregistrement..." : "Enregistrer les prestations"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}