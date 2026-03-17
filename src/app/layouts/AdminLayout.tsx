import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";

export function AdminLayout() {
  return (
    <div className="flex h-screen bg-[#071226] text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenu */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}