import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import RoleChoiceModal from "@/components/auth/RoleChoiceModal.jsx";
import Logo from "@/components/branding/Logo.jsx";

export default function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  function openRoleModal() {
    setMobileOpen(false);
    setRoleModalOpen(true);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link to="/" className="inline-flex">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features">Features</a>
            <Link to="/courses">Catalog</Link>
            <a href="#instructors">Instructors</a>
            <a href="#pricing">Pricing</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/teach" className="text-sm font-medium text-slate-600 transition hover:text-slate-950">
              Teach on EduSphere
            </Link>
            <button className="text-sm font-semibold text-slate-600" onClick={openRoleModal}>
              Sign in
            </button>
            <Link to="/register?role=student" className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Join free
            </Link>
          </div>

          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 md:hidden"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-slate-200 bg-white px-6 py-5 md:hidden">
            <nav className="space-y-4 text-sm font-medium text-slate-600">
              <Link className="block" to="/courses" onClick={() => setMobileOpen(false)}>Catalog</Link>
              <Link className="block" to="/teach" onClick={() => setMobileOpen(false)}>Teach on EduSphere</Link>
              <button className="block text-left font-semibold text-slate-700" onClick={openRoleModal}>Sign in</button>
              <Link className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white" to="/register?role=student" onClick={() => setMobileOpen(false)}>
                Join free
              </Link>
            </nav>
          </div>
        ) : null}
      </header>

      <RoleChoiceModal open={roleModalOpen} onClose={() => setRoleModalOpen(false)} />
    </>
  );
}
