import { Github, Linkedin, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/branding/Logo.jsx";
import { useAuthStore } from "@/store/authStore.js";

const learnLinks = [
  { label: "Browse courses", to: "/courses" },
  { label: "Become an instructor", to: "/teach" },
  { label: "Student login", to: "/login?role=student" },
  { label: "Student signup", to: "/register?role=student" },
];

const companyLinks = [
  { label: "About", to: "/about" },
  { label: "Blog", to: "/blog" },
  { label: "Careers", to: "/careers" },
  { label: "Privacy policy", to: "/privacy" },
  { label: "Terms of service", to: "/terms" },
];

const socialLinks = [
  { label: "Twitter", to: "https://twitter.com", icon: Twitter },
  { label: "LinkedIn", to: "https://linkedin.com", icon: Linkedin },
  { label: "YouTube", to: "https://youtube.com", icon: Youtube },
  { label: "GitHub", to: "https://github.com", icon: Github },
];

export default function MarketingFooter() {
  const user = useAuthStore((state) => state.user);
  const teachLinks = [
    { label: "Instructor login", to: "/login?role=instructor" },
    { label: "Apply as instructor", to: "/register?role=instructor" },
    { label: "Instructor dashboard", to: user.role === "instructor" ? "/instructor" : "/login?role=instructor" },
    { label: "Teaching resources", to: "/teach" },
  ];

  return (
    <footer className="border-t border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <Link to="/" className="inline-flex">
            <Logo />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">Learn without limits.</p>
          <div className="mt-6 flex items-center gap-3">
            {socialLinks.map(({ label, to, icon: Icon }) => (
              <a
                key={label}
                href={to}
                aria-label={label}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterColumn title="Learn" links={learnLinks} />
        <FooterColumn title="Teach" links={teachLinks} />
        <FooterColumn title="Company" links={companyLinks} />
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© 2025 EduSphere. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link to="/privacy" className="transition hover:text-slate-950">Privacy</Link>
            <span>·</span>
            <Link to="/terms" className="transition hover:text-slate-950">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <div className="mt-5 space-y-3">
        {links.map((link) => (
          <Link key={link.label} to={link.to} className="block text-sm text-slate-600 transition hover:text-slate-950">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
