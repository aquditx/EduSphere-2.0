import { useMemo, useState } from "react";
import Button from "@/components/ui/Button.jsx";

function generateQuestions(lesson) {
  return [
    {
      id: `${lesson.id}-q1`,
      prompt: `What is the primary focus of \"${lesson.title}\"?`,
      options: [
        `Understanding ${lesson.title.toLowerCase()} in practice`,
        "Setting up payroll workflows",
        "Managing unrelated HR requests",
      ],
      answer: 0,
    },
    {
      id: `${lesson.id}-q2`,
      prompt: "Which approach best matches the lesson objective?",
      options: [
        "Use a repeatable framework tied to user outcomes",
        "Skip process and decide from intuition only",
        "Delay validation until after launch",
      ],
      answer: 0,
    },
    {
      id: `${lesson.id}-q3`,
      prompt: "What should you do after completing the lesson?",
      options: [
        "Apply the concept to a concrete workflow or artifact",
        "Ignore feedback and avoid iteration",
        "Mark the course done without practice",
      ],
      answer: 0,
    },
  ];
}

export default function LessonQuiz({ lesson, previousResult, onSubmit, isPending }) {
  const questions = useMemo(() => generateQuestions(lesson), [lesson]);
  const [answers, setAnswers] = useState(() => previousResult?.answers || []);
  const score = previousResult?.score;

  function handleChange(questionIndex, optionIndex) {
    setAnswers((current) => {
      const next = [...current];
      next[questionIndex] = optionIndex;
      return next;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const computedScore = Math.round(
      (questions.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0) / questions.length) * 100
    );
    onSubmit({ answers, score: computedScore });
  }

  return (
    <form className="surface p-6" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">Lesson quiz</h3>
          <p className="mt-2 text-sm text-slate-500">Answer all questions to save your score for this lesson.</p>
        </div>
        {typeof score === "number" ? <div className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">Score {score}%</div> : null}
      </div>
      <div className="mt-6 space-y-6">
        {questions.map((question, questionIndex) => (
          <fieldset key={question.id} className="rounded-2xl border border-slate-200 p-4">
            <legend className="px-1 text-sm font-semibold text-slate-900">{question.prompt}</legend>
            <div className="mt-4 space-y-3">
              {question.options.map((option, optionIndex) => (
                <label key={option} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                  <input
                    type="radio"
                    name={question.id}
                    checked={answers[questionIndex] === optionIndex}
                    onChange={() => handleChange(questionIndex, optionIndex)}
                  />
                  <span className="text-sm text-slate-700">{option}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <Button type="submit" className="mt-6" disabled={answers.length !== questions.length || isPending}>
        {isPending ? "Submitting..." : "Submit quiz"}
      </Button>
    </form>
  );
}

