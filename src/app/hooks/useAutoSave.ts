import { useEffect, useRef, useState } from "react";

export type AutoSaveStatus = "idle" | "dirty" | "saving" | "error";

type UseAutoSaveOptions<T> = {
  value: T;
  onSave: (value: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
  isEqual?: (a: T, b: T) => boolean;
};

export function useAutoSave<T>({
  value,
  onSave,
  delay = 800,
  enabled = true,
  isEqual,
}: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");

  const lastSavedValueRef = useRef<T>(value);
  const hasInitializedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const isSavingRef = useRef(false);

  function defaultIsEqual(a: T, b: T) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  const compare = isEqual ?? defaultIsEqual;

  function markAsSaved(nextValue: T) {
    lastSavedValueRef.current = nextValue;
    setStatus("idle");
  }

  async function saveNow() {
    if (!enabled) {
      return;
    }

    if (isSavingRef.current) {
      return;
    }

    const hasChanges = !compare(value, lastSavedValueRef.current);

    if (!hasChanges) {
      setStatus("idle");
      return;
    }

    isSavingRef.current = true;
    setStatus("saving");

    try {
      await onSave(value);
      lastSavedValueRef.current = value;
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      throw error;
    } finally {
      isSavingRef.current = false;
    }
  }

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      lastSavedValueRef.current = value;
      return;
    }

    const hasChanges = !compare(value, lastSavedValueRef.current);

    if (!hasChanges) {
      setStatus("idle");
      return;
    }

    setStatus("dirty");

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      saveNow().catch(() => {
        // l'erreur est gérée via le status, et peut être gérée par le composant appelant
      });
    }, delay);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, enabled]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    status,
    saveNow,
    markAsSaved,
    lastSavedValue: lastSavedValueRef.current,
  };
}