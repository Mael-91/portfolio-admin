import { cn } from "@/lib/utils";

type SwitchProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  variant?: "default" | "success";
  size?: "sm" | "md";
};

export function Switch({
  checked,
  onChange,
  disabled,
  variant = "default",
  size = "md",
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "relative inline-flex items-center rounded-full transition cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent",

        // tailles
        size === "md" && "h-7 w-12",
        size === "sm" && "h-6 w-11",

        // couleurs
        checked && variant === "default" && "bg-admin-accent",
        checked && variant === "success" && "bg-green-500",
        !checked && "bg-white/15",

        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "inline-block rounded-full bg-white transition transform",

          // tailles du bouton interne
          size === "md" && "h-5 w-5",
          size === "sm" && "h-4 w-4",

          // position
          checked
            ? size === "md"
              ? "translate-x-6"
              : "translate-x-6"
            : "translate-x-1"
        )}
      />
    </button>
  );
}