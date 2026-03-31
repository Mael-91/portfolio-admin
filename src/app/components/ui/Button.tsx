import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/[0.1]",

        // sizes
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-5 py-3 text-base",

        // variants
        variant === "primary" &&
          "bg-admin-accent text-white hover:opacity-90",
        variant === "secondary" &&
          "bg-white/10 text-white hover:bg-white/20",
        variant === "danger" &&
          "bg-red-500 text-white hover:bg-red-600",
        variant === "ghost" &&
          "text-admin-text-soft hover:bg-white/5 hover:text-white",

        className
      )}
      {...props}
    >
      {isLoading ? "..." : children}
    </button>
  );
}