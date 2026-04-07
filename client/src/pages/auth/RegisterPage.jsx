import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthFormCard from "@/components/auth/AuthFormCard.jsx";
import { useSignup } from "@/hooks/useAuth.js";

const fields = [
  { name: "name", label: "Full name", type: "text", placeholder: "Gloria Rodriguez" },
  { name: "email", label: "Email address", type: "email", placeholder: "you@company.com" },
  { name: "password", label: "Password", type: "password", placeholder: "Create a password" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: "Gloria Rodriguez",
    email: "gloria+new@novalearn.app",
    password: "password123",
  });
  const signupMutation = useSignup();

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await signupMutation.mutateAsync(values);
    navigate("/dashboard");
  }

  return (
    <AuthFormCard
      title="Create your account"
      description="Join the LMS, enroll in courses, track lesson progress, and unlock your learning dashboard."
      fields={fields}
      values={values}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel="Create account"
      footerText="Already have access?"
      footerLinkText="Sign in"
      footerHref="/login"
      isPending={signupMutation.isPending}
      errorMessage={signupMutation.error?.message}
    />
  );
}

