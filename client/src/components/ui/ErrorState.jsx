import Button from "@/components/ui/Button.jsx";

export default function ErrorState({ title = "Something went wrong", message, actionLabel = "Try again", onAction }) {
  return (
    <div className="surface p-6 text-center">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-3 text-sm text-slate-500">{message}</p>
      {onAction ? (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

