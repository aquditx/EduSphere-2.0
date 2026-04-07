import { Link } from "react-router-dom";
import Logo from "@/components/branding/Logo.jsx";

export default function MarketingHeader() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
      <Logo />
      <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
        <a href="#features">Features</a>
        <a href="#catalog">Catalog</a>
        <a href="#instructors">Instructors</a>
        <a href="#pricing">Pricing</a>
      </nav>
      <div className="flex items-center gap-3">
        <Link to="/login" className="text-sm font-semibold text-slate-600">
          Sign in
        </Link>
        <Link to="/signup" className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          Start learning
        </Link>
      </div>
    </header>
  );
}
