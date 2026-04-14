import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/branding/Logo.jsx";
import { useAuthStore } from "@/store/authStore.js";

function dashboardPathFor(role) {
  if (role === "instructor") return "/instructor";
  if (role === "admin") return "/admin";
  return "/dashboard";
}

export default function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isAuthed = Boolean(user?.id) && user.role !== "guest";
  const dashboardHref = dashboardPathFor(user?.role);
  const firstName = (user?.name || "").split(" ")[0] || user?.name;

  return (
    /* OUTER: Solid white background, no blur, fixed to top */
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-200 bg-white">

      {/* INNER: Centered content */}
      <div className="mx-auto flex h-24 w-full max-w-7xl items-center justify-between px-6 lg:px-8">

        <Logo />

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="hover:text-slate-950 transition-colors"
          >
            Home
          </button>
          <a href="#features" className="hover:text-slate-950">Features</a>
          <Link to="/courses" className="hover:text-slate-950">Catalog</Link>
          <a href="#instructors" className="hover:text-slate-950">Instructors</a>
          <a href="#pricing" className="hover:text-slate-950">Pricing</a>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthed ? (
            <>
              <Link
                to={dashboardHref}
                className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 md:inline-flex"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-xs font-semibold text-white">
                  {user.avatar || firstName?.slice(0, 2).toUpperCase() || "ME"}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-slate-950">{firstName}</span>
                  <span className="text-[11px] capitalize text-slate-500">{user.role}</span>
                </div>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:inline-flex"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden text-sm font-semibold text-slate-600 md:inline hover:text-slate-950">
                Sign in
              </Link>
              <Link
                to="/register?role=student"
                className="hidden items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 md:inline-flex"
              >
                Start learning
              </Link>
            </>
          )}

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white p-6 shadow-xl md:hidden">
          <nav className="flex flex-col gap-4 text-sm font-medium text-slate-600">
            <button
              onClick={() => {
                window.scrollTo(0, 0);
                setMobileOpen(false);
              }}
              className="text-left"
            >
              Home
            </button>
            <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
            <Link to="/courses" onClick={() => setMobileOpen(false)}>Catalog</Link>
            <a href="#instructors" onClick={() => setMobileOpen(false)}>Instructors</a>
            <hr className="border-slate-100" />
            {isAuthed ? (
              <>
                <Link to={dashboardHref} onClick={() => setMobileOpen(false)} className="font-semibold text-slate-950">
                  {firstName}'s dashboard
                </Link>
                <button
                  type="button"
                  className="text-left font-semibold text-rose-600"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>
                <Link
                  to="/register?role=student"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                >
                  Start learning
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
