import { useEffect } from "react";
import { PageShell } from "@/components/layout/PageShell.jsx";
import CourseCard from "@/components/course/CourseCard.jsx";
import Button from "@/components/ui/Button.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Input from "@/components/ui/Input.jsx";
import Select from "@/components/ui/Select.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { useCourses, usePrefetchCourse } from "@/hooks/useCourses.js";
import { useDebouncedValue } from "@/hooks/useDebouncedValue.js";
import { useUiStore } from "@/store/uiStore.js";

export default function CourseListPage() {
  const filters = useUiStore((state) => state.courseFilters);
  const setCourseFilters = useUiStore((state) => state.setCourseFilters);
  const debouncedSearch = useDebouncedValue(filters.search, 300);
  const prefetchCourse = usePrefetchCourse();
  const queryFilters = { ...filters, search: debouncedSearch, status: "approved" };
  const coursesQuery = useCourses(queryFilters);

  useEffect(() => {
    if (filters.page !== 1) {
      setCourseFilters({ page: 1 });
    }
  }, [debouncedSearch, filters.category, filters.level, filters.duration, filters.rating, filters.sort]);

  const courses = coursesQuery.data?.items || [];
  const pagination = coursesQuery.data?.pagination;

  return (
    <PageShell title="Courses" subtitle="Discover courses with Skillshare-style filtering and real catalog interactions." searchValue={filters.search} onSearchChange={(event) => setCourseFilters({ search: event.target.value })}>
      <section className="surface p-6">
        <div className="grid gap-4 lg:grid-cols-5">
          <Input label="Search" placeholder="Search courses" value={filters.search} onChange={(event) => setCourseFilters({ search: event.target.value })} />
          <Select label="Category" value={filters.category} onChange={(event) => setCourseFilters({ category: event.target.value })}>
            <option>All</option>
            <option>Design</option>
            <option>Development</option>
            <option>AI</option>
          </Select>
          <Select label="Level" value={filters.level} onChange={(event) => setCourseFilters({ level: event.target.value })}>
            <option>All</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </Select>
          <Select label="Duration" value={filters.duration} onChange={(event) => setCourseFilters({ duration: event.target.value })}>
            <option>All</option>
            <option>Short</option>
            <option>Medium</option>
            <option>Long</option>
          </Select>
          <Select label="Minimum rating" value={filters.rating} onChange={(event) => setCourseFilters({ rating: event.target.value })}>
            <option value="">All ratings</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
          </Select>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
          <div className="text-sm text-slate-500">Search is debounced by 300ms and every filter change triggers a real query refetch.</div>
          <Select label="Sort" value={filters.sort} onChange={(event) => setCourseFilters({ sort: event.target.value })}>
            <option value="trending">Trending</option>
            <option value="newest">Newest</option>
            <option value="highest-rated">Highest rated</option>
          </Select>
        </div>
      </section>

      {coursesQuery.isLoading ? <Spinner label="Loading courses" /> : null}
      {coursesQuery.isError ? <ErrorState message={coursesQuery.error.message} onAction={() => coursesQuery.refetch()} /> : null}
      {!coursesQuery.isLoading && !coursesQuery.isError && courses.length === 0 ? (
        <EmptyState title="No courses match your filters" message="Adjust the filters to widen the catalog results." />
      ) : null}
      {!coursesQuery.isLoading && !coursesQuery.isError && courses.length > 0 ? (
        <>
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} onHover={prefetchCourse} />
            ))}
          </section>
          <section className="flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages} • {pagination.totalItems} courses
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" disabled={filters.page <= 1} onClick={() => setCourseFilters({ page: filters.page - 1 })}>
                Previous
              </Button>
              <Button variant="secondary" disabled={!pagination.hasMore} onClick={() => setCourseFilters({ page: filters.page + 1 })}>
                Next
              </Button>
            </div>
          </section>
        </>
      ) : null}
    </PageShell>
  );
}

