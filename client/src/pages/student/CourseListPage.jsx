import { Filter } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CourseCard from "@/components/course/CourseCard.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Input from "@/components/ui/Input.jsx";
import Modal from "@/components/ui/Modal.jsx";
import Select from "@/components/ui/Select.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import MarketingFooter from "@/components/marketing/MarketingFooter.jsx";
import MarketingHeader from "@/components/marketing/MarketingHeader.jsx";
import { seedCourses } from "@/data/mockData.js";
import { useCourses, usePrefetchCourse } from "@/hooks/useCourses.js";
import { useDebouncedValue } from "@/hooks/useDebouncedValue.js";
import { useAuthStore } from "@/store/authStore.js";
import { cn } from "@/utils/index.js";

const categoryOptions = Array.from(new Set(seedCourses.map((course) => course.category)));
const levelOptions = ["Beginner", "Intermediate", "Advanced", "All levels"];
const ratingOptions = [
  { label: "4.5+", value: "4.5" },
  { label: "4.0+", value: "4" },
  { label: "3.5+", value: "3.5" },
  { label: "Any", value: "" },
];
const priceOptions = [
  { label: "Free", value: "free" },
  { label: "Paid", value: "paid" },
  { label: "Any", value: "any" },
];
const durationOptions = [
  { label: "Under 2h", value: "under-2" },
  { label: "2-10h", value: "2-10" },
  { label: "10h+", value: "10-plus" },
];

export default function CourseListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const prefetchCourse = usePrefetchCourse();

  const filters = {
    search: searchParams.get("search") || "",
    category: searchParams.getAll("category"),
    level: searchParams.getAll("level"),
    rating: searchParams.get("rating") || "",
    price: searchParams.get("price") || "any",
    duration: searchParams.get("duration") || "",
    sort: searchParams.get("sort") || "relevance",
    instructorId: searchParams.get("instructor") || "",
    page: Number(searchParams.get("page") || 1),
  };
  const debouncedSearch = useDebouncedValue(filters.search, 300);

  const queryFilters = useMemo(
    () => ({
      search: debouncedSearch,
      category: filters.category,
      level: filters.level.includes("All levels") ? [] : filters.level,
      rating: filters.rating,
      price: filters.price,
      duration: filters.duration,
      sort: filters.sort,
      instructorId: filters.instructorId,
      status: "approved",
      page: filters.page,
      pageSize: 20,
    }),
    [debouncedSearch, filters.category, filters.duration, filters.instructorId, filters.level, filters.page, filters.price, filters.rating, filters.sort]
  );
  const coursesQuery = useCourses(queryFilters);

  function updateParams(updater) {
    const next = new URLSearchParams(searchParams);
    updater(next);
    if (!next.get("page")) next.set("page", "1");
    setSearchParams(next, { replace: true });
  }

  function setSearch(value) {
    updateParams((next) => {
      if (value) next.set("search", value);
      else next.delete("search");
      next.set("page", "1");
    });
  }

  function toggleMultiValue(key, value) {
    updateParams((next) => {
      const current = new Set(next.getAll(key));
      if (current.has(value)) current.delete(value);
      else current.add(value);
      next.delete(key);
      Array.from(current).forEach((item) => next.append(key, item));
      next.set("page", "1");
    });
  }

  function setSingleValue(key, value) {
    updateParams((next) => {
      if (value && value !== "any") next.set(key, value);
      else next.delete(key);
      if (key !== "page") {
        next.set("page", "1");
      }
    });
  }

  function clearFilters() {
    const next = new URLSearchParams();
    if (filters.search) next.set("search", filters.search);
    next.set("sort", "relevance");
    next.set("page", "1");
    setSearchParams(next, { replace: true });
  }

  const courses = coursesQuery.data?.items || [];
  const pagination = coursesQuery.data?.pagination;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_25%),linear-gradient(180deg,#ffffff_0%,#eef4ff_100%)]">
      <MarketingHeader />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="w-full lg:max-w-2xl">
            <Input
              label="Search courses"
              placeholder="Search courses, skills, or instructors"
              value={filters.search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 lg:hidden"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <FilterSidebar filters={filters} onToggleMultiValue={toggleMultiValue} onSetSingleValue={setSingleValue} onClear={clearFilters} />
          </aside>

          <div className="space-y-6">
            <div className="surface p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-slate-500">
                  {coursesQuery.isLoading ? "Loading results..." : `${(pagination?.totalItems || 0).toLocaleString()} results`}
                </p>
                <div className="w-full md:w-72">
                  <Select value={filters.sort} onChange={(event) => setSingleValue("sort", event.target.value)}>
                    <option value="relevance">Relevance</option>
                    <option value="newest">Newest</option>
                    <option value="highest-rated">Highest rated</option>
                    <option value="most-popular">Most popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </Select>
                </div>
              </div>
            </div>

            {coursesQuery.isLoading ? <Spinner label="Loading courses" /> : null}
            {coursesQuery.isError ? <ErrorState message={coursesQuery.error.message} onAction={() => coursesQuery.refetch()} /> : null}
            {!coursesQuery.isLoading && !coursesQuery.isError && courses.length === 0 ? (
              <EmptyState
                title="No courses found"
                message="Try adjusting your filters."
                action={
                  <button className="font-semibold text-brand-600" onClick={clearFilters}>
                    Clear all filters
                  </button>
                }
              />
            ) : null}

            {!coursesQuery.isLoading && !coursesQuery.isError && courses.length > 0 ? (
              <>
                <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {courses.map((course) => {
                    const isStudent = user.role === "student";
                    return (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onHover={prefetchCourse}
                        instructorHref={`/instructor/${course.instructorId}/profile`}
                        actionLabel={isStudent ? "Go to course" : "Enroll"}
                        actionHref={isStudent ? `/courses/${course.id}` : "/login?role=student"}
                        actionVariant={isStudent ? "secondary" : "primary"}
                      />
                    );
                  })}
                </section>
                <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={(page) => setSingleValue("page", String(page))} />
              </>
            ) : null}
          </div>
        </div>
      </main>

      <MarketingFooter />

      <Modal open={mobileFiltersOpen} title="Filters" onClose={() => setMobileFiltersOpen(false)}>
        <FilterSidebar
          filters={filters}
          onToggleMultiValue={toggleMultiValue}
          onSetSingleValue={setSingleValue}
          onClear={clearFilters}
        />
      </Modal>
    </div>
  );
}

function FilterSidebar({ filters, onToggleMultiValue, onSetSingleValue, onClear }) {
  return (
    <div className="surface p-5">
      <button className="text-sm font-semibold text-brand-600" onClick={onClear}>
        Clear all filters
      </button>

      <FilterSection title="Category">
        {categoryOptions.map((option) => (
          <FilterCheck
            key={option}
            label={option}
            checked={filters.category.includes(option)}
            onChange={() => onToggleMultiValue("category", option)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Level">
        {levelOptions.map((option) => (
          <FilterCheck
            key={option}
            label={option}
            checked={filters.level.includes(option)}
            onChange={() => onToggleMultiValue("level", option)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Rating">
        {ratingOptions.map((option) => (
          <FilterRadio
            key={option.label}
            name="rating"
            label={option.label}
            checked={(filters.rating || "") === option.value}
            onChange={() => onSetSingleValue("rating", option.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Price">
        {priceOptions.map((option) => (
          <FilterRadio
            key={option.label}
            name="price"
            label={option.label}
            checked={(filters.price || "any") === option.value}
            onChange={() => onSetSingleValue("price", option.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Duration">
        {durationOptions.map((option) => (
          <FilterRadio
            key={option.label}
            name="duration"
            label={option.label}
            checked={(filters.duration || "") === option.value}
            onChange={() => onSetSingleValue("duration", option.value)}
          />
        ))}
      </FilterSection>
    </div>
  );
}

function FilterSection({ title, children }) {
  return (
    <section className="mt-6 border-t border-slate-200 pt-6">
      <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function FilterCheck({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 text-sm text-slate-600">
      <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function FilterRadio({ name, label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 text-sm text-slate-600">
      <input type="radio" name={name} className="h-4 w-4 border-slate-300" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <button
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:text-slate-400"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
      <div className="flex flex-wrap items-center gap-2">
        {pages.map((page) => (
          <button
            key={page}
            className={cn(
              "h-11 w-11 rounded-2xl text-sm font-semibold transition",
              page === currentPage ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            )}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>
      <button
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:text-slate-400"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}
