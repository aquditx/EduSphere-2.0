import { useState } from "react";
import Badge from "@/components/common/Badge.jsx";
import Button from "@/components/ui/Button.jsx";
import Modal from "@/components/ui/Modal.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { PageShell } from "@/components/layout/PageShell.jsx";
import { useInstructorRevenue, useRequestPayout } from "@/hooks/useInstructorHooks.js";

export default function InstructorRevenuePage() {
  const revenueQuery = useInstructorRevenue();
  const requestPayoutMutation = useRequestPayout();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (revenueQuery.isLoading) {
    return (
      <PageShell title="Revenue" subtitle="Manage earnings, payouts, and transaction history.">
        <Spinner label="Loading revenue data" />
      </PageShell>
    );
  }

  if (revenueQuery.isError) {
    return (
      <PageShell title="Revenue" subtitle="Manage earnings, payouts, and transaction history.">
        <ErrorState message={revenueQuery.error.message} onAction={() => revenueQuery.refetch()} />
      </PageShell>
    );
  }

  const { summary, transactions, payoutHistory } = revenueQuery.data;
  const availableBalance = parseFloat(summary.currentBalance.replace(/[^0-9.-]+/g, "")) || 0;

  return (
    <PageShell title="Revenue" subtitle="Manage earnings, payouts, and transaction history.">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="surface p-6">
          <p className="text-sm text-slate-500">Lifetime earnings</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{summary.lifetimeEarnings}</p>
        </div>
        <div className="surface p-6">
          <p className="text-sm text-slate-500">Current balance</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{summary.currentBalance}</p>
        </div>
        <div className="surface p-6">
          <p className="text-sm text-slate-500">Pending earnings</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{summary.pendingEarnings}</p>
        </div>
      </section>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Payout history</h2>
          <p className="mt-2 text-sm text-slate-500">Review your past payout requests and status.</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)} disabled={availableBalance <= 0 || requestPayoutMutation.isPending}>
          Request payout
        </Button>
      </div>

      <section className="surface overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Payout history</div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-left text-sm uppercase tracking-[0.14em] text-slate-500">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {payoutHistory.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-sm text-slate-700">{item.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{item.amount}</td>
                  <td className="px-6 py-4 text-sm text-slate-700"><Badge className={item.status === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>{item.status}</Badge></td>
                  <td className="px-6 py-4 text-sm text-slate-700">{item.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface p-6">
        <h2 className="text-xl font-semibold text-slate-950">Transaction log</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-[0.14em]">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Net</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-6 py-4 text-slate-700">{tx.studentName}</td>
                  <td className="px-6 py-4 text-slate-700">{tx.courseTitle}</td>
                  <td className="px-6 py-4 text-slate-700">{tx.amount}</td>
                  <td className="px-6 py-4 text-slate-700">{tx.net}</td>
                  <td className="px-6 py-4 text-slate-700">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={isModalOpen}
        title="Request payout"
        onClose={() => setIsModalOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                await requestPayoutMutation.mutateAsync({ amount: availableBalance });
                setIsModalOpen(false);
              }}
              disabled={availableBalance <= 0 || requestPayoutMutation.isPending}
            >
              {requestPayoutMutation.isPending ? "Requesting..." : `Request $${availableBalance.toFixed(2)}`}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">You are requesting {summary.currentBalance} to your connected payout method.</p>
      </Modal>
    </PageShell>
  );
}
