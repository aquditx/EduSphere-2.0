import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthFormCard from "@/components/auth/AuthFormCard.jsx";
import { useLogin } from "@/hooks/useAuth.js";

const fields = [
  { name: "email", label: "Email address", type: "email", placeholder: "you@company.com" },
  { name: "password", label: "Password", type: "password", placeholder: "Enter your password" },
];

function getHomeByRole(role) {
  if (role === "instructor") return "/instructor";
  if (role === "admin") return "/admin";
  return "/dashboard";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "gloria@novalearn.app", password: "password123" });
  const loginMutation = useLogin();

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const session = await loginMutation.mutateAsync(values);
    navigate(getHomeByRole(session.user.role));
  }

  return (
    <AuthFormCard
      title="Welcome back"
      description="Sign in to continue learning, manage courses, or review platform operations. Demo accounts: student `gloria@novalearn.app`, instructor `aisha@novalearn.app`, admin `admin@novalearn.app` with password `password123`."
      fields={fields}
      values={values}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel="Sign in"
      footerText="Need an account?"
      footerLinkText="Create one"
      footerHref="/signup"
      isPending={loginMutation.isPending}
      errorMessage={loginMutation.error?.message}
    />
  );
}

