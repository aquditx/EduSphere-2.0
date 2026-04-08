import SectionHeader from "@/components/common/SectionHeader.jsx";

export default function InstructorsSection() {
  const teachers = [
    { name: "Dr. Aris", exp: "12+ Years", bio: "Expert in Microservices and Distributed Systems. Passionate about scalable architecture." },
    { name: "Prof. Sarah", exp: "8+ Years", bio: "Full-stack veteran specialized in React and Cloud Security. Former Senior Dev at TechCorp." },
    { name: "Manoj Kumar", exp: "10+ Years", bio: "DBMS specialist with a focus on PostgreSQL and performance tuning." },
    { name: "Dr. Elena", exp: "15+ Years", bio: "Research lead in AI and Machine Learning. Dedicated to mentoring student innovators." },
    { name: "Rohan Das", exp: "6+ Years", bio: "DevOps engineer focusing on Docker, Kubernetes, and automated CI/CD pipelines." },
  ];

  return (
    <section id="instructors" className="scroll-mt-24 overflow-hidden bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Meet Your Instructors
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Learn from industry experts with years of experience.
          </p>
        </div>
      </div>

    
      <div className="flex w-max animate-marquee gap-8">
        {[...teachers, ...teachers].map((teacher, index) => (
          <div 
            key={index} 
            className="w-[350px] flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-slate-400 hover:shadow-md"
          >
            <div className="mb-6 flex items-center gap-4">
           
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-lg font-bold text-white">
                {teacher.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h3 className="font-bold text-slate-950">{teacher.name}</h3>
                
                <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                  {teacher.exp}
                </span> 
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed italic">
              "{teacher.bio}"
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}