import Button from "@/components/ui/Button.jsx";

export default function Tabs({ items, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-3" role="tablist" aria-label="Course sections">
      {items.map((item) => (
        <Button
          key={item.value}
          variant={value === item.value ? "primary" : "secondary"}
          onClick={() => onChange(item.value)}
          role="tab"
          aria-selected={value === item.value}
          className="px-4 py-2"
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}

