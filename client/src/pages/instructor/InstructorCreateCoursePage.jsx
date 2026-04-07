import { useNavigate } from "react-router-dom";
import CourseEditorForm from "@/components/cms/CourseEditorForm.jsx";
import { PageShell } from "@/components/layout/PageShell.jsx";
import { useCreateCourse } from "@/hooks/useCourses.js";
import { useAuthStore } from "@/store/authStore.js";
import { slugify } from "@/utils/index.js";
import { useState } from "react";

function createLesson() {
  return {
    id: `lesson-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    title: "New lesson",
    durationSeconds: 600,
    preview: false,
    description: "Lesson description",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    transcriptUrl: "data:text/vtt;charset=utf-8,WEBVTT%0A%0A00%3A00%3A00.000%20--%3E%2000%3A00%3A04.000%0ANew%20lesson%20captions",
  };
}

function createModule() {
  return {
    id: `module-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    title: "New module",
    lessons: [createLesson()],
  };
}

function initialValues(user) {
  return {
    title: "",
    subtitle: "",
    description: "",
    category: "Design",
    level: "Beginner",
    durationMinutes: 120,
    price: 49,
    status: "draft",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    accent: "from-slate-700 via-slate-900 to-slate-950",
    outcomes: ["Outcome one", "Outcome two"],
    modules: [createModule()],
    instructorId: user.id,
    instructorName: user.name,
    instructorHeadline: user.headline,
  };
}

export default function InstructorCreateCoursePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const createCourseMutation = useCreateCourse();
  const [values, setValues] = useState(() => initialValues(user));

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
    setValues((current) => ({ ...current, modules: [...current.modules, createModule()] }));
  }

  function handleDeleteModule(moduleIndex) {
    setValues((current) => ({ ...current, modules: current.modules.filter((_, index) => index !== moduleIndex) }));
  }

  function handleAddLesson(moduleIndex) {
    setValues((current) => ({
      ...current,
      modules: current.modules.map((module, index) =>
        index === moduleIndex ? { ...module, lessons: [...module.lessons, createLesson()] } : module
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
    const payload = { ...values, slug: slugify(values.title) };
    const course = await createCourseMutation.mutateAsync(payload);
    navigate(`/instructor/course/${course.id}/edit`);
  }

  return (
    <PageShell title="Create course" subtitle="Build a production-ready course with modules, lessons, captions, and preview rules.">
      <CourseEditorForm
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onAddModule={handleAddModule}
        onDeleteModule={handleDeleteModule}
        onAddLesson={handleAddLesson}
        onLessonChange={handleLessonChange}
        onModuleChange={handleModuleChange}
        onDeleteLesson={handleDeleteLesson}
        isPending={createCourseMutation.isPending}
        submitLabel="Create course"
      />
    </PageShell>
  );
}

