import { apiFetch } from "../services/api";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { env } from "../../env";
import { useToast } from "../hooks/useToast";
import { fetchUnprocessedMessagesCount } from "../services/messages";

type ContextType = {
  unprocessedCount: number;
  newMessagesCount: number;
  refreshSignal: number;
  rgpdRefreshSignal: number;
  connectionStatus: "connecting" | "connected" | "disconnected";
  resetNewMessagesCount: () => void;
  refreshUnprocessedCount: () => Promise<void>;
};

const MessageNotificationsContext = createContext<ContextType | null>(null);

type WsMessage =
  | {
      type: "connected" | "message:count";
      unprocessedCount?: number;
      timestamp: string;
    }
  | {
      type: "message:new";
      unprocessedCount: number;
      diff?: number;
      timestamp: string;
    }
  | {
      type: "rgpd:purge";
      deletedCount: number;
      timestamp: string;
    };

export function MessageNotificationsProvider({
  children,
  enabled,
}: {
  children: React.ReactNode;
  enabled: boolean;
}) {
  const { showToast } = useToast();

  const [unprocessedCount, setUnprocessedCount] = useState(0);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [rgpdRefreshSignal, setRgpdRefreshSignal] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const previousCountRef = useRef<number | null>(null);
  const showToastRef = useRef(showToast);
  const lastRgpdToastKeyRef = useRef<string | null>(null);

  function resetNewMessagesCount() {
    setNewMessagesCount(0);
  }

  async function refreshUnprocessedCount() {
    try {
      const count = await fetchUnprocessedMessagesCount();
      previousCountRef.current = count;

      setUnprocessedCount((prev) => {
        if (prev !== count) {
          setRefreshSignal((value) => value + 1);
          return count;
        }
        return prev;
      });
    } catch (error) {
      console.error("Erreur rafraîchissement compteur messages:", error);
    }
  }

  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const controller = new AbortController();

    function retry() {
      if (!cancelled) reconnectTimeoutRef.current = window.setTimeout(() => void connect(), 3000);
    }

    async function connect() {
      setConnectionStatus("connecting");
      let ws: WebSocket;
      try {
        const { ticket } = await apiFetch<{ ticket: string }>("/api/auth/ws-ticket", {
          method: "POST",
          signal: controller.signal,
        });
        if (cancelled) return;
        ws = new WebSocket(env.websocketUrl, ["rbac-v1", `ticket.${ticket}`]);
      } catch (error) {
        if (cancelled) return;
        setConnectionStatus("disconnected");
        if (error instanceof Error && "status" in error && error.status === 403) {
          window.dispatchEvent(new Event("admin-access-changed"));
        } else {
          retry();
        }
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus("connected");
      };

      ws.onmessage = (event) => {
        try {
          const data: WsMessage = JSON.parse(event.data);

          if (data.type === "connected" || data.type === "message:count") {
            if (data.unprocessedCount !== undefined) {
              previousCountRef.current = data.unprocessedCount;
              setUnprocessedCount(data.unprocessedCount);
            }
            if (data.type === "connected") setNewMessagesCount(0);
            setRefreshSignal((value) => value + 1);
            return;
          }

          if (data.type === "message:new") {
            if (
              previousCountRef.current !== null &&
              data.unprocessedCount > previousCountRef.current
            ) {
              const diff = data.diff ?? data.unprocessedCount - previousCountRef.current;

              setNewMessagesCount((prev) => prev + diff);

              showToastRef.current({
                title: "Nouveaux messages reçus",
                description:
                  diff === 1
                    ? "1 nouveau message a été détecté."
                    : `${diff} nouveaux messages ont été détectés.`,
                variant: "info",
              });
            }

            previousCountRef.current = data.unprocessedCount;

            setUnprocessedCount((prev) => {
              if (prev !== data.unprocessedCount) {
                setRefreshSignal((value) => value + 1);
                setNewMessagesCount((prev) => prev + 1);
                return data.unprocessedCount;
              }

              return prev;
            });
          }

          if (data.type === "rgpd:purge") {
            setRgpdRefreshSignal((value) => value + 1);
            const toastKey = `${data.timestamp}:${data.deletedCount}`;

            if (lastRgpdToastKeyRef.current !== toastKey) {
              lastRgpdToastKeyRef.current = toastKey;

              showToastRef.current({
                title: "Purge RGPD effectuée",
                description:
                  data.deletedCount === 1
                    ? "1 message a été supprimé."
                    : `${data.deletedCount} messages ont été supprimés.`,
                variant: "info",
              });
            }

            return;
          }
        } catch (error) {
          console.error("WebSocket parse error:", error);
        }
      };

      ws.onclose = (event) => {
        if (cancelled) return;
        setConnectionStatus("disconnected");

        if (event.code === 1008 || event.code === 4001) {
          previousCountRef.current = null;
          setUnprocessedCount(0);
          setNewMessagesCount(0);
          window.dispatchEvent(new Event("admin-access-changed"));
        }
        retry();
      };

      ws.onerror = () => {
        setConnectionStatus("disconnected");
      };
    }

    void connect();

    return () => {
      cancelled = true;
      controller.abort();

      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }

      wsRef.current?.close();
    };
  }, [enabled]);

  const value = useMemo(
  () => ({
    unprocessedCount,
    newMessagesCount,
    refreshSignal,
    rgpdRefreshSignal,
    connectionStatus,
    resetNewMessagesCount,
    refreshUnprocessedCount,
  }),
  [
    unprocessedCount,
    newMessagesCount,
    refreshSignal,
    rgpdRefreshSignal,
    connectionStatus,
  ]
);

  return (
    <MessageNotificationsContext.Provider value={value}>
      {children}
    </MessageNotificationsContext.Provider>
    
  );
}

export function useMessageNotifications() {
  const context = useContext(MessageNotificationsContext);

  if (!context) {
    throw new Error(
      "useMessageNotifications must be used within MessageNotificationsProvider"
    );
  }

  return context;
}