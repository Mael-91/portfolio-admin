import { useEffect, useState } from "react";
import { fetchUnprocessedMessagesCount } from "../services/messages";

export function useMessageCounter() {
  const [count, setCount] = useState(0);

  async function load() {
    try {
      const total = await fetchUnprocessedMessagesCount();
      setCount(total);
    } catch (error) {
      console.error("Erreur compteur messages :", error);
    }
  }

  useEffect(() => {
    load();

    const interval = setInterval(load, 15000);

    return () => clearInterval(interval);
  }, []);

  return count;
}