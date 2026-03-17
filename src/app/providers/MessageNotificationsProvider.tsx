import { createContext, useEffect, useRef, useState } from "react";
import { fetchUnprocessedMessagesCount } from "../services/messages";
import { useToast } from "../hooks/useToast";

type ContextType = {
  unprocessedCount: number;
};

export const MessageNotificationsContext = createContext<ContextType | null>(null);

export function MessageNotificationsProvider({ children }: { children: React.ReactNode }) {
  const [unprocessedCount, setUnprocessedCount] = useState(0);

  const previousCountRef = useRef<number | null>(null);
  const { showToast } = useToast();

  async function loadCount() {
    try {
      const count = await fetchUnprocessedMessagesCount();

      console.log("Polling count:", count);

      if (previousCountRef.current !== null && count > previousCountRef.current) {
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
    } catch (err) {
      console.error("Polling error:", err);
    }
  }

  useEffect(() => {
    loadCount();

    const interval = setInterval(loadCount, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <MessageNotificationsContext.Provider value={{ unprocessedCount }}>
      {children}
    </MessageNotificationsContext.Provider>
  );
}