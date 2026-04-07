export default function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">{eyebrow}</p> : null}
        <h2 className="heading-lg">{title}</h2>
        {description ? <p className="mt-3 text-base text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

