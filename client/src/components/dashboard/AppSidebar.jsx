import { BookMarked, GraduationCap, LayoutDashboard, PlaySquare, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import Logo from "@/components/branding/Logo.jsx";

const links = [
  { to: "/student", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student/courses", label: "Courses", icon: GraduationCap },
  { to: "/student/learn/product-design-masterclass/lesson-1", label: "Player", icon: PlaySquare },
  { to: "/instructor", label: "Instructor", icon: BookMarked },
];

export default function AppSidebar() {
  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white/80 px-6 py-8 backdrop-blur xl:flex">
      <Logo />
      <nav className="mt-10 space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-[2rem] bg-slate-950 p-5 text-white">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5 text-brand-300" />
          <div>
            <p className="font-semibold">Workspace settings</p>
            <p className="text-sm text-slate-300">Tailor themes, teams, and roles.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

