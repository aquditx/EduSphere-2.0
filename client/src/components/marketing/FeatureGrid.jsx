import { BookOpen, ChartColumnBig, LayoutDashboard, MessageSquareText } from "lucide-react";
import SectionHeader from "@/components/common/SectionHeader.jsx";

const features = [
  {
    title: "Reusable course systems",
    description: "Build curriculum, assessments, and learning paths with modular content blocks.",
    icon: LayoutDashboard,
  },
  {
    title: "Student analytics",
    description: "Track engagement, progress, and outcomes with real-time dashboards and reports.",
    icon: ChartColumnBig,
  },
  {
    title: "Focused course player",
    description: "Deliver lessons with distraction-free playback, notes, and lesson navigation.",
    icon: BookOpen,
  },
  {
    title: "Instructor collaboration",
    description: "Coordinate reviews, publish updates, and communicate with learners in one workspace.",
    icon: MessageSquareText,
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <SectionHeader
        eyebrow="Why EduSphere"
        title="Every screen is tuned for clarity, speed, and real learning momentum."
        description="A modular frontend foundation that feels premium from landing page to lesson player."
      />
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {features.map(({ icon: Icon, title, description }) => (
          <div key={title} className="surface p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-slate-950">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

