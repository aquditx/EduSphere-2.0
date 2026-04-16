import { BookOpen, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import Logo from "@/components/branding/Logo.jsx";
import { useEnrollments } from "@/hooks/useProgress.js";
import { useAuthStore } from "@/store/authStore.js";
import { useUiStore } from "@/store/uiStore.js";
import Button from "@/components/ui/Button.jsx";

const studentLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/courses", label: "Browse catalog" },
  { to: "/student/assessments", label: "Assessments" },
];

const instructorLinks = [
  { to: "/instructor", label: "Overview" },
  { to: "/instructor/courses", label: "Courses" },
  { to: "/instructor/create", label: "Create" },
];

const adminLinks = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/courses", label: "Courses" },
  { to: "/admin/reports", label: "Reports" },
];

function getLinks(role) {
  if (role === "instructor") return instructorLinks;
  if (role === "admin") return adminLinks;
  return studentLinks;
}

export function Navbar({ title, subtitle, searchValue = "", onSearchChange }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <header className="border-b border-slate-200 bg-white/70 px-6 py-6 backdrop-blur">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Container to keep button besides the title */}
        <div className="flex items-start gap-4">
          <button
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            onClick={toggleSidebar}
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <label className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="w-56 bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400"
              value={searchValue}
              onChange={onSearchChange}
              placeholder={onSearchChange ? "Search courses, lessons, mentors" : "Search available in catalog"}
              aria-label="Global search"
              disabled={!onSearchChange}
            />
          </label>
          
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
              {user.avatar || "GL"}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
          {user.role !== "guest" ? (
            <Button variant="secondary" onClick={logout}>
              Sign out
            </Button>
          ) : (
            <Link to="/login" className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function EnrolledCoursesList() {
  const enrollmentsQuery = useEnrollments();
  const enrollments = Array.isArray(enrollmentsQuery.data) ? enrollmentsQuery.data : [];
  // Backend /enrollments JOINs courses, so each enrollment already carries
  // the fields we need to render (title, accent, slug).
  const enrolledCourses = enrollments.map((enrollment) => ({
    id: enrollment.courseId,
    title: enrollment.title || "Untitled course",
    accent: enrollment.accent || "from-slate-500 via-slate-600 to-slate-700",
  }));

  if (enrolledCourses.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-4 text-xs text-slate-500">
        You haven't enrolled in any courses yet.{" "}
        <Link to="/courses" className="font-semibold text-brand-600 hover:text-brand-700">
          Browse the catalog
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-4 space-y-2">
      {enrolledCourses.map((course) => (
        <li key={course.id}>
          <NavLink
            to={`/courses/${course.id}`}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition ${
                isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`
            }
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${course.accent} text-white`}>
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="line-clamp-2 text-xs font-semibold leading-tight">{course.title}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const links = getLinks(user.role);

  if (!sidebarOpen) {
    return null;
  }

  const isStudent = user.role === "student";

  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white/80 px-6 py-8 backdrop-blur xl:flex">
      <Logo />
      <nav className="mt-10 space-y-2" aria-label="Primary">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/dashboard" || link.to === "/instructor" || link.to === "/admin"}
            className={({ isActive }) =>
              `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {isStudent ? (
        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">My courses</p>
          <EnrolledCoursesList />
        </div>
      ) : null}

      <div className="mt-auto rounded-[2rem] bg-slate-950 p-5 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-200">Workspace</p>
        <p className="mt-3 text-lg font-semibold">{user.headline}</p>
        <p className="mt-2 text-sm text-slate-300">Keep learning systems, course operations, and discovery in one place.</p>
      </div>
    </aside>
  );
}

export function PageShell({ title, subtitle, children, searchValue, onSearchChange, fullWidth = false }) {
  return (
    <div className="app-shell flex min-h-screen">
      <Sidebar />
      <main className="min-h-screen flex-1">
        <Navbar title={title} subtitle={subtitle} searchValue={searchValue} onSearchChange={onSearchChange} />
        {/* mx-auto and max-w-7xl added here to reduce dashboard width */}
        <div className={fullWidth ? "p-6 lg:p-8" : "mx-auto max-w-7xl space-y-8 p-6 lg:p-8"}>{children}</div>
      </main>
    </div>
  );
}