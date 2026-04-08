import { BookOpenCheck, GraduationCap, LayoutDashboard, PlaySquare, Settings, Sparkles } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import Logo from "@/components/branding/Logo.jsx";

const links = [
  { to: "/student", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student/courses", label: "My Learning", icon: GraduationCap },
  { to: "/student/learn/product-design-masterclass/lesson-1", label: "Video Player", icon: PlaySquare },
  { to: "/student/assessments", label: "AI Quizzes", icon: BookOpenCheck },
];

export default function AppSidebar() {
  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white/80 px-6 py-8 backdrop-blur xl:flex">
      {/* Added the Home Link to the Logo here too! */}
      <Link to="/" className="mb-10 transition hover:opacity-80">
        <Logo />
      </Link>

      <nav className="space-y-2">
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
            {/* Added a "New" badge for the AI feature to make it pop */}
            {label === "AI Quizzes" && (
              <span className="ml-auto flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700 uppercase">
                <Sparkles className="h-2 w-2" />
                AI
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-[2rem] bg-slate-950 p-5 text-white">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5 text-brand-300" />
          <div>
            <p className="font-semibold">Workspace settings</p>
            <p className="text-sm text-slate-300">Tailor themes and goals.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}