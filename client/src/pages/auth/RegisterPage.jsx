import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthFormCard from "@/components/auth/AuthFormCard.jsx";
import { useSignup } from "@/hooks/useAuth.js";
import { useAuthStore } from "@/store/authStore.js";
import { cn } from "@/utils/index.js";

export default function RegisterPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [searchParams, setSearchParams] = useSearchParams();
  const role = searchParams.get("role") === "instructor" ? "instructor" : "student";
  const [values, setValues] = useState({
    name: "Gloria Rodriguez",
    email: role === "instructor" ? "creator@EduSphere.app" : "gloria+new@EduSphere.app",
    password: "password123",
    confirmPassword: "password123",
    teachingTopic: "Web Development",
    bio: "I teach practical, project-based workflows that help learners ship real work with confidence.",
  });
  const [errors, setErrors] = useState({});
  const signupMutation = useSignup();

  const fields = useMemo(() => {
    const base = [
      { name: "name", label: "Full name", type: "text", placeholder: "Gloria Rodriguez", error: errors.name },
      { name: "email", label: "Email address", type: "email", placeholder: "you@company.com", error: errors.email },
      { name: "password", label: "Password", type: "password", placeholder: "Create a password", error: errors.password },
      { name: "confirmPassword", label: "Confirm password", type: "password", placeholder: "Re-enter your password", error: errors.confirmPassword },
    ];

    if (role === "instructor") {
      base.push(
        {
          name: "teachingTopic",
          label: "What will you teach?",
          type: "text",
          placeholder: "e.g. Web Development, Design, Data Science",
          error: errors.teachingTopic,
        },
        {
          name: "bio",
          label: "Brief bio",
          type: "textarea",
          placeholder: "Tell learners what you teach and why they should learn from you.",
          maxLength: 300,
          helperText: `${values.bio.length}/300 characters`,
          error: errors.bio,
        }
      );
    }

    return base;
  }, [errors, role, values.bio.length]);

  function setRole(nextRole) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("role", nextRole);
    setSearchParams(nextParams, { replace: true });
    setErrors({});
    setValues((current) => ({
      ...current,
      email: nextRole === "instructor" ? "creator@EduSphere.app" : "gloria+new@EduSphere.app",
    }));
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function validate() {
    const nextErrors = {};
    if (!values.name.trim()) nextErrors.name = "Name is required";
    if (!values.email.trim()) nextErrors.email = "Email is required";
    if (!values.password) nextErrors.password = "Password is required";
    if (values.password !== values.confirmPassword) nextErrors.confirmPassword = "Passwords do not match";
    if (role === "instructor" && !values.teachingTopic.trim()) nextErrors.teachingTopic = "Teaching topic is required";
    if (role === "instructor" && !values.bio.trim()) nextErrors.bio = "Brief bio is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    await signupMutation.mutateAsync({
      name: values.name,
      email: values.email,
      password: values.password,
      role,
      teachingTopic: values.teachingTopic,
      bio: values.bio,
    });

    if (role === "instructor") {
      logout();
      navigate("/instructor-applied");
      return;
    }

    navigate("/student/dashboard");
  }

  return (
    <AuthFormCard
      title={role === "instructor" ? "Apply to teach on EduSphere" : "Create your account"}
      description={role === "instructor" ? "Share a bit about your expertise and we'll review your instructor application." : "Join the LMS, enroll in courses, and unlock your learning dashboard."}
      fields={fields}
      values={values}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel={role === "instructor" ? "Apply as instructor" : "Create student account"}
      isPending={signupMutation.isPending}
      errorMessage={signupMutation.error?.message}
      headerContent={<RoleToggle role={role} onChange={setRole} />}
      formFooter={
        role === "instructor" ? (
          <p className="text-sm text-slate-500">Your account will be reviewed before your instructor dashboard is activated.</p>
        ) : null
      }
      footerContent={
        <p>
          Already have access?{" "}
          <Link to="/login?role=student" className="font-semibold text-brand-600">
            Sign in as student
          </Link>{" "}
          ·{" "}
          <Link to="/login?role=instructor" className="font-semibold text-brand-600">
            Sign in as instructor
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
