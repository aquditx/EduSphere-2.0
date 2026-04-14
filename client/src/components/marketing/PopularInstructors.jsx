import { Star } from "lucide-react";

const instructors = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Frontend Engineer @ Google",
    rating: 4.9,
    students: "12k",
    image: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 2,
    name: "Arjun Mehta",
    role: "Senior Backend @ Amazon",
    rating: 4.8,
    students: "9k",
    image: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    role: "AI Researcher",
    rating: 4.9,
    students: "15k",
    image: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: 4,
    name: "David Kim",
    role: "Full Stack Dev",
    rating: 4.7,
    students: "7k",
    image: "https://i.pravatar.cc/150?img=4",
  },
];

export default function PopularInstructors() {
  return (
    <section id="instructors" className="bg-white px-6 pb-20 pt-40 md:px-12">
      <div className="mb-10">
        <h2 className="text-3xl font-semibold text-gray-900 md:text-4xl">Popular Instructors</h2>
        <p className="mt-2 text-gray-500">Learn from industry experts with real-world experience</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {instructors.map((inst) => (
          <div
            key={inst.id}
            className="group cursor-pointer rounded-2xl border border-slate-700 bg-slate-500 p-5 text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-600 hover:bg-slate-700 hover:shadow-xl"
          >
            <img src={inst.image} alt={inst.name} className="mb-4 h-16 w-16 rounded-full ring-2 ring-white/20" />

            <h3 className="text-lg font-semibold text-white">{inst.name}</h3>
            <p className="mb-3 text-sm text-slate-300">{inst.role}</p>

            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="font-medium text-white">{inst.rating}</span>
              <span className="text-slate-300">({inst.students} students)</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-center">
        <p className="text-xl font-semibold text-slate-950 md:text-2xl">Learn From the Best!</p>
        <p className="mt-2 text-sm italic text-slate-500 md:text-base">
          "I have not failed. I&apos;ve just found 10,000 ways that won&apos;t work." - Thomas Edison
        </p>
      </div>
    </section>
  );
}
