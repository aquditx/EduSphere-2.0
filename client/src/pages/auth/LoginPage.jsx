import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "@/components/ui/Button.jsx";
import AuthFormCard from "@/components/auth/AuthFormCard.jsx";
import { useLogin } from "@/hooks/useAuth.js";
import { cn } from "@/utils/index.js";

const fields = [
  { name: "email", label: "Email address", type: "email", placeholder: "you@company.com" },
  { name: "password", label: "Password", type: "password", placeholder: "Enter your password" },
];

const demoSessions = {
  student: { email: "gloria@EduSphere.app", password: "password123" },
  instructor: { email: "instructor@edusphere.com", password: "instructor123" },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = searchParams.get("role") === "instructor" ? "instructor" : "student";
  const [values, setValues] = useState(demoSessions[role]);
  const loginMutation = useLogin();

  useEffect(() => {
    setValues(demoSessions[role]);
  }, [role]);

  function setRole(nextRole) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("role", nextRole);
    setSearchParams(nextParams, { replace: true });
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await loginMutation.mutateAsync(values);
    navigate(role === "instructor" ? "/instructor" : "/student/dashboard");
  }

  return (
    <AuthFormCard
      title="Welcome back"
      description={role === "instructor" ? "Sign in to manage your instructor dashboard, courses, and learners." : "Sign in to continue learning and pick up where you left off."}
      fields={fields}
      values={values}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel={role === "instructor" ? "Sign in as instructor" : "Sign in as student"}
      isPending={loginMutation.isPending}
      errorMessage={loginMutation.error?.message}
      headerContent={
        <div className="space-y-4">
          <RoleToggle role={role} onChange={setRole} />
          <DemoCredentials role={role} onUse={() => setValues(demoSessions[role])} />
        </div>
      }
      footerContent={
        <p>
          Don&apos;t have an account?{" "}
          <Link to="/register?role=student" className="font-semibold text-brand-600">
            Join as student
          </Link>{" "}
          ·{" "}
          <Link to="/register?role=instructor" className="font-semibold text-brand-600">
            Apply as instructor
          </Link>
        </p>
      }
    />
  );
}

function RoleToggle({ role, onChange }) {
  return (
    <div className="inline-flex rounded-2xl bg-slate-100 p-1">
      {[
        ["student", "Student"],
        ["instructor", "Instructor"],
      ].map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={cn(
            "rounded-2xl px-4 py-2 text-sm font-semibold transition",
            role === value ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:text-slate-950"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function DemoCredentials({ role, onUse }) {
  const demo = demoSessions[role];

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">
          <p className="font-semibold text-slate-950">{role === "instructor" ? "Instructor demo credentials" : "Student demo credentials"}</p>
          <p className="mt-1">Email: {demo.email}</p>
          <p>Password: {demo.password}</p>
        </div>
        <Button type="button" variant="secondary" onClick={onUse}>
          Use demo credentials
        </Button>
      </div>
    </div>
  );
}
