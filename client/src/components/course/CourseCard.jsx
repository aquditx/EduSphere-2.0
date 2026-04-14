import { Clock3, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button.jsx";
import { formatMinutes } from "@/utils/index.js";

function computeBadges(course) {
  const badges = [];
  const createdAt = course.createdAt ? new Date(course.createdAt) : null;
  const daysOld = createdAt ? (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24) : Infinity;
  if ((course.enrollmentCount || 0) >= 15000) {
    badges.push({ label: "Bestseller", tone: "bg-amber-100 text-amber-800" });
  }
  if (daysOld <= 60) {
    badges.push({ label: "New", tone: "bg-emerald-100 text-emerald-800" });
  }
  if ((course.trendingScore || 0) >= 90 && badges.length < 2) {
    badges.push({ label: "Trending", tone: "bg-rose-100 text-rose-800" });
  }
  return badges.slice(0, 2);
}

export default function CourseCard({ course, onHover, instructorHref, actionLabel, actionHref, actionVariant = "primary" }) {
  const courseHref = `/courses/${course.id}/preview`;
  const badges = computeBadges(course);
  const topSkills = Array.isArray(course.skills) ? course.skills.slice(0, 3) : [];
  const enrollmentLabel = (course.enrollmentCount || 0).toLocaleString();

  return (
    <article className="surface group relative flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link to={courseHref} onMouseEnter={() => onHover?.(course.id)} onFocus={() => onHover?.(course.id)} className="relative block overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          loading="lazy"
          className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {badges.length > 0 ? (
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span
                key={badge.label}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] shadow-sm ${badge.tone}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
          <span>{course.category}</span>
          <span>{course.level}</span>
        </div>
        <Link to={courseHref} onMouseEnter={() => onHover?.(course.id)} onFocus={() => onHover?.(course.id)}>
          <h3 className="mt-3 text-xl font-semibold text-slate-950 transition group-hover:text-brand-600">{course.title}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{course.subtitle}</p>

        {topSkills.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {topSkills.map((skill) => (
              <span key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                {skill}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
          {instructorHref ? (
            <Link to={instructorHref} className="inline-flex items-center gap-1 font-medium text-slate-700 transition hover:text-brand-600">
              {course.instructorName}
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1">{course.instructorName}</span>
          )}
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {course.ratingAverage} ({course.ratingCount?.toLocaleString?.() || course.ratingCount})
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-4 w-4" /> {enrollmentLabel}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-4 w-4" /> {formatMinutes(course.durationMinutes)}
          </span>
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-lg font-semibold text-slate-950">
              {Number(course.price) > 0 ? `$${course.price}` : <span className="text-emerald-600">Free</span>}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {course.language || "English"}
            </span>
          </div>
          {actionLabel && actionHref ? (
            <div className="mt-4">
              <Link to={actionHref}>
                <Button variant={actionVariant} className="w-full">
                  {actionLabel}
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
