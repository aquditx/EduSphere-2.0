import { Filter, Search as SearchIcon, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CourseCard from "@/components/course/CourseCard.jsx";
import MarketingFooter from "@/components/marketing/MarketingFooter.jsx";
import MarketingHeader from "@/components/marketing/MarketingHeader.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Modal from "@/components/ui/Modal.jsx";
import Select from "@/components/ui/Select.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { useCourses, usePrefetchCourse } from "@/hooks/useCourses.js";
import { useDebouncedValue } from "@/hooks/useDebouncedValue.js";
import { useEnrollments } from "@/hooks/useProgress.js";
import { cn } from "@/utils/index.js";

const PAGE_SIZE = 12;
const MAX_SCROLL_PAGES = 2; // auto-append up to 2 extra pages via infinite scroll

// Static options used by the sidebar — categories the backend catalog exposes.
const categoryOptions = [
  "Tech",
  "Business",
  "Design",
  "Personal Development",
  "Misc",
];
const languageOptions = ["English", "Spanish"];
const levelOptions = ["Beginner", "Intermediate", "Advanced"];
const ratingOptions = [
  { label: "4.5 & up", value: "4.5" },
  { label: "4.0 & up", value: "4" },
  { label: "3.5 & up", value: "3.5" },
  { label: "Any rating", value: "" },
];
const priceOptions = [
  { label: "Free", value: "free" },
  { label: "Paid", value: "paid" },
  { label: "Any price", value: "any" },
];
const durationOptions = [
  { label: "Under 2 hours", value: "under-2" },
  { label: "2 – 10 hours", value: "2-10" },
  { label: "10+ hours", value: "10-plus" },
  { label: "Any length", value: "" },
];

export default function CourseListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [scrollPages, setScrollPages] = useState(0);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const prefetchCourse = usePrefetchCourse();
  const enrollmentsQuery = useEnrollments();
  const sentinelRef = useRef(null);

  const filters = {
    search: searchParams.get("search") || "",
    category: searchParams.getAll("category"),
    level: searchParams.getAll("level"),
    language: searchParams.getAll("language"),
    rating: searchParams.get("rating") || "",
    price: searchParams.get("price") || "any",
    duration: searchParams.get("duration") || "",
    sort: searchParams.get("sort") || "relevance",
    instructorId: searchParams.get("instructor") || "",
    page: Number(searchParams.get("page") || 1),
  };
  const debouncedSearch = useDebouncedValue(filters.search, 300);

  // Reset infinite-scroll accumulator whenever any filter (except scroll itself) changes.
  const filterSignature = JSON.stringify({
    search: debouncedSearch,
    category: filters.category,
    level: filters.level,
    language: filters.language,
    rating: filters.rating,
    price: filters.price,
    duration: filters.duration,
    sort: filters.sort,
    page: filters.page,
  });
  useEffect(() => {
    setScrollPages(0);
  }, [filterSignature]);

  const effectivePageSize = PAGE_SIZE * (1 + scrollPages);

  const queryFilters = useMemo(
    () => ({
      search: debouncedSearch,
      category: filters.category,
      level: filters.level,
      language: filters.language,
      rating: filters.rating,
      price: filters.price,
      duration: filters.duration,
      sort: filters.sort,
      instructorId: filters.instructorId,
      status: "approved",
      page: filters.page,
      pageSize: effectivePageSize,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedSearch, filterSignature, effectivePageSize]
  );
  const coursesQuery = useCourses(queryFilters);

  const courses = coursesQuery.data?.items || [];
  const pagination = coursesQuery.data?.pagination;
  const totalItems = pagination?.totalItems || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const hasMoreInScroll = scrollPages < MAX_SCROLL_PAGES && courses.length < totalItems && pagination?.hasMore;

  // IntersectionObserver — auto-load next scroll page while below the auto-load cap.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMoreInScroll && !coursesQuery.isFetching) {
          setScrollPages((value) => Math.min(value + 1, MAX_SCROLL_PAGES));
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMoreInScroll, coursesQuery.isFetching]);

  function updateParams(updater) {
    const next = new URLSearchParams(searchParams);
    updater(next);
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

  function goToPage(page) {
    updateParams((next) => next.set("page", String(page)));
    setScrollPages(0);
    window.scrollTo({ top: 360, behavior: "smooth" });
  }

  function clearFilters() {
    const next = new URLSearchParams();
    next.set("sort", "relevance");
    next.set("page", "1");
    setSearchParams(next, { replace: true });
  }

  const activeFilterChips = [];
  filters.category.forEach((value) => {
    activeFilterChips.push({ key: `cat-${value}`, label: value, onRemove: () => toggleMultiValue("category", value) });
  });
  filters.level.forEach((value) => {
    activeFilterChips.push({ key: `lvl-${value}`, label: value, onRemove: () => toggleMultiValue("level", value) });
  });
  filters.language.forEach((value) => {
    activeFilterChips.push({ key: `lang-${value}`, label: value, onRemove: () => toggleMultiValue("language", value) });
  });
  if (filters.rating) {
    activeFilterChips.push({ key: "rating", label: `${filters.rating}★ & up`, onRemove: () => setSingleValue("rating", "") });
  }
  if (filters.price && filters.price !== "any") {
    activeFilterChips.push({
      key: "price",
      label: filters.price === "free" ? "Free" : "Paid",
      onRemove: () => setSingleValue("price", "any"),
    });
  }
  if (filters.duration) {
    const label = durationOptions.find((option) => option.value === filters.duration)?.label || filters.duration;
    activeFilterChips.push({ key: "duration", label, onRemove: () => setSingleValue("duration", "") });
  }

  // Autocomplete suggestions — top 6 title/skill matches from the current
  // search result page (the catalog is already filtered server-side).
  const suggestions = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    if (!term) return [];
    return courses.slice(0, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, courses]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_25%),linear-gradient(180deg,#ffffff_0%,#eef4ff_100%)]">
      <MarketingHeader />

      <main className="pt-24">
        {/* Hero */}
        <section className="mx-auto w-full max-w-7xl px-6 pt-10 pb-8 lg:px-8">
          <div className="flex flex-col gap-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
                <Sparkles className="h-3.5 w-3.5" /> Course Catalog
              </span>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">
                Learn anything. Anywhere. At your pace.
              </h1>
              <p className="mt-4 max-w-2xl text-base text-slate-500 lg:text-lg">
                Explore {totalItems > 0 ? totalItems : "50"}+ courses across Tech, Business, Design, Personal Development, and more. No account required to browse.
              </p>
            </div>

            {/* Big search with autocomplete */}
            <div className="relative w-full max-w-3xl">
              <label className="flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 shadow-soft focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
                <SearchIcon className="h-5 w-5 text-slate-400" />
                <input
                  className="h-full w-full bg-transparent text-base outline-none placeholder:text-slate-400"
                  value={filters.search}
                  onChange={(event) => setSearch(event.target.value)}
                  onFocus={() => setSuggestionsOpen(true)}
                  onBlur={() => setTimeout(() => setSuggestionsOpen(false), 150)}
                  placeholder="Search by course, instructor, skill, or category"
                  aria-label="Search courses"
                />
                {filters.search ? (
                  <button
                    type="button"
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </label>

              {suggestionsOpen && suggestions.length > 0 ? (
                <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
                  <ul>
                    {suggestions.map((course) => (
                      <li key={course.id}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-4 px-5 py-3 text-left transition hover:bg-slate-50"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            setSearch(course.title);
                            setSuggestionsOpen(false);
                            prefetchCourse(course.id);
                          }}
                        >
                          <img src={course.thumbnail} alt="" className="h-10 w-14 rounded-lg object-cover" loading="lazy" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-950">{course.title}</p>
                            <p className="truncate text-xs text-slate-500">
                              {course.category} · {course.instructorName}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {activeFilterChips.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Active filters</span>
                {activeFilterChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onRemove}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-700"
                  >
                    {chip.label}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                <button type="button" className="text-xs font-semibold text-brand-600 hover:text-brand-700" onClick={clearFilters}>
                  Clear all
                </button>
              </div>
            ) : null}
          </div>
        </section>

        {/* Catalog body */}
        <section className="mx-auto w-full max-w-7xl px-6 pb-16 lg:px-8">
          {/* Mobile filter button */}
          <div className="mb-6 lg:hidden">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            {/* Desktop sidebar filters (sticky) */}
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <FilterSidebar filters={filters} onToggleMultiValue={toggleMultiValue} onSetSingleValue={setSingleValue} onClear={clearFilters} />
              </div>
            </aside>

            {/* Results column */}
            <div className="space-y-6">
              <div className="surface flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-slate-500">
                  {coursesQuery.isLoading
                    ? "Loading results..."
                    : `Showing ${courses.length.toLocaleString()} of ${totalItems.toLocaleString()} courses`}
                </p>
                <div className="w-full md:w-72">
                  <Select value={filters.sort} onChange={(event) => setSingleValue("sort", event.target.value)} aria-label="Sort results">
                    <option value="relevance">Relevance</option>
                    <option value="most-popular">Most popular</option>
                    <option value="highest-rated">Highest rated</option>
                    <option value="newest">Newest</option>
                    <option value="trending">Trending</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </Select>
                </div>
              </div>

              {coursesQuery.isLoading && courses.length === 0 ? <Spinner label="Loading courses" /> : null}
              {coursesQuery.isError ? <ErrorState message={coursesQuery.error.message} onAction={() => coursesQuery.refetch()} /> : null}

              {!coursesQuery.isLoading && !coursesQuery.isError && courses.length > 0 ? (
                <>
                  <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {courses.map((course) => {
                      const isEnrolled = Boolean(enrollmentsQuery.data?.some((item) => item.courseId === course.id));
                      return (
                        <CourseCard
                          key={course.id}
                          course={course}
                          onHover={prefetchCourse}
                          instructorHref={`/instructor/${course.instructorId}/profile`}
                          actionLabel={isEnrolled ? "Continue learning" : "View course"}
                          actionHref={isEnrolled ? `/courses/${course.id}` : `/courses/${course.id}/preview`}
                          actionVariant={isEnrolled ? "secondary" : "primary"}
                        />
                      );
                    })}
                  </section>

                  {/* Sentinel — triggers auto-load until cap */}
                  <div ref={sentinelRef} aria-hidden="true" className="h-4" />

                  {coursesQuery.isFetching && courses.length > 0 ? (
                    <div className="flex justify-center py-4">
                      <Spinner label="Loading more" />
                    </div>
                  ) : null}

                  {/* Hybrid pagination footer */}
                  <div className="mt-8 flex flex-col items-center gap-4 border-t border-slate-200 pt-8">
                    {hasMoreInScroll ? null : pagination?.hasMore ? (
                      <button
                        type="button"
                        onClick={() => setScrollPages((value) => value + 1)}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-soft transition hover:-translate-y-0.5 hover:shadow-xl"
                      >
                        Load more courses
                      </button>
                    ) : (
                      <p className="text-sm text-slate-500">You've reached the end of this page.</p>
                    )}

                    <Pagination currentPage={filters.page} totalPages={totalPages} onPageChange={goToPage} />
                  </div>
                </>
              ) : null}

              {!coursesQuery.isLoading && !coursesQuery.isError && courses.length === 0 ? (
                <EmptyState
                  title="No courses found"
                  message="Try adjusting your filters or searching for something different."
                  action={
                    <button className="font-semibold text-brand-600" onClick={clearFilters}>
                      Clear all filters
                    </button>
                  }
                />
              ) : null}
            </div>
          </div>
        </section>

        <MarketingFooter />
      </main>

      {/* Mobile filter modal */}
      <Modal open={mobileFiltersOpen} title="Filters" onClose={() => setMobileFiltersOpen(false)}>
        <FilterSidebar filters={filters} onToggleMultiValue={toggleMultiValue} onSetSingleValue={setSingleValue} onClear={clearFilters} />
      </Modal>
    </div>
  );
}

function FilterSidebar({ filters, onToggleMultiValue, onSetSingleValue, onClear }) {
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Filters</h2>
        <button className="text-xs font-semibold text-brand-600 hover:text-brand-700" onClick={onClear}>
          Reset
        </button>
      </div>

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

      <FilterSection title="Language">
        {languageOptions.map((option) => (
          <FilterCheck
            key={option}
            label={option}
            checked={filters.language.includes(option)}
            onChange={() => onToggleMultiValue("language", option)}
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
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function FilterCheck({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600 hover:text-slate-900">
      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function FilterRadio({ name, label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600 hover:text-slate-900">
      <input type="radio" name={name} className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button
        className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:text-slate-400"
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
              "h-10 w-10 rounded-2xl text-sm font-semibold transition",
              page === currentPage ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            )}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>
      <button
        className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:text-slate-400"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}
