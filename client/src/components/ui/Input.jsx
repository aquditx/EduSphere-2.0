import { cn } from "@/utils/index.js";

export default function Input({ className, label, id, error, ...props }) {
  return (
    <div>
      {label ? (
        <label htmlFor={id || props.name} className="mb-2 block text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}
      <input
        id={id || props.name}
        className={cn(
          "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100",
          error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : "",
          className
        )}
        {...props}
      />
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

