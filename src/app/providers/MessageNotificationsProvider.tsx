import { createContext, useEffect, useRef, useState } from "react";
import { fetchUnprocessedMessagesCount } from "../services/messages";
import { useToast } from "../hooks/useToast";

type ContextType = {
  unprocessedCount: number;
};

export const MessageNotificationsContext = createContext<ContextType | null>(null);

export function MessageNotificationsProvider({ children }: { children: React.ReactNode }) {
  const [unprocessedCount, setUnprocessedCount] = useState(0);

  const previousCountRef = useRef(0);
  const hasInitializedRef = useRef(false);

  const { showToast } = useToast();

  async function loadCount() {
    try {
      const count = await fetchUnprocessedMessagesCount();

      // Détection nouveaux messages
      if (hasInitializedRef.current && count > previousCountRef.current) {
        const diff = count - previousCountRef.current;

        showToast({
          title: "Nouveau message",
          description:
            diff === 1
              ? "1 nouveau message reçu"
              : `${diff} nouveaux messages reçus`,
          variant: "success",
        });
      }

      previousCountRef.current = count;
      setUnprocessedCount(count);

      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
      }
    } catch (error) {
      console.error("Erreur polling messages :", error);
    }
  }

  useEffect(() => {
    loadCount();

    const interval = setInterval(loadCount, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <MessageNotificationsContext.Provider
      value={{
        unprocessedCount,
      }}
    >
      {children}
    </MessageNotificationsContext.Provider>
  );
}