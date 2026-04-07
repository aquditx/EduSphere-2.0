import Button from "@/components/common/Button.jsx";
import SectionHeader from "@/components/common/SectionHeader.jsx";

export default function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="surface overflow-hidden rounded-[2rem] p-8 md:p-10">
        <SectionHeader
          eyebrow="Simple pricing"
          title="Choose a plan that scales from solo instructors to learning teams."
          description="Tailwind-powered SaaS styling with predictable spacing, sharp hierarchy, and high-conversion calls to action."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {[
            { name: "Starter", price: "$19", note: "Best for creators", highlighted: false },
            { name: "Growth", price: "$59", note: "Best for schools", highlighted: true },
            { name: "Scale", price: "$149", note: "Best for orgs", highlighted: false },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[2rem] border p-6 ${plan.highlighted ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50"}`}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em]">{plan.name}</p>
              <div className="mt-5 flex items-end gap-2">
                <span className="text-4xl font-semibold">{plan.price}</span>
                <span className={plan.highlighted ? "text-slate-300" : "text-slate-500"}>/month</span>
              </div>
              <p className={`mt-3 text-sm ${plan.highlighted ? "text-slate-300" : "text-slate-500"}`}>{plan.note}</p>
              <ul className={`mt-6 space-y-3 text-sm ${plan.highlighted ? "text-slate-100" : "text-slate-600"}`}>
                <li>Unlimited courses and students</li>
                <li>Analytics dashboards</li>
                <li>Modern lesson player</li>
              </ul>
              <Button
                variant={plan.highlighted ? "secondary" : "primary"}
                className={`mt-8 w-full ${plan.highlighted ? "bg-white text-slate-950 hover:bg-slate-100" : ""}`}
              >
                Get started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

