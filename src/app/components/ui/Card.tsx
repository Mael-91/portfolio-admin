export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/5">
      {children}
    </div>
  );
}