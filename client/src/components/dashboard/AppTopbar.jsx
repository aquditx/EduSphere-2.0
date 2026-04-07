import { Bell, Search } from "lucide-react";
import { useAuthStore } from "@/store/authStore.js";

export default function AppTopbar({ title, subtitle }) {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex flex-col gap-6 border-b border-slate-200 bg-white/70 px-6 py-6 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4">
          <Search className="h-4 w-4 text-slate-400" />
          <input className="w-56 bg-transparent text-sm outline-none" placeholder="Search courses, lessons, mentors" />
        </div>
        <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600">
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
            {user.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">{user.name}</p>
            <p className="text-xs text-slate-500">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

