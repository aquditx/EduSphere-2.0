import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import Button from "@/components/ui/Button.jsx";
import Input from "@/components/ui/Input.jsx";
import Select from "@/components/ui/Select.jsx";
import Textarea from "@/components/ui/Textarea.jsx";

const steps = [
  { id: 1, title: "Basic info" },
  { id: 2, title: "Media" },
  { id: 3, title: "Curriculum" },
  { id: 4, title: "Pricing" },
  { id: 5, title: "SEO & settings" },
  { id: 6, title: "Review" },
];

function LessonEditor({ moduleIndex, lessonIndex, lesson, onLessonChange, onDeleteLesson }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Lesson title" value={lesson.title} onChange={(event) => onLessonChange(moduleIndex, lessonIndex, "title", event.target.value)} />
        <Select label="Lesson type" value={lesson.type || "Video"} onChange={(event) => onLessonChange(moduleIndex, lessonIndex, "type", event.target.value)}>
          <option>Video</option>
          <option>Article</option>
          <option>Quiz</option>
        </Select>
        <Input label="Duration (seconds)" type="number" value={lesson.durationSeconds} onChange={(event) => onLessonChange(moduleIndex, lessonIndex, "durationSeconds", event.target.value)} />
        <Input label="Video URL" value={lesson.videoUrl} onChange={(event) => onLessonChange(moduleIndex, lessonIndex, "videoUrl", event.target.value)} />
      </div>
      <Textarea label="Lesson description" className="mt-4" value={lesson.description} onChange={(event) => onLessonChange(moduleIndex, lessonIndex, "description", event.target.value)} />
      <label className="mt-4 flex items-center gap-3 text-sm text-slate-600">
        <input type="checkbox" checked={lesson.preview} onChange={(event) => onLessonChange(moduleIndex, lessonIndex, "preview", event.target.checked)} />
        Available as preview before enrollment
      </label>
      <div className="mt-4 flex justify-between gap-4">
        <label className="flex items-center gap-3 text-sm text-slate-600">
          <input type="checkbox" checked={lesson.published ?? true} onChange={(event) => onLessonChange(moduleIndex, lessonIndex, "published", event.target.checked)} />
          Published lesson
        </label>
        <Button variant="danger" onClick={() => onDeleteLesson(moduleIndex, lessonIndex)}>
          <Trash2 className="h-4 w-4" />
          Remove lesson
        </Button>
      </div>
    </div>
  );
}

function SectionHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export default function CourseEditorForm({
  activeStep,
  onStepChange,
  values,
  onChange,
  onSubmit,
  onSaveDraft,
  onPublish,
  onAddModule,
  onDeleteModule,
  onAddLesson,
  onLessonChange,
  onModuleChange,
  onDeleteLesson,
  isPending,
  submitLabel,
  saving,
}) {
  const tagsValue = useMemo(() => (values.tags || []).join(", "), [values.tags]);

  function handleTagsBlur(event) {
    const nextTags = event.target.value
      .split(/,\s*/)
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 10);
    onChange("tags", nextTags);
  }

  function renderStep() {
    if (activeStep === 1) {
      return (
        <section className="surface p-6">
          <SectionHeader title="Basic info" description="Set the course title, subtitle, description, category, and level." />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Course title</label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                value={values.title}
                onChange={(event) => onChange("title", event.target.value)}
                maxLength={80}
                required
              />
              <p className="mt-2 text-xs text-slate-500">{values.title.length}/80</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Subtitle</label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                value={values.subtitle}
                onChange={(event) => onChange("subtitle", event.target.value)}
                maxLength={120}
                required
              />
              <p className="mt-2 text-xs text-slate-500">{values.subtitle.length}/120</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <Textarea value={values.description} onChange={(event) => onChange("description", event.target.value)} className="mt-2" required />
            </div>
            <Select label="Category" value={values.category} onChange={(event) => onChange("category", event.target.value)}>
              <option>Design</option>
              <option>Development</option>
              <option>AI</option>
              <option>Business</option>
            </Select>
            <Select label="Level" value={values.level} onChange={(event) => onChange("level", event.target.value)}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>All levels</option>
            </Select>
            <Input label="Language" value={values.language || "English"} onChange={(event) => onChange("language", event.target.value)} />
            <div>
              <label className="block text-sm font-medium text-slate-700">Tags</label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                value={tagsValue}
                placeholder="Design, Product, UI"
                onChange={(event) => onChange("tags", event.target.value.split(/,\s*/).slice(0, 10))}
                onBlur={handleTagsBlur}
              />
              <p className="mt-2 text-xs text-slate-500">Up to 10 tags.</p>
            </div>
          </div>
        </section>
      );
    }

    if (activeStep === 2) {
      return (
        <section className="surface p-6">
          <SectionHeader title="Thumbnail and media" description="Upload your course artwork and promotional video." />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Thumbnail URL</label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                value={values.thumbnail}
                onChange={(event) => onChange("thumbnail", event.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Promo video URL</label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                value={values.promoVideoUrl || ""}
                onChange={(event) => onChange("promoVideoUrl", event.target.value)}
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>
          {values.thumbnail ? (
            <div className="mt-6 rounded-3xl border border-slate-200 overflow-hidden">
              <img src={values.thumbnail} alt="Thumbnail preview" className="w-full object-cover" />
            </div>
          ) : null}
          {values.promoVideoUrl ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-950 p-4 text-sm text-white">
              Promo video preview is available for URLs from YouTube or Vimeo.
            </div>
          ) : null}
        </section>
      );
    }

    if (activeStep === 3) {
      return (
        <section className="surface p-6">
          <SectionHeader title="Curriculum" description="Structure your course with modules and lessons." />
          <div className="space-y-6">
            {values.modules.map((module, moduleIndex) => (
              <div key={module.id} className="rounded-[2rem] border border-slate-200 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <Input label="Module title" value={module.title} onChange={(event) => onModuleChange(moduleIndex, "title", event.target.value)} />
                  <Button type="button" variant="danger" onClick={() => onDeleteModule(moduleIndex)}>
                    <Trash2 className="h-4 w-4" />
                    Remove module
                  </Button>
                </div>
                <Textarea label="Module description" value={module.description || ""} onChange={(event) => onModuleChange(moduleIndex, "description", event.target.value)} className="mt-4" />
                <div className="mt-5 space-y-4">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <LessonEditor
                      key={lesson.id}
                      moduleIndex={moduleIndex}
                      lessonIndex={lessonIndex}
                      lesson={lesson}
                      onLessonChange={onLessonChange}
                      onDeleteLesson={onDeleteLesson}
                    />
                  ))}
                </div>
                <Button type="button" variant="secondary" className="mt-4" onClick={() => onAddLesson(moduleIndex)}>
                  Add lesson
                </Button>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (activeStep === 4) {
      return (
        <section className="surface p-6">
          <SectionHeader title="Pricing" description="Set standard pricing, discounts, and enrollment limits." />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Price (USD)</label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                type="number"
                min="0"
                step="0.01"
                value={values.price}
                onChange={(event) => onChange("price", Number(event.target.value))}
                disabled={values.free}
              />
            </div>
            <div>
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input type="checkbox" checked={values.free} onChange={(event) => onChange("free", event.target.checked)} />
                Free course
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Discount price</label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                type="number"
                min="0"
                step="0.01"
                value={values.discountPrice || ""}
                onChange={(event) => onChange("discountPrice", Number(event.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Discount expiry</label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                type="date"
                value={values.discountExpiry || ""}
                onChange={(event) => onChange("discountExpiry", event.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input type="checkbox" checked={values.enrollmentLimitEnabled} onChange={(event) => onChange("enrollmentLimitEnabled", event.target.checked)} />
                Enrollment limit
              </label>
              {values.enrollmentLimitEnabled ? (
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                  type="number"
                  min="1"
                  value={values.enrollmentLimit}
                  onChange={(event) => onChange("enrollmentLimit", Number(event.target.value))}
                />
              ) : null}
            </div>
          </div>
        </section>
      );
    }

    if (activeStep === 5) {
      return (
        <section className="surface p-6">
          <SectionHeader title="SEO & settings" description="Fine-tune your URL, metadata, and course experience settings." />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Course URL slug" value={values.urlSlug || values.slug} onChange={(event) => onChange("urlSlug", event.target.value)} />
            <Textarea label="Meta description" value={values.metaDescription || ""} onChange={(event) => onChange("metaDescription", event.target.value)} />
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input type="checkbox" checked={values.certificateEnabled} onChange={(event) => onChange("certificateEnabled", event.target.checked)} />
              Certificate on completion
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input type="checkbox" checked={values.discussionEnabled} onChange={(event) => onChange("discussionEnabled", event.target.checked)} />
              Discussion board enabled
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input type="checkbox" checked={values.dripEnabled} onChange={(event) => onChange("dripEnabled", event.target.checked)} />
              Drip content
            </label>
          </div>
        </section>
      );
    }

    return (
      <section className="surface p-6">
        <SectionHeader title="Review & publish" description="Review course readiness and publish when you're ready." />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Title</p>
            <p className="mt-2 text-slate-950">{values.title}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Status</p>
            <p className="mt-2 text-slate-950">{values.status}</p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-700">Has thumbnail</p>
            <span>{values.thumbnail ? "Yes" : "No"}</span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-700">Has description</p>
            <span>{values.description ? "Yes" : "No"}</span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-700">Has published module</p>
            <span>{values.modules.some((module) => module.lessons.length > 0) ? "Yes" : "No"}</span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-700">Pricing set</p>
            <span>{values.price > 0 || values.free ? "Yes" : "No"}</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <form className="grid gap-8 xl:grid-cols-[0.28fr_1fr]" onSubmit={(event) => onSubmit(event)}>
      <aside className="space-y-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-lg font-semibold text-slate-950">Course setup</h2>
        <p className="text-sm text-slate-500">Complete each step to prepare the course for publishing.</p>
        <div className="space-y-3">
          {steps.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange(step.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium ${activeStep === step.id ? "border-slate-900 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"}`}
            >
              <span className="block text-xs text-slate-500">Step {step.id}</span>
              <span>{step.title}</span>
            </button>
          ))}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <p>{saving ? "Saving draft…" : "Draft autosaved every few seconds."}</p>
        </div>
      </aside>
      <div className="space-y-6">
        {renderStep()}
        <div className="flex flex-wrap items-center gap-3">
          {activeStep > 1 ? (
            <Button type="button" variant="secondary" onClick={() => onStepChange(activeStep - 1)}>
              Back
            </Button>
          ) : null}
          {activeStep < 6 ? (
            <Button type="button" variant="primary" onClick={() => onStepChange(activeStep + 1)}>
              Continue
            </Button>
          ) : null}
          {activeStep === 6 ? (
            <>
              <Button type="button" variant="secondary" onClick={onSaveDraft} disabled={isPending}>
                Save as draft
              </Button>
              <Button type="button" variant="primary" onClick={onPublish} disabled={isPending}>
                Publish course
              </Button>
            </>
          ) : null}
          <Button type="submit" variant="ghost" disabled={isPending}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

