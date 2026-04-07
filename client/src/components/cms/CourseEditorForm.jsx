import { Trash2 } from "lucide-react";
import Button from "@/components/ui/Button.jsx";
import Input from "@/components/ui/Input.jsx";
import Select from "@/components/ui/Select.jsx";
import Textarea from "@/components/ui/Textarea.jsx";

function LessonEditor({ moduleIndex, lessonIndex, lesson, onLessonChange, onDeleteLesson }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Lesson title" value={lesson.title} onChange={(event) => onLessonChange(moduleIndex, lessonIndex, "title", event.target.value)} />
        <Input label="Duration (seconds)" type="number" value={lesson.durationSeconds} onChange={(event) => onLessonChange(moduleIndex, lessonIndex, "durationSeconds", event.target.value)} />
        <Input label="Video URL" value={lesson.videoUrl} onChange={(event) => onLessonChange(moduleIndex, lessonIndex, "videoUrl", event.target.value)} />
        <Input label="Captions URL" value={lesson.transcriptUrl} onChange={(event) => onLessonChange(moduleIndex, lessonIndex, "transcriptUrl", event.target.value)} />
      </div>
      <label className="mt-4 flex items-center gap-3 text-sm text-slate-600">
        <input type="checkbox" checked={lesson.preview} onChange={(event) => onLessonChange(moduleIndex, lessonIndex, "preview", event.target.checked)} />
        Available as preview before enrollment
      </label>
      <Textarea label="Lesson description" className="mt-4" value={lesson.description} onChange={(event) => onLessonChange(moduleIndex, lessonIndex, "description", event.target.value)} />
      <div className="mt-4 flex justify-end">
        <Button variant="danger" onClick={() => onDeleteLesson(moduleIndex, lessonIndex)}>
          <Trash2 className="h-4 w-4" />
          Remove lesson
        </Button>
      </div>
    </div>
  );
}

export default function CourseEditorForm({ values, onChange, onSubmit, onAddModule, onDeleteModule, onAddLesson, onLessonChange, onModuleChange, onDeleteLesson, isPending, submitLabel }) {
  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      <section className="surface p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Course title" value={values.title} onChange={(event) => onChange("title", event.target.value)} required />
          <Input label="Subtitle" value={values.subtitle} onChange={(event) => onChange("subtitle", event.target.value)} required />
          <Input label="Thumbnail URL" value={values.thumbnail} onChange={(event) => onChange("thumbnail", event.target.value)} required />
          <Input label="Accent classes" value={values.accent} onChange={(event) => onChange("accent", event.target.value)} required />
          <Select label="Category" value={values.category} onChange={(event) => onChange("category", event.target.value)}>
            <option>Design</option>
            <option>Development</option>
            <option>AI</option>
          </Select>
          <Select label="Level" value={values.level} onChange={(event) => onChange("level", event.target.value)}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </Select>
          <Input label="Duration (minutes)" type="number" value={values.durationMinutes} onChange={(event) => onChange("durationMinutes", event.target.value)} />
          <Input label="Price" type="number" value={values.price} onChange={(event) => onChange("price", event.target.value)} />
          <Select label="Status" value={values.status} onChange={(event) => onChange("status", event.target.value)}>
            <option value="draft">Draft</option>
            <option value="pending">Pending review</option>
            <option value="approved">Approved</option>
          </Select>
        </div>
        <Textarea label="Description" className="mt-4" value={values.description} onChange={(event) => onChange("description", event.target.value)} required />
        <Textarea
          label="Outcomes (one per line)"
          className="mt-4"
          value={values.outcomes.join("\n")}
          onChange={(event) => onChange("outcomes", event.target.value.split(/\r?\n/).filter(Boolean))}
        />
      </section>

      <section className="surface p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Curriculum</h2>
            <p className="mt-2 text-sm text-slate-500">Add modules, lessons, captions, preview access, and video URLs.</p>
          </div>
          <Button type="button" variant="secondary" onClick={onAddModule}>Add module</Button>
        </div>
        <div className="mt-6 space-y-6">
          {values.modules.map((module, moduleIndex) => (
            <div key={module.id} className="rounded-[2rem] border border-slate-200 p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="grid flex-1 gap-4 md:grid-cols-2">
                  <Input label="Module title" value={module.title} onChange={(event) => onModuleChange(moduleIndex, "title", event.target.value)} />
                </div>
                <Button type="button" variant="danger" onClick={() => onDeleteModule(moduleIndex)}>
                  <Trash2 className="h-4 w-4" />
                  Remove module
                </Button>
              </div>
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

      <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : submitLabel}</Button>
    </form>
  );
}

