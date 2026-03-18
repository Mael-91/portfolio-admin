import { createContext, useCallback, useEffect, useRef, useState } from "react";
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

  const loadCount = useCallback(async () => {
    
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

      setUnprocessedCount((prev) => {
      if (prev !== count) {
        setRefreshSignal((p) => p + 1);
        return count;
      }
      return prev;
    });

      setRefreshSignal((prev) => prev + 1);
    } catch (error) {
      console.error("Polling error:", error);
    }
  }, []); 

  useEffect(() => {
    loadCount();

    const interval = setInterval(() => {
      loadCount();
    }, 15000);

    return () => clearInterval(interval);
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