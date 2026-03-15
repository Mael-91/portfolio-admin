import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (params: {
    title: string;
    description?: string;
    variant?: ToastVariant;
  }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function getToastStyles(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return {
        iconBg: "bg-green-500/20 text-green-400",
        border: "border-green-500/20",
      };
    case "error":
      return {
        iconBg: "bg-red-500/20 text-red-400",
        border: "border-red-500/20",
      };
    case "info":
    default:
      return {
        iconBg: "bg-admin-accent-soft text-admin-accent",
        border: "border-white/10",
      };
  }
}

function ToastIcon({ variant }: { variant: ToastVariant }) {
  if (variant === "success") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m5 13 4 4L19 7" />
      </svg>
    );
  }

  if (variant === "error") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01" />
      <path d="M11 12h1v4h1" />
    </svg>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(1);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      title,
      description,
      variant = "info",
    }: {
      title: string;
      description?: string;
      variant?: ToastVariant;
    }) => {
      const id = nextIdRef.current++;
      const toast: ToastItem = {
        id,
        title,
        description,
        variant,
      };

      setToasts((current) => [...current, toast]);

      window.setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.variant);

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-2xl border bg-[#0f1f3d] p-4 shadow-2xl shadow-black/40 ${styles.border}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${styles.iconBg}`}
                >
                  <ToastIcon variant={toast.variant} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-1 text-sm leading-6 text-admin-text-soft">
                      {toast.description}
                    </p>
                  ) : null}
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-admin-text-muted transition hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }

  return context;
}