import { CheckCircle2, LockKeyhole } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import MarketingFooter from "@/components/marketing/MarketingFooter.jsx";
import MarketingHeader from "@/components/marketing/MarketingHeader.jsx";
import Button from "@/components/ui/Button.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Input from "@/components/ui/Input.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { useCourse } from "@/hooks/useCourses.js";
import { useCompleteCheckout, usePaymentStatus } from "@/hooks/usePayments.js";
import { useEnrollments } from "@/hooks/useProgress.js";
import { formatMinutes } from "@/utils/index.js";

export default function CheckoutPage() {
  const { courseId } = useParams();
  const courseQuery = useCourse(courseId);
  const paymentStatusQuery = usePaymentStatus(courseId);
  const enrollmentsQuery = useEnrollments();
  const checkoutMutation = useCompleteCheckout(courseId);
  const [values, setValues] = useState({
    cardholderName: "Gloria Rodriguez",
    cardNumber: "4242 4242 4242 4242",
    expiryDate: "12/28",
    cvv: "123",
  });
  const [successPayment, setSuccessPayment] = useState(null);

  const course = courseQuery.data;
  const isEnrolled = useMemo(
    () => Boolean(enrollmentsQuery.data?.some((item) => item.courseId === courseId)),
    [courseId, enrollmentsQuery.data]
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!course) return;

    try {
      const result = await checkoutMutation.mutateAsync({
        amount: course.price,
        lessonId: course.lessons?.[0]?.id,
        ...values,
      });
      setSuccessPayment(result.payment);
    } catch {
      // The error is already attached to checkoutMutation.error and rendered
      // in the form below — no extra handling needed.
    }
  }

  if (courseQuery.isLoading || paymentStatusQuery.isLoading || enrollmentsQuery.isLoading) {
    return (
      <PageFrame>
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <Spinner label="Loading checkout" />
        </div>
      </PageFrame>
    );
  }

  if (courseQuery.isError) {
    return (
      <PageFrame>
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <ErrorState message={courseQuery.error.message} onAction={() => courseQuery.refetch()} />
        </div>
      </PageFrame>
    );
  }

  if (paymentStatusQuery.isError) {
    return (
      <PageFrame>
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <ErrorState message={paymentStatusQuery.error.message} onAction={() => paymentStatusQuery.refetch()} />
        </div>
      </PageFrame>
    );
  }

  if (!course) {
    return <Navigate to="/courses" replace />;
  }

  const existingPayment = paymentStatusQuery.data?.payment;
  const paid = Boolean(existingPayment || successPayment || isEnrolled);

  return (
    <PageFrame>
      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {paid ? (
          <section className="surface mx-auto max-w-2xl p-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold text-slate-950">Payment successful</h1>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              Your enrollment for <span className="font-semibold text-slate-900">{course.title}</span> is now confirmed.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Transaction: {(successPayment || existingPayment)?.transactionId || "verified"}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to={`/courses/${course.id}/preview`} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                Go back to page
              </Link>
              <Link to={`/courses/${course.id}`} className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Go to course
              </Link>
            </div>
          </section>
        ) : (
          <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <form className="surface p-8" onSubmit={handleSubmit}>
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                <LockKeyhole className="h-4 w-4" />
                Secure checkout
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-slate-950">Complete your enrollment</h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                This is a mock payment gateway. Enter your card details and we&apos;ll run a fake verification before enrolling you.
              </p>

              <div className="mt-8 grid gap-4">
                <Input label="Cardholder name" name="cardholderName" value={values.cardholderName} onChange={handleChange} required />
                <Input label="Card number" name="cardNumber" value={values.cardNumber} onChange={handleChange} required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Expiry date" name="expiryDate" value={values.expiryDate} onChange={handleChange} required />
                  <Input label="CVV" name="cvv" value={values.cvv} onChange={handleChange} required />
                </div>
              </div>

              {checkoutMutation.error ? <p className="mt-4 text-sm text-rose-600">{checkoutMutation.error.message}</p> : null}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button type="submit" disabled={checkoutMutation.isPending}>
                  {checkoutMutation.isPending ? "Verifying payment..." : `Pay $${course.price}`}
                </Button>
                <Link to={`/courses/${course.id}/preview`} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                  Cancel
                </Link>
              </div>
            </form>

            <aside className="surface p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Order summary</p>
              <h2 className="mt-4 text-2xl font-semibold text-slate-950">{course.title}</h2>
              <p className="mt-2 text-sm text-slate-500">{course.instructorName}</p>
              <img src={course.thumbnail} alt={course.title} className="mt-6 h-48 w-full rounded-[1.5rem] object-cover" />

              <div className="mt-6 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Course access</span>
                  <span className="font-semibold text-slate-950">${course.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Duration</span>
                  <span>{formatMinutes(course.durationMinutes)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total lessons</span>
                  <span>{course.totalLessons}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-950">
                  <span>Total</span>
                  <span>${course.price}</span>
                </div>
              </div>
            </aside>
          </section>
        )}
      </main>
    </PageFrame>
  );
}

function PageFrame({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_25%),linear-gradient(180deg,#ffffff_0%,#eef4ff_100%)]">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}
