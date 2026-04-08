import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/branding/Logo.jsx";

export default function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    /* OUTER: Solid white background, no blur, fixed to top */
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-200 bg-white">
      
      {/* INNER: Centered content */}
      <div className="mx-auto flex h-24 w-full max-w-7xl items-center justify-between px-6 lg:px-8">
        
        <Logo />

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <button 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} 
            className="hover:text-slate-950 transition-colors"
          >
            Home
          </button>
          <a href="#features" className="hover:text-slate-950">Features</a>
          <a href="#catalog" className="hover:text-slate-950">Catalog</a>
          <a href="#instructors" className="hover:text-slate-950">Instructors</a>
          <a href="#pricing" className="hover:text-slate-950">Pricing</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-slate-600">
            Sign in
          </Link>
          <Link 
            to="/signup" 
            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Start learning
          </Link>
          
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="bg-white p-6 md:hidden border-t border-slate-100 shadow-xl">
          <nav className="flex flex-col gap-4 text-sm font-medium text-slate-600">
            <button 
              onClick={() => { window.scrollTo(0,0); setMobileOpen(false); }}
              className="text-left"
            >
              Home
            </button>
            <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#instructors" onClick={() => setMobileOpen(false)}>Instructors</a>
            <hr className="border-slate-100" />
            <Link to="/login">Sign in</Link>
          </nav>
        </div>
      )}
    </header>
  );
}