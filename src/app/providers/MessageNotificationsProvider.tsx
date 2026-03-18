import { createContext, useEffect, useRef, useState } from "react";
import { fetchUnprocessedMessagesCount } from "../services/messages";
import { useToast } from "../hooks/useToast";


export type MessageNotificationsContextType = {
  unprocessedCount: number;
  refreshSignal: number;
};

export const MessageNotificationsContext =
  createContext<MessageNotificationsContextType | null>(null);

export function MessageNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unprocessedCount, setUnprocessedCount] = useState(0);
  const [refreshSignal, setRefreshSignal] = useState(0);

  const previousCountRef = useRef<number | null>(null);
  const { showToast } = useToast();

  async function loadCount() {
    try {
      const count = await fetchUnprocessedMessagesCount();

      if (previousCountRef.current !== null && count > previousCountRef.current) {
        const diff = count - previousCountRef.current;

        showToast({
          title: "Nouveaux messages reçus",
          description:
            diff === 1
              ? "1 nouveau message a été détecté."
              : `${diff} nouveaux messages ont été détectés.`,
          variant: "info",
        });
      }

      previousCountRef.current = count;
      setUnprocessedCount((prev) => (prev !== count ? count : prev));
      setRefreshSignal((prev) => prev + 1);
    } catch (error) {
      console.error("Polling error:", error);
    }
  }

  useEffect(() => {
    loadCount();

    const interval = window.setInterval(loadCount, 15000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <MessageNotificationsContext.Provider
      value={{
        unprocessedCount,
        refreshSignal,
      }}
    >
      {children}
    </MessageNotificationsContext.Provider>
  );
}