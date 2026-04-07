import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CourseEditorForm from "@/components/cms/CourseEditorForm.jsx";
import { PageShell } from "@/components/layout/PageShell.jsx";
import Button from "@/components/ui/Button.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { useCourse, useDeleteCourse, useUpdateCourse } from "@/hooks/useCourses.js";
import { slugify } from "@/utils/index.js";
import { useDebouncedValue } from "@/hooks/useDebouncedValue.js";

function cloneCourse(course) {
  return {
    ...course,
    modules: course.modules.map((module) => ({ ...module, lessons: module.lessons.map((lesson) => ({ ...lesson })) })),
    tags: course.tags || [],
    language: course.language || "English",
    promoVideoUrl: course.promoVideoUrl || "",
    urlSlug: course.urlSlug || course.slug,
    metaDescription: course.metaDescription || "",
    certificateEnabled: course.certificateEnabled || false,
    discussionEnabled: course.discussionEnabled || false,
    dripEnabled: course.dripEnabled || false,
    enrollmentLimitEnabled: course.enrollmentLimitEnabled || false,
    enrollmentLimit: course.enrollmentLimit || 0,
  };
}

export default function InstructorEditCoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseQuery = useCourse(id);
  const updateCourseMutation = useUpdateCourse();
  const deleteCourseMutation = useDeleteCourse();
  const [activeStep, setActiveStep] = useState(1);
  const [values, setValues] = useState(null);
  const debouncedValues = useDebouncedValue(values, 2000);

  useEffect(() => {
    if (courseQuery.data) {
      setValues(cloneCourse(courseQuery.data));
    }
  }, [courseQuery.data]);

  useEffect(() => {
    if (debouncedValues && !updateCourseMutation.isPending) {
      updateCourseMutation.mutateAsync({ courseId: id, payload: { ...debouncedValues, slug: slugify(debouncedValues.title) } });
    }
  }, [debouncedValues]);

  function handleChange(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleModuleChange(moduleIndex, field, value) {
    setValues((current) => ({
      ...current,
      modules: current.modules.map((module, index) => (index === moduleIndex ? { ...module, [field]: value } : module)),
    }));
  }

  function handleLessonChange(moduleIndex, lessonIndex, field, value) {
    setValues((current) => ({
      ...current,
      modules: current.modules.map((module, index) =>
        index === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, lessonPosition) =>
                lessonPosition === lessonIndex ? { ...lesson, [field]: value } : lesson
              ),
            }
          : module
      ),
    }));
  }

  function handleAddModule() {
    setValues((current) => ({
      ...current,
      modules: [...current.modules, { id: `module-${Date.now()}`, title: "New module", lessons: [] }],
    }));
  }

  function handleDeleteModule(moduleIndex) {
    setValues((current) => ({ ...current, modules: current.modules.filter((_, index) => index !== moduleIndex) }));
  }

  function handleAddLesson(moduleIndex) {
    setValues((current) => ({
      ...current,
      modules: current.modules.map((module, index) =>
        index === moduleIndex
          ? {
              ...module,
              lessons: [
                ...module.lessons,
                {
                  id: `lesson-${Date.now()}`,
                  title: "New lesson",
                  durationSeconds: 600,
                  preview: false,
                  published: true,
                  description: "Lesson description",
                  videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
                  transcriptUrl: "data:text/vtt;charset=utf-8,WEBVTT%0A%0A00%3A00%3A00.000%20--%3E%2000%3A00%3A04.000%0ANew%20lesson%20captions",
                  type: "Video",
                },
              ],
            }
          : module
      ),
    }));
  }

  function handleDeleteLesson(moduleIndex, lessonIndex) {
    setValues((current) => ({
      ...current,
      modules: current.modules.map((module, index) =>
        index === moduleIndex
          ? { ...module, lessons: module.lessons.filter((_, position) => position !== lessonIndex) }
          : module
      ),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await updateCourseMutation.mutateAsync({ courseId: id, payload: { ...values, slug: slugify(values.title) } });
  }

  async function handleDelete() {
    await deleteCourseMutation.mutateAsync(id);
    navigate("/instructor/courses");
  }

  async function handleSaveDraft() {
    await updateCourseMutation.mutateAsync({ courseId: id, payload: { ...values, status: "draft", slug: slugify(values.title) } });
  }

  async function handlePublish() {
    await updateCourseMutation.mutateAsync({ courseId: id, payload: { ...values, status: "approved", slug: slugify(values.title) } });
  }

  if (courseQuery.isLoading || !values) {
    return <PageShell title="Edit course" subtitle="Manage your course content, publishing status, and lesson assets."><Spinner label="Loading course editor" /></PageShell>;
  }

  if (courseQuery.isError) {
    return <PageShell title="Edit course" subtitle="Manage your course content, publishing status, and lesson assets."><ErrorState message={courseQuery.error.message} onAction={() => courseQuery.refetch()} /></PageShell>;
  }

  return (
    <PageShell title="Edit course" subtitle="Manage your course content, publishing status, and lesson assets.">
      <div className="flex justify-between gap-4">
        <Button variant="danger" onClick={handleDelete} disabled={deleteCourseMutation.isPending}>{deleteCourseMutation.isPending ? "Deleting..." : "Delete course"}</Button>
        <div className="text-sm text-slate-500">{updateCourseMutation.isPending ? "Saving changes..." : "All changes are auto-saved."}</div>
      </div>
      <CourseEditorForm
        activeStep={activeStep}
        onStepChange={setActiveStep}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onAddModule={handleAddModule}
        onDeleteModule={handleDeleteModule}
        onAddLesson={handleAddLesson}
        onLessonChange={handleLessonChange}
        onModuleChange={handleModuleChange}
        onDeleteLesson={handleDeleteLesson}
        isPending={updateCourseMutation.isPending}
        saving={updateCourseMutation.isPending}
        submitLabel="Save course"
      />
    </PageShell>
  );
}

