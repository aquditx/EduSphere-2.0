import { Outlet } from "react-router-dom";
import AuthPanel from "@/components/auth/AuthPanel.jsx";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-100 px-6 py-8 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <AuthPanel />
        <div className="flex items-center justify-center">
          <div className="w-full max-w-xl">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

