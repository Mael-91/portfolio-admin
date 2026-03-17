import { useEffect, useState } from "react";
import { fetchMessages } from "../services/messages";
import { useMessageNotifications } from "../hooks/useMessageNotifications";

type MessageListItem = {
  id: number;
  requestType: string;
  email: string;
  messagePreview: string;
  allowPhoneContact: boolean;
  consentPrivacy: boolean;
  processingStatus: "unprocessed" | "in_progress" | "processed";
  createdAt: string;
};

export function MessagesPage() {
  const [messages, setMessages] = useState<MessageListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { unprocessedCount, refreshSignal } = useMessageNotifications();

  async function loadMessages() {
    try {
      setLoading(true);

      const response = await fetchMessages({
        page: 1,
        pageSize: 10,
      });

      setMessages(response.messages);
    } catch (error) {
      console.error("Erreur chargement messages :", error);
    } finally {
      setLoading(false);
    }
  }

  // Chargement initial
  useEffect(() => {
    loadMessages();
  }, []);

  // Rafraîchissement via polling global
  useEffect(() => {
    loadMessages();
  }, [refreshSignal]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">
          Demandes de contact
        </h1>
        <p className="text-sm text-admin-text-muted">
          Liste des messages reçus
        </p>
      </div>

      {/* Bloc messages non traités (synchronisé globalement) */}
      {unprocessedCount > 0 && (
        <div className="rounded-xl bg-blue-500/10 px-4 py-3 text-sm text-blue-400">
          {unprocessedCount === 1
            ? "1 message non traité"
            : `${unprocessedCount} messages non traités`}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white/[0.02]">
        {loading ? (
          <div className="px-6 py-6 text-sm text-admin-text-muted">
            Chargement...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-admin-text-muted">
              <tr>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Message</th>
                <th className="px-6 py-3">Statut</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>

            <tbody>
              {messages.map((msg) => (
                <tr
                  key={msg.id}
                  className="border-t border-white/5 hover:bg-white/[0.03]"
                >
                  <td className="px-6 py-3">{msg.requestType}</td>

                  <td className="px-6 py-3">{msg.email}</td>

                  <td className="px-6 py-3 text-admin-text-soft">
                    {msg.messagePreview}
                  </td>

                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        msg.processingStatus === "processed"
                          ? "bg-green-500/20 text-green-400"
                          : msg.processingStatus === "in_progress"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {msg.processingStatus}
                    </span>
                  </td>

                  <td className="px-6 py-3">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}