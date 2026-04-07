import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/dashboard/AppSidebar.jsx";

export default function InstructorLayout() {
  return (
    <div className="app-shell flex min-h-screen">
      <AppSidebar />
      <main className="min-h-screen flex-1">
        <Outlet />
      </main>
    </div>
  );
}

