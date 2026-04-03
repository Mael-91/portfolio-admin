import { cn } from "../../../lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white",
        "placeholder:text-admin-text-soft",
        "focus:outline-none focus:ring-2 focus:ring-admin-accent",
        "transition",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
    className={cn(
        "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white",
        "focus:outline-none focus:ring-2 focus:ring-admin-accent",
        "transition",
        className
      )}
      {...props}
    />
  );
}