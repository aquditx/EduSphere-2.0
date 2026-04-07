import { cn } from "@/lib/utils.js";

export default function Badge({ children, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700",
        className
      )}
    >
      {children}
    </span>
  );
}

