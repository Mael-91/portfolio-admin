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

type ContextType = {
  unprocessedCount: number;
  refreshSignal: number;
  connectionStatus: "connecting" | "connected" | "disconnected";
};

const MessageNotificationsContext = createContext<ContextType | null>(null);

type WsMessage =
  | {
      type: "connected";
      unprocessedCount: number;
      timestamp: string;
    }
  | {
      type: "message:new";
      unprocessedCount: number;
      diff?: number;
      timestamp: string;
    };

export function MessageNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showToast } = useToast();

  const [unprocessedCount, setUnprocessedCount] = useState(0);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const isUnmountedRef = useRef(false);
  const previousCountRef = useRef<number | null>(null);

  useEffect(() => {
    isUnmountedRef.current = false;

    function connect() {
      setConnectionStatus("connecting");

      const ws = new WebSocket(env.websocketUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus("connected");
      };

      ws.onmessage = (event) => {
        try {
          const data: WsMessage = JSON.parse(event.data);

          if (data.type === "connected") {
            previousCountRef.current = data.unprocessedCount;
            setUnprocessedCount(data.unprocessedCount);
            return;
          }

          if (data.type === "message:new") {
            if (
              previousCountRef.current !== null &&
              data.unprocessedCount > previousCountRef.current
            ) {
              const diff =
                data.diff ?? data.unprocessedCount - previousCountRef.current;

              showToast({
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
                return data.unprocessedCount;
              }

              return prev;
            });
          }
        } catch (error) {
          console.error("WebSocket parse error:", error);
        }
      };

      ws.onclose = () => {
        setConnectionStatus("disconnected");

        if (isUnmountedRef.current) {
          return;
        }

        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = () => {
        setConnectionStatus("disconnected");
      };
    }

    connect();

    return () => {
      isUnmountedRef.current = true;

      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }

      wsRef.current?.close();
    };
  }, [showToast]);

  const value = useMemo(
    () => ({
      unprocessedCount,
      refreshSignal,
      connectionStatus,
    }),
    [unprocessedCount, refreshSignal, connectionStatus]
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