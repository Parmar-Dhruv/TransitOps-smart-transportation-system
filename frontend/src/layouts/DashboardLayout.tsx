import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Navbar } from "../components/layout/Navbar";

export const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-background/95">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden pl-64">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8 glass m-4 rounded-3xl border border-white/5 shadow-2xl relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
