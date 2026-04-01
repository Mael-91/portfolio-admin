import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "dangerSoft";
  size?: "sm" | "md" | "lg";
  align?: "center" | "left" | "right";
  isLoading?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  align = "center",
  isLoading = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",

        // sizes
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-5 py-3 text-base",

        // variants
        variant === "primary" &&
          "bg-admin-accent text-white hover:brightness-110 disabled:opacity-60",
        variant === "secondary" &&
          "bg-white/[0.06] text-white hover:bg-white/[0.1]",
        variant === "danger" &&
          "bg-red-500 text-white hover:bg-red-600",
        variant === "ghost" &&
          "text-admin-text-soft hover:bg-white/5 hover:text-white",
        variant === "dangerSoft" &&
          "bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300",

        className

        align === "center && justify-center",
        align === "left && justify-start",
        align === "right && justify-end",
      )}
      {...props}
    >
      {isLoading ? "..." : children}
    </button>
  );
}