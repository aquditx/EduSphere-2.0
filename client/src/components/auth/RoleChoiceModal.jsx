import { BookOpen, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button.jsx";
import Modal from "@/components/ui/Modal.jsx";

export default function RoleChoiceModal({ open, onClose }) {
  const navigate = useNavigate();

  function handleNavigate(path) {
    onClose?.();
    navigate(path);
  }

  return (
    <Modal open={open} title="Welcome back - who are you?" onClose={onClose}>
      <div className="grid gap-4 md:grid-cols-2">
        <RoleCard
          icon={GraduationCap}
          title="I'm here to learn"
          body="Access your courses and continue learning."
          buttonLabel="Sign in as student"
          buttonVariant="primary"
          onClick={() => handleNavigate("/login?role=student")}
        />
        <RoleCard
          icon={BookOpen}
          title="I'm here to teach"
          body="Access your instructor dashboard and manage your courses."
          buttonLabel="Sign in as instructor"
          buttonVariant="secondary"
          onClick={() => handleNavigate("/login?role=instructor")}
        />
      </div>
      <p className="mt-6 text-sm text-slate-500">
        New to EduSphere?{" "}
        <Link to="/register?role=student" className="font-semibold text-brand-600" onClick={onClose}>
          Join free
        </Link>{" "}
        ·{" "}
        <Link to="/register?role=instructor" className="font-semibold text-brand-600" onClick={onClose}>
          Apply as instructor
        </Link>
      </p>
    </Modal>
  );
}

function RoleCard({ icon: Icon, title, body, buttonLabel, buttonVariant, onClick }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
      <Button className="mt-6 w-full" variant={buttonVariant} onClick={onClick}>
        {buttonLabel}
      </Button>
    </div>
  );
}
